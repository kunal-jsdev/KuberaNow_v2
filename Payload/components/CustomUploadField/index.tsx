'use client';

import {
  type CSSProperties,
  type DragEvent,
  type FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  FieldLabel,
  toast,
  useField,
  useForm,
  useListDrawer,
} from '@payloadcms/ui';
import * as tus from 'tus-js-client';

import UploadIcon from '@/lib/Icons/UploadIcon';
import { unicodeSlugify } from '@/Payload/lib/utilities/slugify';

export interface ExistingVideoDoc {
  id: string;
  title?: string;
  filename?: string;
  videoFileName?: string;
  streamUid?: string;
  ratio?: '16:9' | '9:16';
  thumbnailUrl?: string;
  videoThumbnail?:
    | {
        id: string;
        url?: string;
        filename?: string;
      }
    | string
    | null;
  animatedWebpUrl?: string;
  hlsUrl?: string;
  dashUrl?: string;
  cfStatus?: 'ready' | 'processing' | 'failed' | string;
  r2Key?: string;
  r2Url?: string;
  r2FileSize?: number;
  r2Status?: string;
  createdAt?: string;
  category?: {
    id?: string;
    title?: string;
    slug?: string;
  };
  description?: string;
}

type CfUploadResult = {
  uploadUrl: string;
  streamUid: string;
  hlsUrl: string;
  dashUrl: string;
  thumbnailUrl: string;
  animatedWebpUrl: string;
  r2?: {
    isConfigured: boolean;
    uploadUrl?: string;
    key?: string;
    publicUrl?: string;
    missingKeys?: string[];
  };
};

type UploadPhase = 'idle' | 'requesting' | 'uploading' | 'error';

const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const parsedMaxMb =
  Number(process.env.NEXT_PUBLIC_MAX_VIDEO_UPLOAD_SIZE_MB) ||
  Number(process.env.NEXT_PUBLIC_VIDEO_UPLOAD_MAX_SIZE_MB);

const MAX_VIDEO_SIZE_MB =
  parsedMaxMb && !Number.isNaN(parsedMaxMb) && parsedMaxMb > 0
    ? parsedMaxMb
    : null;

const MAX_BYTES = MAX_VIDEO_SIZE_MB ? MAX_VIDEO_SIZE_MB * 1024 * 1024 : null;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRemainingTime(seconds: number): string {
  if (seconds <= 1) return '1s remaining';
  if (seconds < 60) return `${seconds}s remaining`;
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (mins === 0) return `${hours}h remaining`;
    return `${hours}h ${mins}m remaining`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins}m remaining`;
  return `${mins}m ${secs}s remaining`;
}

function notifyUploadProgress(detail: {
  isUploading: boolean;
  progress: number;
  remainingTime: string;
  previewUrl?: string;
}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('video-upload-progress', { detail }));
  }
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `Unsupported format "${file.type || 'unknown'}". Please upload MP4, MOV or WebM.`;
  }
  if (MAX_BYTES && file.size > MAX_BYTES) {
    return `File too large (${formatBytes(file.size)}). Maximum allowed size is ${MAX_VIDEO_SIZE_MB ? `${MAX_VIDEO_SIZE_MB} MB` : formatBytes(MAX_BYTES)}.`;
  }
  return null;
}

function cleanVideoTitle(filename: string): string {
  let name = filename.replace(/\.[^/.]+$/, '');
  name = name.replace(
    /[_-]?(1080p\d*|720p\d*|4k|2160p|50fps|60fps|30fps|h264|x264|hevc)\b/gi,
    ''
  );
  name = name.replace(/[_-]\s*kuberanow\s*$/i, '');
  name = name.replace(/[_-]+$/g, '');
  name = name.replace(/_/g, ' ');
  name = name.replace(/\s+/g, ' ').trim();
  return name;
}

function probeVideoRatio(file: File): Promise<'16:9' | '9:16'> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;
      video.muted = true;
      video.playsInline = true;

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
        video.removeAttribute('src');
        video.load();
      };

      const timer = setTimeout(() => {
        cleanup();
        resolve('16:9');
      }, 3500);

      video.onloadedmetadata = () => {
        clearTimeout(timer);
        const w = video.videoWidth;
        const h = video.videoHeight;
        cleanup();
        if (h && w && h > w) {
          resolve('9:16');
        } else {
          resolve('16:9');
        }
      };

      video.onerror = () => {
        clearTimeout(timer);
        cleanup();
        resolve('16:9');
      };
    } catch {
      resolve('16:9');
    }
  });
}

function extractVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'auto';
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;
      video.muted = true;
      video.playsInline = true;
      video.currentTime = 0.5;

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
        video.removeAttribute('src');
        video.load();
      };

      const timer = setTimeout(() => {
        cleanup();
        resolve('');
      }, 3000);

      video.onseeked = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            cleanup();
            resolve(dataUrl);
            return;
          }
        } catch {}
        cleanup();
        resolve('');
      };

      video.onerror = () => {
        clearTimeout(timer);
        cleanup();
        resolve('');
      };
    } catch {
      resolve('');
    }
  });
}

async function extractVideoMetadata(file: File): Promise<{
  title?: string;
  description?: string;
}> {
  try {
    const slice = file.slice(0, Math.min(file.size, 512 * 1024));
    const arrayBuffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8');

    const findSequence = (target: string): number => {
      const b0 = target.charCodeAt(0);
      const b1 = target.charCodeAt(1);
      const b2 = target.charCodeAt(2);
      const b3 = target.charCodeAt(3);
      for (let i = 0; i <= bytes.length - 4; i++) {
        if (
          bytes[i] === b0 &&
          bytes[i + 1] === b1 &&
          bytes[i + 2] === b2 &&
          bytes[i + 3] === b3
        ) {
          return i;
        }
      }
      return -1;
    };

    let title: string | undefined;
    let description: string | undefined;

    const namPos = findSequence('\xa9nam');
    if (namPos !== -1) {
      const dataPos = findSequence('data');
      if (dataPos > namPos && dataPos < namPos + 64) {
        const textLen =
          ((bytes[namPos - 4] << 24) |
            (bytes[namPos - 3] << 16) |
            (bytes[namPos - 2] << 8) |
            bytes[namPos - 1]) -
          24;
        if (textLen > 0 && textLen < 500) {
          const raw = decoder
            .decode(bytes.slice(dataPos + 12, dataPos + 12 + textLen))
            .trim();
          if (raw) title = raw;
        }
      }
    }

    let desPos = findSequence('\xa9des');
    if (desPos === -1) {
      desPos = findSequence('desc');
    }
    if (desPos !== -1) {
      const dataPos = findSequence('data');
      if (dataPos > desPos && dataPos < desPos + 64) {
        const textLen =
          ((bytes[desPos - 4] << 24) |
            (bytes[desPos - 3] << 16) |
            (bytes[desPos - 2] << 8) |
            bytes[desPos - 1]) -
          24;
        if (textLen > 0 && textLen < 2000) {
          const raw = decoder
            .decode(bytes.slice(dataPos + 12, dataPos + 12 + textLen))
            .trim();
          if (raw) description = raw;
        }
      }
    }

    return { title, description };
  } catch {
    return {};
  }
}

const s: Record<string, CSSProperties> = {
  wrapper: { width: '100%', display: 'flex', flexDirection: 'column', gap: 8 },

  fieldLabel: {
    fontSize: 13.5,
    fontWeight: 500,
    color: 'var(--theme-elevation-900, #f4f4f5)',
    display: 'block',
    marginBottom: 0,
    letterSpacing: '-0.01em',
  },

  dropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '34px 20px',
    border: '1px solid var(--theme-elevation-200, rgba(255, 255, 255, 0.1))',
    borderRadius: 6,
    textAlign: 'center',
    transition:
      'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
    minHeight: 160,
  },
  dropIconCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--theme-elevation-700, #d4d4d8)',
    marginBottom: 2,
  },
  dropTitle: {
    fontSize: 13.5,
    color: 'var(--theme-elevation-800, #d4d4d8)',
    fontWeight: 400,
    lineHeight: 1.4,
    margin: 0,
  },
  dropSubtitle: {
    fontSize: 12,
    color: 'var(--theme-elevation-500, #71717a)',
    fontWeight: 400,
    lineHeight: 1.4,
    margin: 0,
    marginBottom: 10,
  },
  buttonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '7px 20px',
    background: 'var(--theme-elevation-150, #242528)',
    border: '1px solid var(--theme-elevation-250, rgba(255, 255, 255, 0.14))',
    borderRadius: 5,
    color: 'var(--theme-elevation-900, #ffffff)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    lineHeight: 1.4,
    transition:
      'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
  },
  discardBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 18px',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: 5,
    color: '#f87171',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    lineHeight: 1.4,
    transition: 'all 0.15s ease',
  },
  browseLabel: {
    color: '#3b82f6',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },

  errorBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: 8,
    fontSize: 13,
    color: '#fca5a5',
    lineHeight: 1.5,
  },
  dismissBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(252, 165, 165, 0.7)',
    cursor: 'pointer',
    padding: '2px 6px',
    fontSize: 14,
    lineHeight: 1,
    borderRadius: 4,
    transition: 'color 0.15s ease',
  },
  warningBanner: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '14px 16px',
    background: 'rgba(234, 179, 8, 0.08)',
    border: '1px solid rgba(234, 179, 8, 0.28)',
    borderRadius: 8,
    fontSize: 13,
    color: '#fef08a',
    lineHeight: 1.5,
  },
  warningHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 600,
    fontSize: 13.5,
    color: '#facc15',
  },
  warningKeyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    background: 'rgba(234, 179, 8, 0.15)',
    border: '1px solid rgba(234, 179, 8, 0.35)',
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 11.5,
    fontWeight: 600,
    color: '#fef08a',
  },
};

export const CustomUploadField: FC = () => {
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [cfConfigStatus, setCfConfigStatus] = useState<{
    isChecked: boolean;
    isConfigured: boolean;
    missingKeys: string[];
    message?: string;
  }>({
    isChecked: false,
    isConfigured: true,
    missingKeys: [],
  });

  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const tusUploadRef = useRef<tus.Upload | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUploadUidRef = useRef<string | null>(null);

  const [
    ListDrawer,
    ,
    { closeDrawer: closeListDrawer, openDrawer: openListDrawer },
  ] = useListDrawer({
    collectionSlugs: ['videos-media'],
    selectedCollection: 'videos-media',
    uploads: true,
  });

  useEffect(() => {
    let isMounted = true;

    const checkConfig = async () => {
      try {
        const res = await fetch(
          '/api/videos/get-cloudflare-upload-url?checkOnly=1'
        );
        const json = await res.json().catch(() => ({}));
        if (!isMounted) return;
        if (res.ok && json.configured !== false) {
          setCfConfigStatus({
            isChecked: true,
            isConfigured: true,
            missingKeys: [],
          });
        } else {
          setCfConfigStatus({
            isChecked: true,
            isConfigured: false,
            missingKeys:
              json.missingKeys && json.missingKeys.length > 0
                ? json.missingKeys
                : ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_STREAM_API_TOKEN'],
            message:
              json.error ||
              'Cloudflare Stream credentials are not configured in your .env file.',
          });
        }
      } catch {
        if (!isMounted) return;
        setCfConfigStatus((prev) => ({
          ...prev,
          isChecked: true,
        }));
      }
    };

    void checkConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const { value: streamUid, setValue: setStreamUid } = useField<string>({
    path: 'streamUid',
  });
  const { setValue: setHlsUrl } = useField<string>({ path: 'hlsUrl' });
  const { setValue: setDashUrl } = useField<string>({ path: 'dashUrl' });
  const { setValue: setThumbnailUrl } = useField<string>({
    path: 'thumbnailUrl',
  });
  const { setValue: setAnimatedWebpUrl } = useField<string>({
    path: 'animatedWebpUrl',
  });
  const { setValue: setCfStatus } = useField<string>({ path: 'cfStatus' });
  const { value: currentTitle, setValue: setTitle } = useField<string>({
    path: 'title',
  });
  const { value: currentDescription, setValue: setDescription } =
    useField<string>({
      path: 'description',
    });
  const { setValue: setSlug } = useField<string>({ path: 'slug' });
  const { setValue: setVideoThumbnail } = useField<any>({
    path: 'videoThumbnail',
  });
  const { setValue: setMetaTitle } = useField<string>({
    path: 'meta.title',
  });
  const { setValue: setMetaDescription } = useField<string>({
    path: 'meta.description',
  });
  const { value: currentRatio, setValue: setRatio } = useField<string>({
    path: 'ratio',
  });
  const { value: originalRatio, setValue: setOriginalRatio } = useField<string>(
    {
      path: 'originalRatio',
    }
  );
  const { value: videoFileName, setValue: setVideoFileName } = useField<string>(
    {
      path: 'videoFileName',
    }
  );
  const { value: r2Key, setValue: setR2Key } = useField<string>({
    path: 'r2Key',
  });
  const { setValue: setR2Url } = useField<string>({
    path: 'r2Url',
  });
  const { setValue: setR2FileSize } = useField<number>({
    path: 'r2FileSize',
  });
  const { setValue: setR2Status } = useField<string>({
    path: 'r2Status',
  });

  useEffect(() => {
    if (!streamUid) return;
    let isMounted = true;
    fetch(
      `/api/videos-media?where[streamUid][equals]=${encodeURIComponent(
        streamUid
      )}&limit=1`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const mediaDoc = data?.docs?.[0];
        if (mediaDoc) {
          if (!videoFileName && mediaDoc.filename) {
            setVideoFileName(mediaDoc.filename, true);
          }
          if (!originalRatio && mediaDoc.ratio) {
            setOriginalRatio(mediaDoc.ratio, true);
          }
          if (!r2Key && mediaDoc.r2Key) {
            setR2Key(mediaDoc.r2Key, true);
            if (mediaDoc.r2Url) setR2Url(mediaDoc.r2Url, true);
            if (mediaDoc.r2FileSize) setR2FileSize(mediaDoc.r2FileSize, true);
            setR2Status(mediaDoc.r2Status || 'ready', true);
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [
    streamUid,
    videoFileName,
    setVideoFileName,
    originalRatio,
    setOriginalRatio,
    r2Key,
    setR2Key,
    setR2Url,
    setR2FileSize,
    setR2Status,
  ]);

  const { setModified } = useForm();

  const startUpload = useCallback(
    async (
      file: File,
      previewUrl?: string,
      detectedRatio: '16:9' | '9:16' = '16:9',
      derivedTitle: string = ''
    ) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setPhase('error');
        return;
      }

      if (cfConfigStatus.isChecked && !cfConfigStatus.isConfigured) {
        const msg =
          cfConfigStatus.message ||
          `Cloudflare Stream credentials (${cfConfigStatus.missingKeys.join(
            ', '
          )}) are missing in your .env file. Please add them to upload videos.`;
        setError(msg);
        setPhase('error');
        toast.error(msg);
        notifyUploadProgress({
          isUploading: false,
          progress: 0,
          remainingTime: '',
        });
        return;
      }

      setError(null);
      setPhase('requesting');
      notifyUploadProgress({
        isUploading: true,
        progress: 1,
        remainingTime: '',
        previewUrl,
      });

      let result: CfUploadResult;
      try {
        const queryParams = new URLSearchParams({
          filename: file.name,
          mimeType: file.type || 'video/mp4',
          fileSize: String(file.size),
        });
        const res = await fetch(
          `/api/videos/get-cloudflare-upload-url?${queryParams.toString()}`
        );
        const json = (await res.json().catch(() => ({}))) as {
          data?: CfUploadResult;
          error?: string;
          code?: string;
          missingKeys?: string[];
        };

        if (!res.ok || json.error || !json.data) {
          if (
            json.code === 'CLOUDFLARE_CREDENTIALS_MISSING' ||
            (json.missingKeys && json.missingKeys.length > 0)
          ) {
            setCfConfigStatus({
              isChecked: true,
              isConfigured: false,
              missingKeys: json.missingKeys || [
                'CLOUDFLARE_ACCOUNT_ID',
                'CLOUDFLARE_STREAM_API_TOKEN',
              ],
              message: json.error,
            });
          }
          throw new Error(
            json.error || 'Failed to request upload slot from Cloudflare.'
          );
        }
        result = json.data;
        currentUploadUidRef.current = result.streamUid;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Server error';
        setError(msg);
        setPhase('error');
        notifyUploadProgress({
          isUploading: false,
          progress: 0,
          remainingTime: '',
        });
        toast.error(msg);
        return;
      }

      setPhase('uploading');

      let r2Promise: Promise<boolean> | null = null;
      let r2Success = false;

      if (result.r2?.isConfigured && result.r2?.uploadUrl && result.r2?.key) {
        setR2Status('uploading');
        setR2FileSize(file.size);

        const r2PutUrl = result.r2.uploadUrl;
        const capturedKey = result.r2.key;
        const capturedPublicUrl = result.r2.publicUrl;
        setR2Key(capturedKey);
        if (capturedPublicUrl) setR2Url(capturedPublicUrl);

        r2Promise = fetch(r2PutUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'video/mp4',
          },
          body: file,
        })
          .then((r2Res) => {
            if (r2Res.ok) {
              r2Success = true;
              setR2Key(capturedKey);
              if (capturedPublicUrl) setR2Url(capturedPublicUrl);
              setR2Status('ready');
              return true;
            }
            // eslint-disable-next-line no-console
            console.info(
              `[R2 Backup Note] Direct browser PUT returned HTTP ${r2Res.status}. Server auto-sync will back up from Cloudflare Stream.`
            );
            return false;
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.info(
              '[R2 Backup Note] Direct browser PUT bypassed (CORS/network):',
              err?.message || err,
              '- Server auto-sync will back up from Cloudflare Stream upon completion.'
            );
            return false;
          });
      } else {
        setR2Status('not_configured');
      }

      const startTime = Date.now();
      let lastLoaded = 0;
      let lastTime = startTime;
      let lastCalculatedRemaining = '';

      const upload = new tus.Upload(file, {
        uploadUrl: result.uploadUrl,
        chunkSize: 50 * 1024 * 1024,
        retryDelays: [0, 1000, 3000, 5000, 10000],
        onError: (err) => {
          tusUploadRef.current = null;
          if (currentUploadUidRef.current) {
            fetch('/api/videos/delete-cloudflare-video', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                streamUid: currentUploadUidRef.current,
                r2Key: result?.r2?.key,
              }),
            }).catch(() => {});
            currentUploadUidRef.current = null;
          }

          const errMsg =
            err?.message ||
            'Network connection error during video upload. Please check your network and verify your Cloudflare Stream settings.';
          setError(errMsg);
          setPhase('error');
          notifyUploadProgress({
            isUploading: false,
            progress: 0,
            remainingTime: '',
          });
          toast.error(`Upload failed: ${errMsg}`);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          if (bytesTotal > 0) {
            const pct = Math.min(
              100,
              Math.round((bytesUploaded / bytesTotal) * 100)
            );

            const now = Date.now();
            const timeDiff = (now - lastTime) / 1000;
            if (timeDiff >= 0.5) {
              const bytesDiff = bytesUploaded - lastLoaded;
              const currentSpeed = bytesDiff / timeDiff;

              if (currentSpeed > 0) {
                const remainingBytes = bytesTotal - bytesUploaded;
                const secLeft = Math.max(
                  1,
                  Math.round(remainingBytes / currentSpeed)
                );
                lastCalculatedRemaining = formatRemainingTime(secLeft);
              }
              lastLoaded = bytesUploaded;
              lastTime = now;
            }

            notifyUploadProgress({
              isUploading: true,
              progress: pct,
              remainingTime: lastCalculatedRemaining,
              previewUrl,
            });
          }
        },
        onSuccess: async () => {
          tusUploadRef.current = null;
          currentUploadUidRef.current = null;

          setStreamUid(result.streamUid);
          setHlsUrl(result.hlsUrl);
          setDashUrl(result.dashUrl);
          setThumbnailUrl(result.thumbnailUrl);
          setAnimatedWebpUrl(result.animatedWebpUrl);
          setCfStatus('processing');

          setPhase('idle');
          notifyUploadProgress({
            isUploading: false,
            progress: 100,
            remainingTime: '',
            previewUrl,
          });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('video-thumbnail-ready', {
                detail: {
                  thumbnailUrl: result.thumbnailUrl,
                  streamUid: result.streamUid,
                },
              })
            );
          }

          if (r2Promise) {
            await r2Promise.catch(() => false);
          }

          let finalR2Status = 'not_configured';
          if (r2Success) {
            finalR2Status = 'ready';
          } else if (result.r2?.isConfigured) {
            finalR2Status = 'uploading';
          }

          setR2Status(finalR2Status);

          fetch('/api/videos-media/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: derivedTitle || cleanVideoTitle(file.name),
              filename: file.name,
              streamUid: result.streamUid,
              ratio: detectedRatio,
              hlsUrl: result.hlsUrl,
              dashUrl: result.dashUrl,
              thumbnailUrl: result.thumbnailUrl,
              animatedWebpUrl: result.animatedWebpUrl,
              cfStatus: 'processing',
              r2Key: result.r2?.key || null,
              r2Url: result.r2?.publicUrl || null,
              r2FileSize: file.size,
              r2Status: finalR2Status,
            }),
          }).catch(() => {});

          toast.success(
            result.r2?.isConfigured
              ? 'Video uploaded! Cloudflare Stream transcoding & R2 backup active.'
              : 'Video uploaded! Cloudflare is now transcoding it.'
          );
        },
      });

      tusUploadRef.current = upload;
      upload.start();
    },
    [
      cfConfigStatus,
      setStreamUid,
      setHlsUrl,
      setDashUrl,
      setThumbnailUrl,
      setAnimatedWebpUrl,
      setCfStatus,
      setR2Key,
      setR2Url,
      setR2FileSize,
      setR2Status,
    ]
  );

  const handleFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      let derivedTitle = cleanVideoTitle(file.name);
      let derivedDescription = derivedTitle;
      setVideoFileName(file.name);

      try {
        const metadata = await extractVideoMetadata(file);
        if (metadata.title) {
          derivedTitle = metadata.title;
        }
        if (metadata.description) {
          derivedDescription = metadata.description;
        } else {
          derivedDescription = derivedTitle;
        }
      } catch {}

      setTitle(derivedTitle);
      setDescription(derivedDescription);
      setMetaTitle(derivedTitle);
      setMetaDescription(derivedDescription);

      const generatedSlug = unicodeSlugify({
        data: {},
        req: {} as any,
        valueToSlugify: derivedTitle,
      });
      if (generatedSlug) {
        setSlug(generatedSlug);
      }

      let previewUrl: string | undefined;
      try {
        previewUrl = URL.createObjectURL(file);
      } catch {}

      let detectedRatio: '16:9' | '9:16' =
        (currentRatio as '16:9' | '9:16') || '16:9';
      try {
        detectedRatio = await probeVideoRatio(file);
        setOriginalRatio(detectedRatio);
        setRatio(detectedRatio);
      } catch {}

      extractVideoThumbnail(file).then((localThumb) => {
        if (localThumb && typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('video-thumbnail-ready', {
              detail: { localThumb, previewUrl },
            })
          );
        }
      });

      if (
        currentUploadUidRef.current &&
        currentUploadUidRef.current !== streamUid
      ) {
        fetch('/api/videos/delete-cloudflare-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamUid: currentUploadUidRef.current }),
        }).catch(() => {});
        currentUploadUidRef.current = null;
      }

      startUpload(file, previewUrl, detectedRatio, derivedTitle);
    },
    [
      streamUid,
      currentRatio,
      setOriginalRatio,
      setRatio,
      setTitle,
      setDescription,
      setMetaTitle,
      setMetaDescription,
      setSlug,
      setVideoFileName,
      startUpload,
    ]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (cfConfigStatus.isChecked && !cfConfigStatus.isConfigured) {
        const msg = `Cannot upload video: Cloudflare Stream credentials are missing in your .env file (${cfConfigStatus.missingKeys.join(
          ', '
        )}).`;
        setError(msg);
        toast.error(msg);
        return;
      }
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [cfConfigStatus, handleFile]
  );

  const handleCancelUpload = () => {
    if (tusUploadRef.current) {
      tusUploadRef.current.abort();
      tusUploadRef.current = null;
    }
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    if (currentUploadUidRef.current) {
      fetch('/api/videos/delete-cloudflare-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamUid: currentUploadUidRef.current }),
      }).catch(() => {});
      currentUploadUidRef.current = null;
    }
    setPhase('idle');
    setError(null);
    notifyUploadProgress({
      isUploading: false,
      progress: 0,
      remainingTime: '',
      previewUrl: '',
    });
  };

  const handleDiscardVideo = useCallback(
    (e?: React.MouseEvent, customMessage?: string) => {
      if (e) e.stopPropagation();

      if (tusUploadRef.current) {
        tusUploadRef.current.abort();
        tusUploadRef.current = null;
      }

      if (xhrRef.current) {
        xhrRef.current.abort();
        xhrRef.current = null;
      }

      if (
        (currentUploadUidRef.current &&
          currentUploadUidRef.current !== streamUid) ||
        streamUid
      ) {
        fetch('/api/videos/delete-cloudflare-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streamUid: currentUploadUidRef.current || streamUid,
            r2Key: r2Key || undefined,
          }),
        }).catch(() => {});
      }
      currentUploadUidRef.current = null;

      setStreamUid('');
      setHlsUrl('');
      setDashUrl('');
      setThumbnailUrl('');
      setAnimatedWebpUrl('');
      setCfStatus('processing');
      setR2Key('');
      setR2Url('');
      setR2FileSize(null as any);
      setR2Status('not_configured');
      setRatio('16:9');
      setOriginalRatio('');
      setVideoThumbnail(null);
      setVideoFileName('');
      setPhase('idle');
      setError(null);
      setModified(true);

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      notifyUploadProgress({
        isUploading: false,
        progress: 0,
        remainingTime: '',
        previewUrl: '',
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('video-thumbnail-ready', {
            detail: { localThumb: '', thumbnailUrl: '', streamUid: '' },
          })
        );
        window.dispatchEvent(new CustomEvent('video-discarded'));
      }

      if (customMessage) {
        toast.info(customMessage);
      } else {
        toast.success('Video removed from this post.');
      }
    },
    [
      r2Key,
      streamUid,
      setStreamUid,
      setHlsUrl,
      setDashUrl,
      setThumbnailUrl,
      setAnimatedWebpUrl,
      setCfStatus,
      setR2Key,
      setR2Url,
      setR2FileSize,
      setR2Status,
      setRatio,
      setOriginalRatio,
      setVideoThumbnail,
      setVideoFileName,
      setModified,
    ]
  );

  const lastVerifiedStreamUidRef = useRef<string | null>(null);

  useEffect(() => {
    if (!streamUid || streamUid === lastVerifiedStreamUidRef.current) return;
    lastVerifiedStreamUidRef.current = streamUid;

    let isMounted = true;

    const verifyStreamAndMedia = async () => {
      try {
        const mediaRes = await fetch(
          `/api/videos-media?where[streamUid][equals]=${encodeURIComponent(
            streamUid
          )}&limit=1`
        );
        if (!isMounted) return;

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json().catch(() => null);
          if (Array.isArray(mediaData?.docs) && mediaData.docs.length === 0) {
            handleDiscardVideo(
              undefined,
              'The attached video was deleted from the media library and has been discarded.'
            );
            return;
          }
        }

        const cfRes = await fetch(
          `/api/videos/check-cloudflare-status?streamUid=${encodeURIComponent(
            streamUid
          )}`
        );
        if (!isMounted) return;

        if (cfRes.status === 404) {
          handleDiscardVideo(
            undefined,
            'The attached video was removed from Cloudflare and has been discarded.'
          );
          return;
        }

        const cfData = await cfRes.json().catch(() => null);
        if (cfData?.notFound) {
          handleDiscardVideo(
            undefined,
            'The attached video was removed from Cloudflare and has been discarded.'
          );
        }
      } catch {}
    };

    verifyStreamAndMedia();

    return () => {
      isMounted = false;
    };
  }, [streamUid, handleDiscardVideo]);

  useEffect(() => {
    const handleRemoteDiscard = (e: any) => {
      handleDiscardVideo(undefined, e?.detail?.message);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('request-discard-video', handleRemoteDiscard);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(
          'request-discard-video',
          handleRemoteDiscard
        );
      }
    };
  }, [handleDiscardVideo]);

  const handleSelectExistingVideo = useCallback(
    (video: ExistingVideoDoc) => {
      if (!video?.streamUid) {
        toast.error(
          'The selected video does not have a Cloudflare Stream UID.'
        );
        return;
      }

      setStreamUid(video.streamUid);

      if (video.filename) {
        setVideoFileName(video.filename);
      } else if (video.title) {
        setVideoFileName(
          video.title.includes('.') ? video.title : `${video.title}.mp4`
        );
      }

      const streamDomain =
        process.env.CLOUDFLARE_STREAM_DOMAIN || 'videodelivery.net';
      setHlsUrl(
        video.hlsUrl ||
          `https://${streamDomain}/${video.streamUid}/manifest/video.m3u8`
      );
      setDashUrl(
        video.dashUrl ||
          `https://${streamDomain}/${video.streamUid}/manifest/video.mpd`
      );
      setThumbnailUrl(
        video.thumbnailUrl ||
          `https://${streamDomain}/${video.streamUid}/thumbnails/thumbnail.jpg?time=1s&height=720`
      );
      setAnimatedWebpUrl(
        video.animatedWebpUrl ||
          `https://${streamDomain}/${video.streamUid}/thumbnails/thumbnail.gif`
      );
      setCfStatus(video.cfStatus || 'ready');

      if (video.r2Key) {
        setR2Key(video.r2Key);
        setR2Url(video.r2Url || '');
        setR2FileSize(video.r2FileSize || (null as any));
        setR2Status(video.r2Status || 'ready');
      } else {
        setR2Key('');
        setR2Url('');
        setR2FileSize(null as any);
        setR2Status('not_configured');
      }

      if (video.ratio) {
        setOriginalRatio(video.ratio);
        setRatio(video.ratio);
      }

      if (!currentTitle && video.title) {
        setTitle(video.title);
        setMetaTitle(video.title);
        setSlug(unicodeSlugify({ valueToSlugify: video.title }) || '');
      }
      if (!currentDescription && video.description) {
        setDescription(video.description);
        setMetaDescription(video.description);
      }

      if (video.videoThumbnail) {
        const thumbVal =
          typeof video.videoThumbnail === 'object' &&
          video.videoThumbnail !== null
            ? video.videoThumbnail.id
            : video.videoThumbnail;
        setVideoThumbnail(thumbVal || null);
      } else {
        setVideoThumbnail(null);
      }

      setModified(true);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('video-thumbnail-ready', {
            detail: {
              localThumb: '',
              thumbnailUrl:
                video.thumbnailUrl ||
                `https://${streamDomain}/${video.streamUid}/thumbnails/thumbnail.jpg?time=1s&height=720`,
              streamUid: video.streamUid,
            },
          })
        );
      }

      setPhase('idle');
      setError(null);
      toast.success('Selected existing video from library.');
    },
    [
      currentDescription,
      currentTitle,
      setAnimatedWebpUrl,
      setCfStatus,
      setDashUrl,
      setDescription,
      setHlsUrl,
      setMetaDescription,
      setMetaTitle,
      setRatio,
      setOriginalRatio,
      setR2Key,
      setR2Url,
      setR2FileSize,
      setR2Status,
      setSlug,
      setStreamUid,
      setThumbnailUrl,
      setTitle,
      setVideoFileName,
      setVideoThumbnail,
      setModified,
    ]
  );

  const handleListSelect = useCallback(
    async (args: any) => {
      closeListDrawer();
      if (!args) return;

      let targetDoc: any = null;
      let targetId: string | null = null;

      if (Array.isArray(args) && args.length > 0) {
        const item = args[0];
        if (typeof item === 'object' && item !== null) {
          targetDoc = item.doc || item;
          targetId =
            item.docID ||
            targetDoc.id ||
            targetDoc._id ||
            (typeof item === 'string' ? item : null);
        } else if (typeof item === 'string') {
          targetId = item;
        }
      } else if (typeof args === 'object' && args !== null) {
        targetDoc = args.doc || args;
        targetId =
          args.docID ||
          targetDoc?.id ||
          targetDoc?._id ||
          (typeof args === 'string' ? args : null);
      } else if (typeof args === 'string') {
        targetId = args;
      }

      let videoData = targetDoc;

      if (!videoData?.streamUid && targetId) {
        try {
          const res = await fetch(`/api/videos-media/${targetId}?depth=1`);
          if (res.ok) {
            videoData = await res.json();
          }
        } catch {
          // fallback
        }
      }

      if (videoData?.streamUid) {
        handleSelectExistingVideo(videoData);
      } else if (targetId) {
        toast.error(
          'The selected video does not have a Cloudflare Stream UID.'
        );
      }
    },
    [closeListDrawer, handleSelectExistingVideo]
  );

  const handleTriggerBrowse = () => {
    if (cfConfigStatus.isChecked && !cfConfigStatus.isConfigured) {
      const msg = `Cannot upload video: Cloudflare Stream credentials are missing in your .env file (${cfConfigStatus.missingKeys.join(
        ', '
      )}).`;
      setError(msg);
      toast.error(msg);
      return;
    }
    inputRef.current?.click();
  };

  const hasExistingVideo = Boolean(streamUid);

  const renderDropzoneContent = () => {
    if (phase === 'requesting' || phase === 'uploading') {
      return (
        <>
          <div style={s.dropIconCircle}>
            <UploadIcon />
          </div>

          <div style={s.dropLabel}>
            Uploading video...{' '}
            <button
              type='button'
              style={{
                ...s.browseLabel,
                color: '#ef4444',
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: 'inherit',
                fontFamily: 'inherit',
              }}
              onClick={handleCancelUpload}
            >
              Cancel
            </button>
          </div>
        </>
      );
    }

    let displayFileName = videoFileName || '';
    if (!displayFileName) {
      if (currentTitle) {
        displayFileName = currentTitle.includes('.')
          ? currentTitle
          : `${currentTitle}.mp4`;
      } else {
        displayFileName = 'video.mp4';
      }
    }

    if (hasExistingVideo) {
      return (
        <>
          <div style={s.dropIconCircle}>
            <UploadIcon />
          </div>

          <div
            style={{
              ...s.dropTitle,
              marginBottom: 12,
              wordBreak: 'break-all',
              maxWidth: '90%',
            }}
            title={displayFileName}
          >
            {displayFileName}
          </div>

          <div style={s.buttonRow}>
            <button
              type='button'
              style={s.discardBtn}
              onClick={handleDiscardVideo}
            >
              Discard Video
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <div style={s.dropIconCircle}>
          <UploadIcon />
        </div>

        <div style={s.dropTitle}>Choose a file or drag & drop it here.</div>

        <div style={s.dropSubtitle}>
          {MAX_VIDEO_SIZE_MB
            ? `MP4, MOV, and WebM formats, up to ${MAX_VIDEO_SIZE_MB} MB`
            : 'MP4, MOV, and WebM formats'}
        </div>

        <div style={s.buttonRow}>
          <button
            type='button'
            style={s.actionBtn}
            onClick={handleTriggerBrowse}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2f3136';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                'var(--theme-elevation-150, #242528)';
              e.currentTarget.style.borderColor =
                'var(--theme-elevation-250, rgba(255, 255, 255, 0.14))';
            }}
          >
            Browse File
          </button>
          <button
            type='button'
            style={s.actionBtn}
            onClick={(e) => {
              e.stopPropagation();
              openListDrawer();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2f3136';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                'var(--theme-elevation-150, #242528)';
              e.currentTarget.style.borderColor =
                'var(--theme-elevation-250, rgba(255, 255, 255, 0.14))';
            }}
          >
            Choose from Existing
          </button>
        </div>
      </>
    );
  };

  return (
    <div
      className='field-type upload custom-upload-field'
      style={s.wrapper}
    >
      <style>{`
        .custom-upload-field .field-label .required,
        .custom-upload-field .required {
          color: var(--theme-error-500, #eb5757) !important;
          margin-left: 0.25rem !important;
        }
      `}</style>
      <FieldLabel
        htmlFor='field-uploadVideo'
        label='Upload Video'
        path='uploadVideo'
        required
      />

      {cfConfigStatus.isChecked && !cfConfigStatus.isConfigured && (
        <div style={s.warningBanner}>
          <div style={s.warningHeader}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span>Cloudflare Stream Not Configured</span>
          </div>
          <div style={{ fontSize: 12.5, color: '#fef9c3', opacity: 0.95 }}>
            Video uploads require Cloudflare Stream credentials in your{' '}
            <code
              style={{
                fontFamily: 'monospace',
                background: 'rgba(234, 179, 8, 0.2)',
                padding: '1px 5px',
                borderRadius: 4,
                color: '#fef08a',
                fontWeight: 600,
              }}
            >
              .env
            </code>{' '}
            file:
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginTop: 2,
            }}
          >
            {cfConfigStatus.missingKeys.map((key) => (
              <span
                key={key}
                style={s.warningKeyBadge}
              >
                {key}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={s.errorBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type='button'
            style={s.dismissBtn}
            onClick={() => {
              setError(null);
              setPhase('idle');
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div
        style={{
          ...s.dropzone,
          borderColor: isDragging
            ? '#3b82f6'
            : 'var(--theme-elevation-200, rgba(255, 255, 255, 0.1))',
          backgroundColor: isDragging
            ? 'rgba(59, 130, 246, 0.05)'
            : 'var(--theme-elevation-50, #18181b)',
          boxShadow: isDragging ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type='file'
          accept={ACCEPTED_TYPES.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        {renderDropzoneContent()}
      </div>

      <ListDrawer onSelect={handleListSelect} />
    </div>
  );
};

export default CustomUploadField;
