import type { PayloadHandler } from 'payload';

import { createR2PresignedUploadUrl, getR2Config } from '@/Payload/lib/r2';

function checkCloudflareConfig(): {
  isConfigured: boolean;
  missingKeys: string[];
  accountId?: string;
  apiToken?: string;
  streamDomain: string;
} {
  const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
  const apiToken = (process.env.CLOUDFLARE_STREAM_API_TOKEN || '').trim();
  const streamDomain =
    (process.env.CLOUDFLARE_STREAM_DOMAIN || '').trim() || 'videodelivery.net';

  const isInvalid = (val: string) =>
    !val ||
    val.includes('your_') ||
    val.includes('placeholder') ||
    val.startsWith('<') ||
    val === 'xxx';

  const missingKeys: string[] = [];
  if (isInvalid(accountId)) missingKeys.push('CLOUDFLARE_ACCOUNT_ID');
  if (isInvalid(apiToken)) missingKeys.push('CLOUDFLARE_STREAM_API_TOKEN');

  return {
    isConfigured: missingKeys.length === 0,
    missingKeys,
    accountId: missingKeys.includes('CLOUDFLARE_ACCOUNT_ID')
      ? undefined
      : accountId,
    apiToken: missingKeys.includes('CLOUDFLARE_STREAM_API_TOKEN')
      ? undefined
      : apiToken,
    streamDomain,
  };
}

export const getCloudflareUploadUrlHandler: PayloadHandler = async (req) => {
  try {
    const url = new URL(req.url || '', 'http://localhost');
    const isCheckOnly =
      url.searchParams.get('checkOnly') === '1' ||
      url.searchParams.get('checkOnly') === 'true' ||
      url.searchParams.get('check') === '1' ||
      url.searchParams.get('check') === 'true';

    const filenameParam = url.searchParams.get('filename') || '';
    const mimeTypeParam = url.searchParams.get('mimeType') || 'video/mp4';
    const fileSizeParam = url.searchParams.get('fileSize') || '';
    const uploadLength = Number(fileSizeParam);

    const config = checkCloudflareConfig();
    const r2Config = getR2Config();

    if (isCheckOnly) {
      if (!config.isConfigured) {
        return Response.json(
          {
            configured: false,
            missingKeys: config.missingKeys,
            r2Configured: r2Config.isConfigured,
            r2MissingKeys: r2Config.missingKeys,
            error: `Cloudflare Stream credentials are missing in your .env file (${config.missingKeys.join(
              ', '
            )}). Video upload is disabled until these keys are configured.`,
            code: 'CLOUDFLARE_CREDENTIALS_MISSING',
          },
          { status: 200 }
        );
      }
      return Response.json(
        {
          configured: true,
          missingKeys: [],
          r2Configured: r2Config.isConfigured,
          r2MissingKeys: r2Config.missingKeys,
        },
        { status: 200 }
      );
    }

    if (!config.isConfigured) {
      const missingList = config.missingKeys.join(', ');
      req.payload.logger.warn(
        `[CF Upload] Cannot request upload slot: Missing credentials in .env (${missingList})`
      );
      return Response.json(
        {
          error: `Cloudflare Stream credentials are missing in your .env file (${missingList}). Please configure them to upload videos.`,
          code: 'CLOUDFLARE_CREDENTIALS_MISSING',
          missingKeys: config.missingKeys,
        },
        { status: 400 }
      );
    }

    if (!uploadLength || uploadLength <= 0 || Number.isNaN(uploadLength)) {
      return Response.json(
        {
          error:
            'A valid "fileSize" query parameter is required to initiate a video upload.',
          code: 'INVALID_FILE_SIZE',
        },
        { status: 400 }
      );
    }

    const { accountId, apiToken, streamDomain } = config;

    const metadataParts: string[] = [];

    const envMaxDuration = Number(process.env.CLOUDFLARE_MAX_DURATION_SECONDS);
    if (envMaxDuration && !Number.isNaN(envMaxDuration) && envMaxDuration > 0) {
      metadataParts.push(
        `maxdurationseconds ${Buffer.from(String(envMaxDuration)).toString('base64')}`
      );
    }

    if (filenameParam) {
      metadataParts.push(
        `name ${Buffer.from(filenameParam).toString('base64')}`
      );
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiToken}`,
      'Tus-Resumable': '1.0.0',
      'Upload-Length': String(uploadLength),
    };

    if (metadataParts.length > 0) {
      headers['Upload-Metadata'] = metadataParts.join(',');
    }

    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?direct_user=true`,
      {
        method: 'POST',
        headers,
      }
    );

    if (cfRes.status !== 201) {
      const errBody = (await cfRes.json().catch(() => ({}))) as {
        errors?: { code?: number; message?: string }[];
      };
      const firstErr = errBody?.errors?.[0];
      let userFriendlyMsg =
        firstErr?.message ||
        `Cloudflare API responded with status ${cfRes.status}.`;

      if (cfRes.status === 401) {
        userFriendlyMsg =
          'Cloudflare Stream authentication failed. Please verify that your CLOUDFLARE_STREAM_API_TOKEN is valid.';
      } else if (cfRes.status === 403) {
        userFriendlyMsg =
          'Cloudflare Stream access forbidden. Please verify your CLOUDFLARE_ACCOUNT_ID and ensure the API token has Stream write permissions.';
      } else if (cfRes.status === 404) {
        userFriendlyMsg =
          'Cloudflare account not found. Please verify your CLOUDFLARE_ACCOUNT_ID in .env.';
      }

      req.payload.logger.error(
        `[CF Upload] Cloudflare error ${cfRes.status}: ${JSON.stringify(errBody)}`
      );

      return Response.json(
        {
          error: userFriendlyMsg,
          code: 'CLOUDFLARE_API_ERROR',
          status: cfRes.status,
          details: firstErr?.message,
        },
        {
          status:
            cfRes.status >= 400 && cfRes.status < 500 ? cfRes.status : 502,
        }
      );
    }

    const uploadUrl = cfRes.headers.get('location');
    const streamUid =
      cfRes.headers.get('stream-media-id') ||
      uploadUrl?.match(/\/tus\/([a-zA-Z0-9]+)/)?.[1] ||
      '';

    if (!uploadUrl || !streamUid) {
      req.payload.logger.error(
        '[CF Upload] Cloudflare did not return a valid Location or stream-media-id header.'
      );
      return Response.json(
        {
          error: 'Cloudflare Stream did not return a valid upload location.',
          code: 'CLOUDFLARE_INVALID_RESPONSE',
        },
        { status: 502 }
      );
    }

    let r2Slot: { uploadUrl: string; key: string; publicUrl?: string } | null =
      null;
    if (r2Config.isConfigured && filenameParam) {
      try {
        r2Slot = await createR2PresignedUploadUrl({
          filename: filenameParam,
          mimeType: mimeTypeParam,
          streamUid,
        });
      } catch (r2Err) {
        req.payload.logger.warn(
          `[R2 Upload Slot] Error creating presigned URL: ${r2Err}`
        );
      }
    }

    return Response.json({
      data: {
        uploadUrl,
        streamUid,
        hlsUrl: `https://${streamDomain}/${streamUid}/manifest/video.m3u8`,
        dashUrl: `https://${streamDomain}/${streamUid}/manifest/video.mpd`,
        thumbnailUrl: `https://${streamDomain}/${streamUid}/thumbnails/thumbnail.jpg?time=1s&height=720`,
        animatedWebpUrl: `https://${streamDomain}/${streamUid}/thumbnails/thumbnail.gif`,
        r2: r2Slot
          ? {
              isConfigured: true,
              uploadUrl: r2Slot.uploadUrl,
              key: r2Slot.key,
              publicUrl: r2Slot.publicUrl,
            }
          : {
              isConfigured: r2Config.isConfigured,
              missingKeys: r2Config.missingKeys,
            },
      },
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : 'Failed to create upload URL';
    req.payload.logger.error(`[CF Upload] ${msg}`);
    return Response.json(
      { error: msg, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
};
