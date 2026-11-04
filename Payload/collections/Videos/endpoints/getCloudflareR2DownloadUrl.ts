import type { PayloadHandler } from 'payload';

import {
  checkR2ObjectExists,
  createR2PresignedDownloadUrl,
  getR2Config,
} from '@/Payload/lib/r2';

export const getCloudflareR2DownloadUrlHandler: PayloadHandler = async (
  req
) => {
  try {
    if (!req.user) {
      return Response.json(
        { error: 'Unauthorized. Please log in to download original videos.' },
        { status: 401 }
      );
    }

    const url = new URL(req.url || '', 'http://localhost');
    const streamUidParam = url.searchParams.get('streamUid');
    const keyParam = url.searchParams.get('key');
    const videoId = url.searchParams.get('id');

    let effectiveStreamUid = streamUidParam || '';
    let r2Key = keyParam || '';
    let downloadFilename = 'original-video.mp4';

    if (effectiveStreamUid || videoId) {
      if (effectiveStreamUid) {
        const mediaDocs = await req.payload.find({
          collection: 'videos-media',
          where: { streamUid: { equals: effectiveStreamUid } },
          limit: 1,
          req,
        });

        if (mediaDocs.docs.length > 0) {
          const doc = mediaDocs.docs[0] as any;
          if (!r2Key && doc.r2Key) r2Key = doc.r2Key;
          if (doc.filename) downloadFilename = doc.filename;
        }

        if (!r2Key) {
          const videoDocs = await req.payload.find({
            collection: 'videos',
            where: { streamUid: { equals: effectiveStreamUid } },
            limit: 1,
            req,
          });
          if (videoDocs.docs.length > 0) {
            const doc = videoDocs.docs[0] as any;
            if (doc.r2Key) r2Key = doc.r2Key;
            if (doc.videoFileName) downloadFilename = doc.videoFileName;
            else if (doc.title) downloadFilename = `${doc.title}.mp4`;
          }
        }
      } else if (videoId) {
        const videoDoc = (await req.payload
          .findByID({
            collection: 'videos',
            id: videoId,
            req,
          })
          .catch(() => null)) as any;

        if (videoDoc) {
          if (!effectiveStreamUid && videoDoc.streamUid) {
            effectiveStreamUid = videoDoc.streamUid;
          }
          if (!r2Key && videoDoc.r2Key) r2Key = videoDoc.r2Key;
          if (videoDoc.videoFileName) downloadFilename = videoDoc.videoFileName;
          else if (videoDoc.title) downloadFilename = `${videoDoc.title}.mp4`;
        }
      }
    }

    const r2Config = getR2Config();

    if (r2Config.isConfigured && r2Key) {
      const existsInR2 = await checkR2ObjectExists(r2Key);
      if (existsInR2) {
        const downloadUrl = await createR2PresignedDownloadUrl({
          key: r2Key,
          downloadFilename,
          expiresInSeconds: 3600,
        });

        if (downloadUrl) {
          return Response.json({
            data: {
              downloadUrl,
              source: 'r2',
              key: r2Key,
              filename: downloadFilename,
              status: 'ready',
            },
          });
        }
      } else {
        req.payload.logger.warn(
          `[R2 Download] Object key '${r2Key}' not found in R2 bucket '${r2Config.bucketName}'. Falling back to Cloudflare Stream...`
        );
      }
    }

    if (effectiveStreamUid) {
      const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
      const apiToken = (process.env.CLOUDFLARE_STREAM_API_TOKEN || '').trim();

      if (accountId && apiToken) {
        try {
          const checkRes = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${effectiveStreamUid}/downloads`,
            {
              headers: { Authorization: `Bearer ${apiToken}` },
            }
          );

          let defaultDl: { url?: string; status?: string } | null = null;
          if (checkRes.ok) {
            const checkJson = (await checkRes.json().catch(() => ({}))) as any;
            defaultDl = checkJson?.result?.default || null;
          }

          if (!defaultDl || !defaultDl.url) {
            const createRes = await fetch(
              `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${effectiveStreamUid}/downloads`,
              {
                method: 'POST',
                headers: { Authorization: `Bearer ${apiToken}` },
              }
            );

            if (createRes.ok) {
              const createJson = (await createRes
                .json()
                .catch(() => ({}))) as any;
              defaultDl = createJson?.result?.default || null;
            }
          }

          if (defaultDl?.url && defaultDl.status === 'inprogress') {
            for (let i = 0; i < 3; i++) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              const pollRes = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${effectiveStreamUid}/downloads`,
                {
                  headers: { Authorization: `Bearer ${apiToken}` },
                }
              );
              if (pollRes.ok) {
                const pollJson = (await pollRes
                  .json()
                  .catch(() => ({}))) as any;
                if (pollJson?.result?.default?.status === 'ready') {
                  defaultDl = pollJson.result.default;
                  break;
                }
              }
            }
          }

          if (defaultDl?.url) {
            return Response.json({
              data: {
                downloadUrl: defaultDl.url,
                source: 'cloudflare-stream',
                status: defaultDl.status || 'ready',
                filename: downloadFilename,
              },
            });
          }
        } catch (streamErr) {
          req.payload.logger.error(
            `[Stream Download Fallback] Error: ${streamErr}`
          );
        }
      }
    }

    return Response.json(
      {
        error:
          'Original video file could not be retrieved from R2 or Cloudflare Stream. Please verify the video has been processed on Cloudflare Stream.',
        code: 'VIDEO_NOT_FOUND',
      },
      { status: 404 }
    );
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : 'Internal server error';
    req.payload.logger.error(`[Video Download] ${msg}`);
    return Response.json(
      { error: msg, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
};
