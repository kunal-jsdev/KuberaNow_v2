import type { PayloadHandler } from 'payload';

import {
  backupStreamVideoToR2,
  buildR2VideoKey,
  checkR2ObjectExists,
  findR2BackupByStreamUid,
  getR2Config,
} from '@/Payload/lib/r2';
import {
  getMongoCollection,
  toMongoObjectId,
} from '@/Payload/lib/utilities/mongo';

const activeR2Syncs = new Set<string>();

export const checkCloudflareStatusHandler: PayloadHandler = async (req) => {
  try {
    const url = new URL(req.url || '', 'http://localhost');
    const streamUid = url.searchParams.get('streamUid');

    if (!streamUid) {
      return Response.json(
        { error: 'Missing streamUid parameter' },
        { status: 400 }
      );
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    if (!accountId || !apiToken || accountId.includes('your_')) {
      return Response.json({
        ready: true,
        status: 'ready',
        pctComplete: 100,
        r2Status: 'not_configured',
      });
    }

    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${streamUid}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    if (!cfRes.ok) {
      return Response.json(
        {
          error: `Cloudflare API responded with ${cfRes.status}`,
          notFound: cfRes.status === 404,
        },
        { status: cfRes.status }
      );
    }

    try {
      const mediaCheck = await req.payload.find({
        collection: 'videos-media',
        where: { streamUid: { equals: streamUid } },
        limit: 1,
        req,
        overrideAccess: true,
      });
      if (mediaCheck.docs.length === 0) {
        return Response.json(
          {
            error: 'Video was deleted from media library',
            notFound: true,
          },
          { status: 404 }
        );
      }
    } catch {}

    const cfData = (await cfRes.json()) as {
      result?: {
        readyToStream?: boolean;
        status?: {
          state?: string;
          pctComplete?: string;
          errorReasonText?: string;
        };
        duration?: number;
        input?: { width?: number; height?: number };
      };
    };

    const isReady =
      cfData?.result?.readyToStream === true ||
      cfData?.result?.status?.state === 'ready';

    const state = isReady
      ? 'ready'
      : cfData?.result?.status?.state || 'processing';

    const pctComplete = isReady
      ? 100
      : parseFloat(cfData?.result?.status?.pctComplete || '0');

    if (isReady) {
      try {
        const videoColl = getMongoCollection(req.payload.db, 'videos');
        if (videoColl) {
          await videoColl.updateMany(
            { streamUid, cfStatus: { $ne: 'ready' } },
            { $set: { cfStatus: 'ready', updatedAt: new Date() } }
          );
        }
        const versionsColl = getMongoCollection(
          req.payload.db,
          '_videos_versions'
        );
        if (versionsColl) {
          await versionsColl.updateMany(
            {
              'version.streamUid': streamUid,
              'version.cfStatus': { $ne: 'ready' },
            },
            { $set: { 'version.cfStatus': 'ready' } }
          );
        }
      } catch (dbErr) {
        req.payload.logger.warn(`[CF Status DB update note]: ${dbErr}`);
      }
    }

    // 1. Fetch existing mediaDoc for R2 status
    let mediaDoc: any = null;
    try {
      const mediaDocs = await req.payload.find({
        collection: 'videos-media',
        where: { streamUid: { equals: streamUid } },
        limit: 1,
        req,
        overrideAccess: true,
      });
      mediaDoc = mediaDocs.docs[0] as any;
    } catch {}

    const r2Config = getR2Config();
    let r2Status: string = r2Config.isConfigured
      ? 'uploading'
      : 'not_configured';
    let r2Key: string | undefined;
    let r2Url: string | undefined;
    let r2FileSize: number | undefined;

    if (mediaDoc) {
      r2Key = mediaDoc.r2Key || undefined;
      r2Url = mediaDoc.r2Url || undefined;
      r2FileSize = mediaDoc.r2FileSize || undefined;
      r2Status =
        mediaDoc.r2Status ||
        (r2Config.isConfigured ? 'uploading' : 'not_configured');
    }

    if (r2Config.isConfigured) {
      try {
        const persistR2Success = async (
          key: string,
          urlVal?: string,
          sizeVal?: number
        ) => {
          try {
            const mediaCollection = getMongoCollection(
              req.payload.db,
              'videos-medias'
            );
            if (mediaCollection && mediaDoc?.id) {
              const objId = toMongoObjectId(
                req.payload.db,
                String(mediaDoc.id)
              );
              const query = objId
                ? { $or: [{ _id: mediaDoc.id }, { _id: objId }, { streamUid }] }
                : { streamUid };
              await mediaCollection.updateOne(query, {
                $set: {
                  r2Key: key,
                  ...(urlVal ? { r2Url: urlVal } : {}),
                  ...(sizeVal ? { r2FileSize: sizeVal } : {}),
                  r2Status: 'ready',
                  updatedAt: new Date(),
                },
              });
            }

            const videoCollection = getMongoCollection(
              req.payload.db,
              'videos'
            );
            if (videoCollection) {
              await videoCollection.updateMany(
                { streamUid },
                {
                  $set: {
                    r2Key: key,
                    ...(urlVal ? { r2Url: urlVal } : {}),
                    ...(sizeVal ? { r2FileSize: sizeVal } : {}),
                    r2Status: 'ready',
                    updatedAt: new Date(),
                  },
                }
              );
            }

            const versionsCollection = getMongoCollection(
              req.payload.db,
              '_videos_versions'
            );
            if (versionsCollection) {
              await versionsCollection.updateMany(
                { 'version.streamUid': streamUid },
                {
                  $set: {
                    'version.r2Key': key,
                    ...(urlVal ? { 'version.r2Url': urlVal } : {}),
                    ...(sizeVal ? { 'version.r2FileSize': sizeVal } : {}),
                    'version.r2Status': 'ready',
                  },
                }
              );
            }
          } catch (dbErr) {
            req.payload.logger.warn(`[R2 persist note]: ${dbErr}`);
          }
        };

        if (r2Key && r2Status === 'ready') {
          // Already confirmed ready
        } else if (r2Key) {
          const exists = await checkR2ObjectExists(r2Key);
          if (exists) {
            r2Status = 'ready';
            await persistR2Success(r2Key, r2Url, r2FileSize);
          }
        } else if (mediaDoc?.filename) {
          const candidateKey = buildR2VideoKey(mediaDoc.filename, streamUid);
          const exists = await checkR2ObjectExists(candidateKey);
          if (exists) {
            r2Key = candidateKey;
            r2Status = 'ready';
            await persistR2Success(candidateKey, r2Url, r2FileSize);
          }
        }

        if (r2Status !== 'ready') {
          const r2Found = await findR2BackupByStreamUid(streamUid);
          if (r2Found.found && r2Found.key) {
            r2Key = r2Found.key;
            r2Url = r2Found.publicUrl || r2Url;
            r2FileSize = r2Found.fileSize || r2FileSize;
            r2Status = 'ready';
            await persistR2Success(r2Found.key, r2Url, r2FileSize);
          }
        }

        if (isReady && r2Status !== 'ready' && !activeR2Syncs.has(streamUid)) {
          activeR2Syncs.add(streamUid);
          backupStreamVideoToR2({
            streamUid,
            filename: mediaDoc?.filename,
            targetKey: r2Key,
          })
            .then(async (syncResult) => {
              if (syncResult.success && syncResult.key) {
                await persistR2Success(
                  syncResult.key,
                  syncResult.publicUrl,
                  syncResult.fileSize
                );
              }
            })
            .finally(() => {
              activeR2Syncs.delete(streamUid);
            });
        }
      } catch (r2Err) {
        req.payload.logger.warn(`[R2 Status Check note]: ${r2Err}`);
      }
    }

    return Response.json({
      ready: isReady,
      status: state,
      pctComplete,
      duration: cfData?.result?.duration,
      input: cfData?.result?.input,
      errorReason: cfData?.result?.status?.errorReasonText,
      r2Status,
      r2Key,
      r2Url,
      r2FileSize,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : 'Failed to check status';
    return Response.json({ error: msg }, { status: 500 });
  }
};
