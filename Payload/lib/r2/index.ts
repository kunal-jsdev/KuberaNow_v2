import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface R2Config {
  isConfigured: boolean;
  missingKeys: string[];
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName?: string;
  publicDomain?: string;
  videoFolder?: string;
}

export function getR2Environment(): 'prod' | 'dev' {
  const custom = (
    process.env.R2_ENVIRONMENT ||
    process.env.APP_ENV ||
    process.env.ENVIRONMENT ||
    process.env.CONTEXT ||
    ''
  )
    .trim()
    .toLowerCase();

  if (custom === 'prod' || custom === 'production') return 'prod';
  if (
    custom === 'dev' ||
    custom === 'development' ||
    custom === 'staging' ||
    custom === 'deploy-preview'
  )
    return 'dev';

  const serverUrl = (process.env.NEXT_PUBLIC_SERVER_URL || '').toLowerCase();
  if (
    serverUrl.includes('-dev') ||
    serverUrl.includes('localhost') ||
    serverUrl.includes('127.0.0.1')
  ) {
    return 'dev';
  }
  if (serverUrl.includes('prod') || serverUrl.includes('kuberanow.com')) {
    return 'prod';
  }

  return process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
}
export function getR2VideoFolder(): string {
  const custom = (
    process.env.R2_VIDEO_FOLDER ||
    process.env.R2_VIDEO_UPLOAD_FOLDER ||
    process.env.R2_UPLOAD_FOLDER ||
    ''
  ).trim();

  const env = getR2Environment();

  if (custom) {
    const resolved = custom.replace(/\{env\}/gi, env);
    return resolved.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
  }

  return `kuberanow/${env}/videos`;
}

export function buildR2VideoKey(filename: string, streamUid?: string): string {
  const folder = getR2VideoFolder();
  const ext = filename.includes('.')
    ? filename.slice(filename.lastIndexOf('.')).toLowerCase()
    : '.mp4';

  const baseName =
    filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'video';

  const uniqueSuffix = streamUid
    ? streamUid.slice(0, 8)
    : Date.now().toString(36);
  const finalFilename = `${baseName}-${uniqueSuffix}${ext}`;

  return folder ? `${folder}/${finalFilename}` : finalFilename;
}

export function getR2Config(): R2Config {
  const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || '').trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || '').trim();
  const bucketName = (process.env.R2_BUCKET_NAME || '').trim();
  const publicDomain = (process.env.R2_PUBLIC_DOMAIN || '').trim();
  const videoFolder = getR2VideoFolder();

  const isInvalid = (val: string) =>
    !val ||
    val.includes('your_') ||
    val.includes('placeholder') ||
    val.startsWith('<') ||
    val === 'xxx';

  const missingKeys: string[] = [];
  if (isInvalid(accountId))
    missingKeys.push('CLOUDFLARE_ACCOUNT_ID (or R2_ACCOUNT_ID)');
  if (isInvalid(accessKeyId)) missingKeys.push('R2_ACCESS_KEY_ID');
  if (isInvalid(secretAccessKey)) missingKeys.push('R2_SECRET_ACCESS_KEY');
  if (isInvalid(bucketName)) missingKeys.push('R2_BUCKET_NAME');

  return {
    isConfigured: missingKeys.length === 0,
    missingKeys,
    accountId: isInvalid(accountId) ? undefined : accountId,
    accessKeyId: isInvalid(accessKeyId) ? undefined : accessKeyId,
    secretAccessKey: isInvalid(secretAccessKey) ? undefined : secretAccessKey,
    bucketName: isInvalid(bucketName) ? undefined : bucketName,
    publicDomain: publicDomain || undefined,
    videoFolder,
  };
}

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client | null {
  const config = getR2Config();
  if (
    !config.isConfigured ||
    !config.accountId ||
    !config.accessKeyId ||
    !config.secretAccessKey
  ) {
    return null;
  }

  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  return s3ClientInstance;
}

export async function createR2PresignedUploadUrl(args: {
  filename: string;
  mimeType?: string;
  streamUid?: string;
}): Promise<{
  uploadUrl: string;
  key: string;
  publicUrl?: string;
} | null> {
  const config = getR2Config();
  const client = getR2Client();

  if (!config.isConfigured || !client || !config.bucketName) {
    return null;
  }

  const key = buildR2VideoKey(args.filename, args.streamUid);

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: 3600,
  });

  let publicUrl: string | undefined;
  if (config.publicDomain) {
    const cleanDomain = config.publicDomain.replace(/\/+$/, '');
    publicUrl = `${cleanDomain}/${key}`;
  }

  return {
    uploadUrl,
    key,
    publicUrl,
  };
}

export async function createR2PresignedDownloadUrl(args: {
  key: string;
  downloadFilename?: string;
  expiresInSeconds?: number;
}): Promise<string | null> {
  const config = getR2Config();
  const client = getR2Client();

  if (!config.isConfigured || !client || !config.bucketName) {
    return null;
  }

  const filename =
    args.downloadFilename || args.key.split('/').pop() || 'original-video.mp4';
  const cleanFilename = filename.replace(/["\r\n]/g, '');

  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: args.key,
    ResponseContentDisposition: `attachment; filename="${cleanFilename}"`,
  });

  const downloadUrl = await getSignedUrl(client, command, {
    expiresIn: args.expiresInSeconds || 3600,
  });

  return downloadUrl;
}

export async function checkR2ObjectExists(key: string): Promise<boolean> {
  const config = getR2Config();
  const client = getR2Client();

  if (!config.isConfigured || !client || !config.bucketName || !key) {
    return false;
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch {
    return false;
  }
}

export async function deleteR2Object(key: string): Promise<boolean> {
  const config = getR2Config();
  const client = getR2Client();

  if (!config.isConfigured || !client || !config.bucketName || !key) {
    return false;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Robust deletion of a video backup from Cloudflare R2.
 * Handles:
 * 1. Direct deletion of the provided `r2Key`
 * 2. Deletion of derived key from `filename` and `streamUid`
 * 3. Scanning the R2 folder for any object key ending with `-${streamUid.slice(0, 8)}.*`
 */
export async function deleteR2VideoBackup(args: {
  streamUid?: string | null;
  r2Key?: string | null;
  filename?: string | null;
}): Promise<{ success: boolean; deletedKeys: string[] }> {
  const config = getR2Config();
  const client = getR2Client();
  const deletedKeys: string[] = [];

  if (!config.isConfigured || !client || !config.bucketName) {
    return { success: false, deletedKeys };
  }

  const { streamUid, r2Key, filename } = args;

  // 1. Direct key deletion if provided
  if (
    r2Key &&
    typeof r2Key === 'string' &&
    r2Key.trim() !== '' &&
    r2Key !== 'undefined' &&
    r2Key !== 'null'
  ) {
    const cleanKey = r2Key.trim();
    const success = await deleteR2Object(cleanKey);
    if (success) {
      deletedKeys.push(cleanKey);
    }
  }

  // 2. Check derived key from filename and streamUid
  if (filename && streamUid) {
    const derivedKey = buildR2VideoKey(filename, streamUid);
    if (!deletedKeys.includes(derivedKey)) {
      const exists = await checkR2ObjectExists(derivedKey);
      if (exists) {
        const success = await deleteR2Object(derivedKey);
        if (success) {
          deletedKeys.push(derivedKey);
        }
      }
    }
  }

  // 3. Scan bucket folder for any object matching streamUid suffix
  if (streamUid && typeof streamUid === 'string' && streamUid.length >= 6) {
    const uidSuffix = streamUid.slice(0, 8);
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: config.bucketName,
        Prefix: config.videoFolder,
      });
      const listRes = await client.send(listCommand);
      const matchingObjects =
        listRes.Contents?.filter(
          (obj) =>
            obj.Key &&
            (obj.Key.includes(uidSuffix) || obj.Key.includes(streamUid))
        ) || [];

      for (const obj of matchingObjects) {
        if (obj.Key && !deletedKeys.includes(obj.Key)) {
          const success = await deleteR2Object(obj.Key);
          if (success) {
            deletedKeys.push(obj.Key);
          }
        }
      }
    } catch (listErr) {
      // eslint-disable-next-line no-console
      console.warn('[deleteR2VideoBackup list warning]:', listErr);
    }
  }

  return { success: true, deletedKeys };
}

/**
 * Searches the R2 bucket for an existing backup belonging to the given streamUid.
 * Uses the 8-character stream prefix to find matching uploaded keys.
 */
export async function findR2BackupByStreamUid(streamUid: string): Promise<{
  found: boolean;
  key?: string;
  publicUrl?: string;
  fileSize?: number;
}> {
  if (!streamUid || typeof streamUid !== 'string' || streamUid.length < 6) {
    return { found: false };
  }

  const config = getR2Config();
  const client = getR2Client();

  if (!config.isConfigured || !client || !config.bucketName) {
    return { found: false };
  }

  const uidSuffix = streamUid.slice(0, 8);

  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: config.bucketName,
      Prefix: config.videoFolder,
    });
    const listRes = await client.send(listCommand);
    const matched = listRes.Contents?.find(
      (obj) =>
        obj.Key && (obj.Key.includes(uidSuffix) || obj.Key.includes(streamUid))
    );

    if (matched?.Key) {
      const publicUrl = config.publicDomain
        ? `${config.publicDomain.replace(/\/+$/, '')}/${matched.Key}`
        : undefined;
      return {
        found: true,
        key: matched.Key,
        publicUrl,
        fileSize: matched.Size,
      };
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[findR2BackupByStreamUid warning]:', err);
  }

  return { found: false };
}

export async function uploadBufferToR2(args: {
  key: string;
  body: Buffer | Uint8Array;
  contentType?: string;
}): Promise<{ success: boolean; key: string; size?: number; etag?: string }> {
  const config = getR2Config();
  const client = getR2Client();

  if (!config.isConfigured || !client || !config.bucketName || !args.key) {
    return { success: false, key: args.key };
  }

  try {
    const res = await client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: args.key,
        Body: args.body,
        ContentType: args.contentType || 'video/mp4',
      })
    );
    return {
      success: true,
      key: args.key,
      size: args.body.length,
      etag: res.ETag,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[R2 Upload Error]', err);
    return { success: false, key: args.key };
  }
}

export async function backupStreamVideoToR2(args: {
  streamUid: string;
  filename?: string;
  targetKey?: string;
}): Promise<{
  success: boolean;
  key?: string;
  publicUrl?: string;
  fileSize?: number;
  alreadyExisted?: boolean;
  error?: string;
}> {
  const config = getR2Config();
  const client = getR2Client();

  if (
    !config.isConfigured ||
    !client ||
    !config.bucketName ||
    !args.streamUid
  ) {
    return {
      success: false,
      error: 'R2 is not configured or missing streamUid',
    };
  }

  const safeFilename = args.filename || `video-${args.streamUid}.mp4`;
  const key = args.targetKey || buildR2VideoKey(safeFilename, args.streamUid);

  let publicUrl: string | undefined;
  if (config.publicDomain) {
    const cleanDomain = config.publicDomain.replace(/\/+$/, '');
    publicUrl = `${cleanDomain}/${key}`;
  }

  const exists = await checkR2ObjectExists(key);
  if (exists) {
    let fileSize: number | undefined;
    try {
      const head = await client.send(
        new HeadObjectCommand({
          Bucket: config.bucketName,
          Key: key,
        })
      );
      fileSize = head.ContentLength;
    } catch {}

    return {
      success: true,
      key,
      publicUrl,
      fileSize,
      alreadyExisted: true,
    };
  }

  const accountId = config.accountId;
  const streamApiToken = (process.env.CLOUDFLARE_STREAM_API_TOKEN || '').trim();

  if (!accountId || !streamApiToken) {
    return {
      success: false,
      error: 'Missing Cloudflare Stream credentials for backup',
    };
  }

  try {
    const downloadsApiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${args.streamUid}/downloads`;

    let downloadUrl: string | null = null;
    let downloadStatus: string | null = null;

    const checkRes = await fetch(downloadsApiUrl, {
      headers: { Authorization: `Bearer ${streamApiToken}` },
    });
    if (checkRes.ok) {
      const checkJson = (await checkRes.json().catch(() => ({}))) as any;
      const def = checkJson?.result?.default;
      if (def?.url) {
        downloadUrl = def.url;
        downloadStatus = def.status;
      }
    }

    if (!downloadUrl) {
      const createRes = await fetch(downloadsApiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${streamApiToken}` },
      });
      if (createRes.ok) {
        const createJson = (await createRes.json().catch(() => ({}))) as any;
        const def = createJson?.result?.default;
        if (def?.url) {
          downloadUrl = def.url;
          downloadStatus = def.status;
        }
      }
    }

    if (downloadUrl && downloadStatus === 'inprogress') {
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const pollRes = await fetch(downloadsApiUrl, {
          headers: { Authorization: `Bearer ${streamApiToken}` },
        });
        if (pollRes.ok) {
          const pollJson = (await pollRes.json().catch(() => ({}))) as any;
          const def = pollJson?.result?.default;
          if (def?.status === 'ready' && def?.url) {
            downloadUrl = def.url;
            downloadStatus = 'ready';
            break;
          }
        }
      }
    }

    if (!downloadUrl) {
      return {
        success: false,
        error: 'Cloudflare Stream download URL not available yet',
      };
    }

    const videoStreamRes = await fetch(downloadUrl);
    if (!videoStreamRes.ok) {
      return {
        success: false,
        error: `Failed to fetch video from Stream (HTTP ${videoStreamRes.status})`,
      };
    }

    const arrayBuffer = await videoStreamRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        Body: buffer,
        ContentType: 'video/mp4',
      })
    );

    return {
      success: true,
      key,
      publicUrl,
      fileSize: buffer.length,
      alreadyExisted: false,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown sync error';
    return {
      success: false,
      error: msg,
    };
  }
}
