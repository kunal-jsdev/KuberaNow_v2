import type { PayloadHandler } from 'payload';

import { backupStreamVideoToR2, getR2Config } from '@/Payload/lib/r2';
import {
  getMongoCollection,
  toMongoObjectId,
} from '@/Payload/lib/utilities/mongo';

export const syncR2BackupHandler: PayloadHandler = async (req) => {
  try {
    if (!req.user) {
      return Response.json(
        { error: 'Unauthorized. Please log in to trigger R2 backup.' },
        { status: 401 }
      );
    }

    const url = new URL(req.url || '', 'http://localhost');
    let streamUid = url.searchParams.get('streamUid');
    let videoId = url.searchParams.get('id');

    if (req.json) {
      const body = (await req.json().catch(() => ({}))) as any;
      if (body?.streamUid) streamUid = body.streamUid;
      if (body?.id) videoId = body.id;
    }

    if (!streamUid && videoId) {
      const videoDoc = (await req.payload
        .findByID({
          collection: 'videos',
          id: videoId,
          req,
          overrideAccess: true,
        })
        .catch(() => null)) as any;

      if (videoDoc?.streamUid) {
        streamUid = videoDoc.streamUid;
      }
    }

    if (!streamUid) {
      return Response.json(
        { error: 'Missing streamUid parameter' },
        { status: 400 }
      );
    }

    const r2Config = getR2Config();
    if (!r2Config.isConfigured) {
      return Response.json(
        {
          error: 'Cloudflare R2 is not configured in environment variables.',
          missingKeys: r2Config.missingKeys,
        },
        { status: 400 }
      );
    }

    const mediaDocs = await req.payload.find({
      collection: 'videos-media',
      where: { streamUid: { equals: streamUid } },
      limit: 1,
      req,
      overrideAccess: true,
    });
    const mediaDoc = mediaDocs.docs[0] as any;

    const syncResult = await backupStreamVideoToR2({
      streamUid,
      filename: mediaDoc?.filename,
      targetKey: mediaDoc?.r2Key,
    });

    if (!syncResult.success) {
      return Response.json(
        {
          error: syncResult.error || 'Failed to sync video to Cloudflare R2',
        },
        { status: 502 }
      );
    }

    try {
      const mediaCollection = getMongoCollection(
        req.payload.db,
        'videos-medias'
      );

      if (mediaCollection && mediaDoc?.id) {
        const objId = toMongoObjectId(req.payload.db, String(mediaDoc.id));
        const query = objId
          ? { $or: [{ _id: mediaDoc.id }, { _id: objId }, { streamUid }] }
          : { streamUid };
        await mediaCollection.updateOne(query, {
          $set: {
            r2Key: syncResult.key,
            ...(syncResult.publicUrl ? { r2Url: syncResult.publicUrl } : {}),
            ...(syncResult.fileSize ? { r2FileSize: syncResult.fileSize } : {}),
            r2Status: 'ready',
            updatedAt: new Date(),
          },
        });
      }

      const videoCollection = getMongoCollection(req.payload.db, 'videos');
      if (videoCollection && streamUid) {
        await videoCollection.updateMany(
          { streamUid },
          {
            $set: {
              r2Key: syncResult.key,
              ...(syncResult.publicUrl ? { r2Url: syncResult.publicUrl } : {}),
              ...(syncResult.fileSize
                ? { r2FileSize: syncResult.fileSize }
                : {}),
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
      if (versionsCollection && streamUid) {
        await versionsCollection.updateMany(
          { 'version.streamUid': streamUid },
          {
            $set: {
              'version.r2Key': syncResult.key,
              ...(syncResult.publicUrl
                ? { 'version.r2Url': syncResult.publicUrl }
                : {}),
              ...(syncResult.fileSize
                ? { 'version.r2FileSize': syncResult.fileSize }
                : {}),
              'version.r2Status': 'ready',
            },
          }
        );
      }
    } catch (dbErr) {
      req.payload.logger.warn(`[syncR2Backup DB update warning]: ${dbErr}`);
    }

    if (videoId) {
      try {
        await req.payload.update({
          collection: 'videos',
          id: videoId,
          data: {
            r2Key: syncResult.key,
            ...(syncResult.publicUrl ? { r2Url: syncResult.publicUrl } : {}),
            ...(syncResult.fileSize ? { r2FileSize: syncResult.fileSize } : {}),
            r2Status: 'ready',
          } as any,
          req,
          overrideAccess: true,
        });
      } catch {}
    }

    return Response.json({
      success: true,
      data: {
        r2Key: syncResult.key,
        r2Url: syncResult.publicUrl,
        r2FileSize: syncResult.fileSize,
        r2Status: 'ready',
        alreadyExisted: syncResult.alreadyExisted || false,
      },
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: msg }, { status: 500 });
  }
};
