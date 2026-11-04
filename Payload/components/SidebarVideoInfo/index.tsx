/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useRef, useState } from 'react';

import { toast, useConfig, useField } from '@payloadcms/ui';

import { CustomVideoPlayer } from '@/components/common/CustomVideoPlayer';

export const SidebarVideoInfo: React.FC = () => {
  const { value: title } = useField<string>({ path: 'title' });
  const { value: videoSource } = useField<string>({ path: 'videoSource' });
  const { value: uploadVideo } = useField<any>({ path: 'uploadVideo' });
  const { value: youtubeUrl } = useField<string>({ path: 'youtubeUrl' });
  const { value: videoThumbnail } = useField<any>({ path: 'videoThumbnail' });
  const { value: ratio } = useField<string>({
    path: 'ratio',
  });
  const { value: streamUid, setValue: setStreamUid } = useField<string>({
    path: 'streamUid',
  });
  const { value: hlsUrl } = useField<string>({ path: 'hlsUrl' });
  const { value: cfThumbnailUrl } = useField<string>({ path: 'thumbnailUrl' });
  const { value: cfStatus, setValue: setCfStatus } = useField<string>({
    path: 'cfStatus',
  });
  const { value: r2Key, setValue: setR2Key } = useField<string>({
    path: 'r2Key',
  });
  const { value: r2Url, setValue: setR2Url } = useField<string>({
    path: 'r2Url',
  });
  const { value: r2Status, setValue: setR2Status } = useField<string>({
    path: 'r2Status',
  });
  const { value: r2FileSize, setValue: setR2FileSize } = useField<number>({
    path: 'r2FileSize',
  });

  // Subtitles / transcript preview deferred to next release
  // const { value: transcript } = useField<string>({ path: 'transcript' });
  const { value: slug } = useField<string>({ path: 'slug' });
  const { config } = useConfig();

  const [fetchedVideoUrl, setFetchedVideoUrl] = useState<string | null>(null);
  const [fetchedThumbnailUrl, setFetchedThumbnailUrl] = useState<string | null>(
    null
  );
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<{
    isUploading: boolean;
    progress: number;
    remainingTime: string;
  }>({
    isUploading: false,
    progress: 0,
    remainingTime: '',
  });
  const [transcodeProgress, setTranscodeProgress] = useState<number>(0);
  const [localThumbUrl, setLocalThumbUrl] = useState<string | null>(null);

  const cfStatusRef = useRef(cfStatus);
  const r2StatusRef = useRef(r2Status);
  const ratioRef = useRef(ratio);
  const r2KeyRef = useRef(r2Key);
  const r2UrlRef = useRef<string | undefined>(r2Url);
  const r2FileSizeRef = useRef<number | undefined>(r2FileSize);

  useEffect(() => {
    cfStatusRef.current = cfStatus;
    r2StatusRef.current = r2Status;
    ratioRef.current = ratio;
    r2KeyRef.current = r2Key;
    r2UrlRef.current = r2Url;
    r2FileSizeRef.current = r2FileSize;
  }, [cfStatus, r2Status, ratio, r2Key, r2Url, r2FileSize]);

  useEffect(() => {
    const handleProgress = (event: Event) => {
      const customEvent = event as CustomEvent<{
        isUploading: boolean;
        progress: number;
        remainingTime: string;
        previewUrl?: string;
      }>;
      if (customEvent.detail) {
        setUploadState({
          isUploading: customEvent.detail.isUploading,
          progress: customEvent.detail.progress,
          remainingTime: customEvent.detail.remainingTime,
        });
        if (typeof customEvent.detail.previewUrl === 'string') {
          setUploadPreviewUrl(customEvent.detail.previewUrl || null);
        }
        if (customEvent.detail.isUploading) {
          setTranscodeProgress(0);
        }
        if (
          customEvent.detail.progress === 0 &&
          !customEvent.detail.isUploading
        ) {
          setTranscodeProgress(0);
          setUploadPreviewUrl(null);
          setLocalThumbUrl(null);
        }
      }
    };

    const handleThumb = (event: Event) => {
      const customEvent = event as CustomEvent<{
        localThumb?: string;
      }>;
      if (
        customEvent.detail &&
        typeof customEvent.detail.localThumb === 'string'
      ) {
        setLocalThumbUrl(customEvent.detail.localThumb || null);
      }
    };

    window.addEventListener('video-upload-progress', handleProgress);
    window.addEventListener('video-thumbnail-ready', handleThumb);
    return () => {
      window.removeEventListener('video-upload-progress', handleProgress);
      window.removeEventListener('video-thumbnail-ready', handleThumb);
    };
  }, []);

  useEffect(() => {
    const isCfTerminal =
      cfStatusRef.current === 'ready' || cfStatusRef.current === 'failed';
    const isR2Terminal =
      r2StatusRef.current === 'ready' ||
      r2StatusRef.current === 'not_configured' ||
      r2StatusRef.current === 'failed';

    if (!streamUid || (isCfTerminal && isR2Terminal)) return;

    let isMounted = true;
    let interval: NodeJS.Timeout | null = null;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/videos/check-cloudflare-status?streamUid=${streamUid}`
        );
        if (res.status === 404) {
          if (isMounted) {
            setStreamUid('', true);
            setR2Key('', true);
            setR2Url('', true);
            setR2Status('not_configured', true);
            setCfStatus('processing', true);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('request-discard-video', {
                  detail: {
                    message:
                      'The attached video was removed from Cloudflare and has been discarded.',
                  },
                })
              );
            }
          }
          if (interval) clearInterval(interval);
          return;
        }
        if (!res.ok) return;
        const data = (await res.json()) as {
          ready?: boolean;
          status?: string;
          pctComplete?: number;
          ratio?: string;
          r2Status?: string;
          r2Key?: string;
          r2Url?: string;
          r2FileSize?: number;
          notFound?: boolean;
        };
        if (data?.notFound) {
          if (isMounted) {
            setStreamUid('', true);
            setR2Key('', true);
            setR2Url('', true);
            setR2Status('not_configured', true);
            setCfStatus('processing', true);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('request-discard-video', {
                  detail: {
                    message:
                      'The attached video was deleted and has been discarded.',
                  },
                })
              );
            }
          }
          if (interval) clearInterval(interval);
          return;
        }
        if (isMounted) {
          const isReadyNow =
            data.ready ||
            (typeof data.pctComplete === 'number' && data.pctComplete >= 100);

          if (isReadyNow) {
            setTranscodeProgress(100);
            if (cfStatusRef.current !== 'ready') {
              cfStatusRef.current = 'ready';
              setCfStatus('ready', true);
            }
          } else if (
            typeof data.pctComplete === 'number' &&
            !Number.isNaN(data.pctComplete)
          ) {
            setTranscodeProgress(Math.min(99, Math.round(data.pctComplete)));
          }
          if (data.r2Status && r2StatusRef.current !== data.r2Status) {
            r2StatusRef.current = data.r2Status;
            setR2Status(data.r2Status, true);
          }
          if (data.r2Key && r2KeyRef.current !== data.r2Key) {
            r2KeyRef.current = data.r2Key;
            setR2Key(data.r2Key, true);
          }
          if (data.r2Url && r2UrlRef.current !== data.r2Url) {
            r2UrlRef.current = data.r2Url;
            setR2Url(data.r2Url, true);
          }
          if (
            typeof data.r2FileSize === 'number' &&
            r2FileSizeRef.current !== data.r2FileSize
          ) {
            r2FileSizeRef.current = data.r2FileSize;
            setR2FileSize(data.r2FileSize, true);
          }

          const nowCfTerminal =
            cfStatusRef.current === 'ready' || cfStatusRef.current === 'failed';
          const nowR2Terminal =
            r2StatusRef.current === 'ready' ||
            r2StatusRef.current === 'not_configured' ||
            r2StatusRef.current === 'failed';
          if (nowCfTerminal && nowR2Terminal && interval) {
            clearInterval(interval);
          }
        }
      } catch {}
    };

    checkStatus();
    interval = setInterval(checkStatus, 2500);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [
    streamUid,
    setStreamUid,
    setCfStatus,
    setR2Status,
    setR2Key,
    setR2Url,
    setR2FileSize,
  ]);

  useEffect(() => {
    if (videoSource === 'upload' && typeof uploadVideo === 'string') {
      const fetchVideo = async () => {
        try {
          const res = await fetch(
            `${config.serverURL}${config.routes.api}/videos-media/${uploadVideo}`
          );
          const data = await res.json();
          setFetchedVideoUrl(data.url);
          if (data.streamUid && !streamUid) {
            setStreamUid(data.streamUid, true);
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      };
      fetchVideo();
    }
  }, [videoSource, uploadVideo, config, setStreamUid, streamUid]);

  useEffect(() => {
    let isMounted = true;
    if (typeof videoThumbnail === 'string') {
      const fetchThumb = async () => {
        try {
          const res = await fetch(
            `${config.serverURL}${config.routes.api}/media/${videoThumbnail}`
          );
          const data = await res.json();
          if (isMounted) {
            setFetchedThumbnailUrl(data.url);
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      };
      fetchThumb();
    }
    return () => {
      isMounted = false;
    };
  }, [videoThumbnail, config]);

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
        const doc = data?.docs?.[0];
        if (doc) {
          if (doc.r2Key && r2KeyRef.current !== doc.r2Key) {
            r2KeyRef.current = doc.r2Key;
            setR2Key(doc.r2Key, true);
          }
          if (doc.r2Url && r2UrlRef.current !== doc.r2Url) {
            r2UrlRef.current = doc.r2Url;
            setR2Url(doc.r2Url, true);
          }
          if (doc.r2Status && r2StatusRef.current !== doc.r2Status) {
            r2StatusRef.current = doc.r2Status;
            setR2Status(doc.r2Status, true);
          }
          if (
            typeof doc.r2FileSize === 'number' &&
            r2FileSizeRef.current !== doc.r2FileSize
          ) {
            r2FileSizeRef.current = doc.r2FileSize;
            setR2FileSize(doc.r2FileSize, true);
          }
        } else if (Array.isArray(data?.docs) && data.docs.length === 0) {
          setStreamUid('', true);
          setR2Key('', true);
          setR2Url('', true);
          setR2Status('not_configured', true);
          setCfStatus('processing', true);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('request-discard-video', {
                detail: {
                  message:
                    'The attached video was deleted from the media library and has been discarded.',
                },
              })
            );
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [
    streamUid,
    setStreamUid,
    setR2Key,
    setR2Url,
    setR2Status,
    setCfStatus,
    setR2FileSize,
  ]);

  useEffect(() => {
    const handleVideoDiscarded = () => {
      setStreamUid('', true);
      setR2Key('', true);
      setR2Url('', true);
      setR2Status('not_configured', true);
      setCfStatus('processing', true);
      setFetchedVideoUrl('');
      setFetchedThumbnailUrl('');
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('video-discarded', handleVideoDiscarded);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('video-discarded', handleVideoDiscarded);
      }
    };
  }, [setStreamUid, setR2Key, setR2Url, setR2Status, setCfStatus]);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSyncingR2, setIsSyncingR2] = useState(false);

  const handleSyncR2 = async () => {
    if (!streamUid || isSyncingR2) return;
    setIsSyncingR2(true);
    try {
      const res = await fetch(
        `/api/videos/sync-r2-backup?streamUid=${encodeURIComponent(streamUid)}`,
        { method: 'POST' }
      );
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Failed to back up video to Cloudflare R2.');
      } else {
        toast.success('Video backup to Cloudflare R2 completed successfully.');
        setR2Status('ready');
        if (data.key) setR2Key(data.key);
        if (data.publicUrl) setR2Url(data.publicUrl);
        if (data.fileSize) setR2FileSize(data.fileSize);
      }
    } catch {
      toast.error('Network error while backing up video to R2.');
    } finally {
      setIsSyncingR2(false);
    }
  };

  const handleDownloadOriginal = async () => {
    if (!streamUid && !r2Key) return;
    setIsDownloading(true);
    try {
      const params = new URLSearchParams();
      if (streamUid) params.set('streamUid', streamUid);
      if (r2Key) params.set('key', r2Key);

      const res = await fetch(
        `/api/videos/get-cloudflare-r2-download-url?${params.toString()}`
      );
      const json = await res.json();
      if (!res.ok || json.error || !json.data?.downloadUrl) {
        toast.error(
          json.error || 'Failed to generate download URL for original video.'
        );
        return;
      }

      const downloadUrl = json.data.downloadUrl;
      const downloadFilename =
        json.data.filename ||
        (r2Key ? r2Key.split('/').pop() : 'original-video.mp4') ||
        'original-video.mp4';

      if (json.data.status === 'inprogress') {
        toast.info(
          'Video download is preparing on Cloudflare Stream. Download will start automatically...',
          { duration: 4000 }
        );
      }

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Download started: ${downloadFilename}`);
    } catch {
      toast.error('Error downloading original video backup.');
    } finally {
      setIsDownloading(false);
    }
  };

  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentMediaKey = `${streamUid || ''}-${videoSource || ''}-${youtubeUrl || ''}`;
  const isPlaying = Boolean(playingKey && playingKey === currentMediaKey);

  let youtubeThumbnailUrl: string | null = null;
  let youtubeId: string | null = null;
  if (videoSource === 'youtube' && youtubeUrl) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = youtubeUrl.match(regExp);
    if (match && match[2].length === 11) {
      youtubeId = match[2];
      if (!videoThumbnail) {
        youtubeThumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        Boolean(
          document.fullscreenElement &&
          (document.fullscreenElement === containerRef.current ||
            document.fullscreenElement === videoRef.current)
        )
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
    };
  }, []);

  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const target = containerRef.current || videoRef.current;
    if (!target) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      if (target.requestFullscreen) {
        target.requestFullscreen().catch(() => {});
      } else if ((target as any).webkitRequestFullscreen) {
        (target as any).webkitRequestFullscreen();
      }
    }
  };

  let videoUrl: string | null = null;
  if (videoSource === 'upload') {
    if (typeof uploadVideo === 'object' && uploadVideo !== null) {
      videoUrl = uploadVideo.url;
    } else {
      videoUrl = fetchedVideoUrl;
    }
  }

  const streamDomain =
    process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN ||
    process.env.CLOUDFLARE_STREAM_DOMAIN ||
    'videodelivery.net';

  const cfDefaultThumb = streamUid
    ? `https://${streamDomain}/${streamUid}/thumbnails/thumbnail.jpg?time=1s&height=720`
    : null;

  let customThumbUrl: string | null = null;
  if (
    typeof videoThumbnail === 'object' &&
    videoThumbnail !== null &&
    videoThumbnail.url
  ) {
    customThumbUrl = videoThumbnail.url;
  } else if (typeof videoThumbnail === 'string' && fetchedThumbnailUrl) {
    customThumbUrl = fetchedThumbnailUrl;
  }

  const thumbnailUrl =
    customThumbUrl ||
    cfThumbnailUrl ||
    localThumbUrl ||
    cfDefaultThumb ||
    youtubeThumbnailUrl;

  const isCfReady = cfStatus === 'ready' || transcodeProgress >= 100;
  const activeVideoUrl =
    (isCfReady ? hlsUrl : null) || videoUrl || uploadPreviewUrl;

  const hasCustomPlayer = Boolean(activeVideoUrl || streamUid);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kuberanow.com';
  const videoPath = ratio === '9:16' ? 'short-videos' : 'videos';
  const canonicalUrl = slug
    ? `${siteUrl}/${videoPath}/${slug}`
    : `${siteUrl}/${videoPath}`;

  const renderMedia = () => {
    if (activeVideoUrl || (isCfReady && streamUid)) {
      const playerKey = isCfReady
        ? `hls-${streamUid || 'no-uid'}-${ratio || '16:9'}`
        : `blob-${activeVideoUrl || 'no-src'}-${ratio || '16:9'}`;
      return (
        <CustomVideoPlayer
          key={playerKey}
          src={activeVideoUrl}
          streamUid={isCfReady ? streamUid : undefined}
          streamDomain={streamDomain}
          cfStatus={cfStatus}
          poster={thumbnailUrl}
          ratio={ratio}
          title={title}
          url={canonicalUrl}
          slug={slug}
        />
      );
    }

    if (thumbnailUrl) {
      const isYoutube = Boolean(videoSource === 'youtube' && youtubeUrl);
      const canPlay = Boolean(streamUid || isYoutube);
      let previewTitle: string | undefined;
      if (isYoutube) {
        previewTitle = 'Open in YouTube (new tab)';
      } else if (canPlay) {
        previewTitle = 'Play video';
      }

      return (
        <div
          onClick={() => {
            if (isYoutube && youtubeUrl) {
              window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
            } else if (streamUid) {
              setPlayingKey(currentMediaKey);
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canPlay ? 'pointer' : 'default',
          }}
          title={previewTitle}
        >
          <img
            src={thumbnailUrl}
            alt='Preview'
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
          {canPlay && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${isHovered ? 1.08 : 1})`,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: isHovered ? '#010874' : 'rgba(1, 8, 116, 0.5)',
                border: '1px solid rgba(2, 15, 218, 0.2)',
                boxShadow: '0 4px 12px rgba(1, 8, 116, 0.25)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              title='Click to play video'
            >
              <img
                src='/assets/videos/play.svg'
                alt='Play'
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: '#888',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(1, 8, 116, 0.5)',
            border: '1px solid rgba(2, 15, 218, 0.2)',
            boxShadow: '0 4px 12px rgba(1, 8, 116, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src='/assets/videos/play.svg'
            alt='Play'
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 500 }}>Video Preview</span>
      </div>
    );
  };

  const renderStatusCard = () => {
    if (uploadState.isUploading) {
      return (
        <div
          style={{
            border: '1px solid #2d2d32',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: '#161618',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              color: '#fff',
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            Upload Video
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            {uploadState.progress}%
            {uploadState.remainingTime ? ` · ${uploadState.remainingTime}` : ''}
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: '#2b2b30',
              borderRadius: '999px',
              overflow: 'hidden',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                width: `${uploadState.progress}%`,
                height: '100%',
                background: '#fff',
                borderRadius: '999px',
                transition: 'width 0.25s ease-out',
              }}
            />
          </div>
        </div>
      );
    }

    if (streamUid && !isCfReady) {
      return (
        <div
          style={{
            border: '1px solid #2d2d32',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: '#161618',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              color: '#fff',
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            Transcode Video
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            {transcodeProgress}% . Transcoding adaptive stream...
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: '#2b2b30',
              borderRadius: '999px',
              overflow: 'hidden',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                width: `${Math.max(4, transcodeProgress)}%`,
                height: '100%',
                background: '#fff',
                borderRadius: '999px',
                transition: 'width 0.25s ease-out',
              }}
            />
          </div>
        </div>
      );
    }

    if (streamUid && isCfReady) {
      return (
        <div
          style={{
            border: '1px solid #2d2d32',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: '#161618',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
              Cloudflare Stream
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '10px',
                color: '#10b981',
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            >
              Ready
            </span>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderDownloadCard = () => {
    if (videoSource !== 'upload' || !streamUid) return null;

    const isR2Ready = r2Status === 'ready';
    const isR2Uploading = r2Status === 'uploading' || isSyncingR2;

    let backupButtonLabel = 'Back Up to R2';
    if (isSyncingR2) {
      backupButtonLabel = 'Backing Up...';
    } else if (r2Status === 'failed') {
      backupButtonLabel = 'Retry Backup';
    }

    let actionElement: React.ReactNode = null;
    if (isR2Ready) {
      actionElement = (
        <button
          type='button'
          onClick={handleDownloadOriginal}
          disabled={isDownloading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: '#242528',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 500,
            cursor: isDownloading ? 'wait' : 'pointer',
            opacity: isDownloading ? 0.7 : 1,
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!isDownloading) {
              e.currentTarget.style.background = '#2f3035';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDownloading) {
              e.currentTarget.style.background = '#242528';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
            }
          }}
        >
          <svg
            width='13'
            height='13'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
            <polyline points='7 10 12 15 17 10' />
            <line
              x1='12'
              y1='15'
              x2='12'
              y2='3'
            />
          </svg>
          {isDownloading ? 'Downloading...' : 'Download'}
        </button>
      );
    } else if (isR2Uploading) {
      actionElement = (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: '10px',
            color: '#f59e0b',
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#f59e0b',
              animation: 'r2Pulse 1.4s ease-in-out infinite',
            }}
          />
          Backing Up...
        </span>
      );
    } else {
      actionElement = (
        <button
          type='button'
          onClick={handleSyncR2}
          disabled={isSyncingR2}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: '#242528',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 500,
            cursor: isSyncingR2 ? 'wait' : 'pointer',
            opacity: isSyncingR2 ? 0.7 : 1,
          }}
        >
          <svg
            width='13'
            height='13'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
            <polyline points='17 8 12 3 7 8' />
            <line
              x1='12'
              y1='3'
              x2='12'
              y2='15'
            />
          </svg>
          {backupButtonLabel}
        </button>
      );
    }

    return (
      <div
        style={{
          border: '1px solid #2d2d32',
          borderRadius: '8px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#161618',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
            Download Original Video
          </div>
        </div>

        {actionElement}
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px',
        width: '100%',
      }}
    >
      {renderDownloadCard()}
      <div
        style={{
          background: '#141414',
          border: '1px solid #44444A',
          borderRadius: '10px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
        }}
      >
        <h4
          style={{
            margin: '0',
            fontSize: '16px',
            color: '#fff',
            fontWeight: 'bold',
          }}
        >
          Video Information
        </h4>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            ref={containerRef}
            className='sidebar-video-preview-box'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{
              width: ratio === '9:16' ? 'auto' : '100%',
              height: ratio === '9:16' ? '400px' : 'auto',
              aspectRatio: ratio === '9:16' ? '9/16' : '16/9',
              background: '#000',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {renderMedia()}
            {isHovered &&
              !hasCustomPlayer &&
              (activeVideoUrl || thumbnailUrl || isPlaying) && (
                <button
                  type='button'
                  onClick={toggleFullscreen}
                  title={
                    isFullscreen ? 'Exit Full Screen' : 'Full Screen Preview'
                  }
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    background: 'rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'background 0.15s ease',
                  }}
                >
                  {isFullscreen ? (
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3' />
                    </svg>
                  ) : (
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3' />
                    </svg>
                  )}
                </button>
              )}
          </div>
        </div>
        <style>{`
        @keyframes r2Pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.85); }
        }
        .sidebar-video-preview-box video,
        .sidebar-video-preview-box img,
        .sidebar-video-preview-box iframe {
          object-fit: contain !important;
        }
        video:fullscreen,
        video:-webkit-full-screen,
        video:-moz-full-screen,
        video:-ms-fullscreen {
          object-fit: contain !important;
          background-color: #000 !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        .sidebar-video-preview-box:fullscreen,
        .sidebar-video-preview-box:-webkit-full-screen {
          width: 100vw !important;
          height: 100vh !important;
          background-color: #000 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .sidebar-video-preview-box:fullscreen video,
        .sidebar-video-preview-box:-webkit-full-screen video,
        .sidebar-video-preview-box:fullscreen img,
        .sidebar-video-preview-box:-webkit-full-screen img,
        .sidebar-video-preview-box:fullscreen iframe,
        .sidebar-video-preview-box:-webkit-full-screen iframe {
          object-fit: contain !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
        <p
          style={{
            margin: '0',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#fff',
            lineHeight: '1.4',
          }}
        >
          {title || 'Untitled'}
        </p>
        {renderStatusCard()}
      </div>
    </div>
  );
};

export default SidebarVideoInfo;
