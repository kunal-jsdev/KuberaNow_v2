import type { CollectionConfig } from 'payload';

import { anyone } from '@/Payload/access/anyone';
import { isAdmin } from '@/Payload/access/isAdmin';
import { staff } from '@/Payload/access/staff';
import { deleteVideoFromCloudflare } from '@/Payload/collections/Videos/endpoints/deleteCloudflareVideo';
import { deleteR2VideoBackup } from '@/Payload/lib/r2';
import {
  getMongoCollection,
  toMongoObjectId,
} from '@/Payload/lib/utilities/mongo';

export const VideosMedia: CollectionConfig = {
  slug: 'videos-media',
  labels: {
    singular: 'Videos Media',
    plural: 'Videos Media',
  },
  folders: true,
  admin: {
    group: 'Video Collection',
    useAsTitle: 'title',
    defaultColumns: ['filename', 'title', 'ratio', 'streamUid', 'createdAt'],
  },
  access: {
    create: staff,
    delete: isAdmin,
    read: anyone,
    update: staff,
  },
  upload: {
    disableLocalStorage: true,
    mimeTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/*'],
    adminThumbnail: ({ doc }) => {
      const videoThumb = doc.videoThumbnail as
        { url?: string } | null | undefined;
      if (typeof videoThumb === 'object' && videoThumb?.url) {
        return videoThumb.url;
      }
      if (typeof doc.thumbnailUrl === 'string' && doc.thumbnailUrl) {
        return doc.thumbnailUrl;
      }
      if (typeof doc.streamUid === 'string' && doc.streamUid) {
        const domain =
          process.env.CLOUDFLARE_STREAM_DOMAIN || 'videodelivery.net';
        return `https://${domain}/${doc.streamUid}/thumbnails/thumbnail.jpg?time=1s&height=720`;
      }
      if (typeof doc.url === 'string' && doc.url) return doc.url;
      return null;
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!data) return data;

        if (!data.title && typeof data.filename === 'string') {
          const cleanName = data.filename
            .replace(/\.[^/.]+$/, '')
            .replace(/[_-]+/g, ' ')
            .trim();
          data.title = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        }

        const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
        const apiToken = (process.env.CLOUDFLARE_STREAM_API_TOKEN || '').trim();
        const streamDomain =
          process.env.CLOUDFLARE_STREAM_DOMAIN || 'videodelivery.net';

        if (!data.streamUid && accountId && apiToken) {
          try {
            const fileBuffer: Buffer | null = (req as any).file?.data || null;

            if (fileBuffer && fileBuffer.length > 0) {
              req.payload.logger.info(
                `[VideosMedia beforeChange] Uploading ${data.filename || 'video'} to Cloudflare Stream...`
              );

              const formData = new FormData();
              const mimeType = (req as any).file?.mimetype || 'video/mp4';
              const blob = new Blob([new Uint8Array(fileBuffer)], {
                type: mimeType,
              });
              formData.append('file', blob, data.filename || 'video.mp4');

              const cfRes = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${apiToken}`,
                  },
                  body: formData,
                }
              );

              if (cfRes.ok) {
                const cfJson = (await cfRes.json().catch(() => ({}))) as any;
                const result = cfJson?.result;

                if (result?.uid) {
                  data.streamUid = result.uid;
                  data.hlsUrl =
                    result.playback?.hls ||
                    `https://${streamDomain}/${result.uid}/manifest/video.m3u8`;
                  data.dashUrl =
                    result.playback?.dash ||
                    `https://${streamDomain}/${result.uid}/manifest/video.mpd`;
                  data.thumbnailUrl =
                    result.thumbnail ||
                    `https://${streamDomain}/${result.uid}/thumbnails/thumbnail.jpg?time=1s&height=720`;
                  data.animatedWebpUrl = `https://${streamDomain}/${result.uid}/thumbnails/thumbnail.gif`;
                  data.cfStatus =
                    result.status?.state === 'ready' ? 'ready' : 'processing';

                  if (result.dimensions?.width && result.dimensions?.height) {
                    data.ratio =
                      result.dimensions.height > result.dimensions.width
                        ? '9:16'
                        : '16:9';
                  }

                  req.payload.logger.info(
                    `[VideosMedia beforeChange] Successfully uploaded to Cloudflare Stream: ${result.uid}`
                  );
                }
              } else {
                const errText = await cfRes.text().catch(() => '');
                req.payload.logger.error(
                  `[VideosMedia beforeChange] Cloudflare upload failed (HTTP ${cfRes.status}): ${errText.slice(0, 160)}`
                );
              }
            }
          } catch (uploadErr) {
            req.payload.logger.error(
              `[VideosMedia beforeChange] Error uploading video to Cloudflare Stream: ${uploadErr}`
            );
          }
        }

        if (data.streamUid) {
          if (!data.hlsUrl) {
            data.hlsUrl = `https://${streamDomain}/${data.streamUid}/manifest/video.m3u8`;
          }
          if (!data.dashUrl) {
            data.dashUrl = `https://${streamDomain}/${data.streamUid}/manifest/video.mpd`;
          }
          if (!data.thumbnailUrl) {
            data.thumbnailUrl = `https://${streamDomain}/${data.streamUid}/thumbnails/thumbnail.jpg?time=1s&height=720`;
          }
          if (!data.animatedWebpUrl) {
            data.animatedWebpUrl = `https://${streamDomain}/${data.streamUid}/thumbnails/thumbnail.gif`;
          }
          if (data.hlsUrl) {
            data.url = data.hlsUrl;
          }
        }

        return data;
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        try {
          let doc: any = null;
          try {
            doc = await req.payload.findByID({
              collection: 'videos-media',
              id,
              req,
              overrideAccess: true,
            });
          } catch {}

          if (!doc) {
            const mediaColl = getMongoCollection(
              req.payload.db,
              'videos-medias'
            );
            const objId = toMongoObjectId(req.payload.db, String(id));
            doc = await mediaColl?.findOne(
              objId ? { $or: [{ _id: id }, { _id: objId }] } : { _id: id }
            );
          }

          if (doc) {
            (req as any)._deletingMediaDoc = doc;
            const streamUid = doc.streamUid;
            const r2Key = doc.r2Key;
            const filename = doc.filename;

            req.payload.logger.info(
              `[VideosMedia beforeDelete] Deleting R2 backup and Cloudflare Stream for media ${id} (streamUid: ${streamUid}, r2Key: ${r2Key})...`
            );

            await deleteR2VideoBackup({
              streamUid,
              r2Key,
              filename,
            });

            if (streamUid) {
              await deleteVideoFromCloudflare(streamUid);
            }
          }
        } catch (err) {
          req.payload.logger.error(`[VideosMedia beforeDelete error]: ${err}`);
        }
      },
    ],
    afterDelete: [
      async ({ doc: rawDoc, req, id }) => {
        const doc = rawDoc || (req as any)?._deletingMediaDoc;
        const streamUid = doc?.streamUid;
        const r2Key = doc?.r2Key;
        const filename = doc?.filename;
        const mediaId = doc?.id || id;

        if (r2Key || streamUid) {
          try {
            await deleteR2VideoBackup({
              streamUid,
              r2Key,
              filename,
            });
          } catch (r2Err) {
            req.payload.logger.warn(
              `[VideosMedia afterDelete] R2 deletion notice: ${r2Err}`
            );
          }
        }

        if (streamUid) {
          try {
            await deleteVideoFromCloudflare(streamUid);
          } catch {}
        }

        if (streamUid || mediaId) {
          try {
            const videoColl = getMongoCollection(req.payload.db, 'videos');
            const versionsColl = getMongoCollection(
              req.payload.db,
              '_videos_versions'
            );

            const filterConditions: any[] = [];
            if (streamUid) filterConditions.push({ streamUid });
            if (mediaId) {
              filterConditions.push({ videoThumbnail: mediaId });
              const strId = String(mediaId);
              if (strId.length === 24) {
                const mId = toMongoObjectId(req.payload.db, strId);
                if (mId) filterConditions.push({ videoThumbnail: mId });
              }
            }

            if (videoColl && filterConditions.length > 0) {
              await videoColl.updateMany(
                { $or: filterConditions },
                {
                  $set: {
                    streamUid: '',
                    videoFileName: '',
                    hlsUrl: '',
                    dashUrl: '',
                    thumbnailUrl: '',
                    animatedWebpUrl: '',
                    cfStatus: 'processing',
                    r2Key: '',
                    r2Url: '',
                    r2FileSize: null,
                    r2Status: 'not_configured',
                    videoThumbnail: null,
                  },
                  $unset: {
                    videoThumbnail: 1,
                    r2Key: 1,
                    r2Url: 1,
                    r2FileSize: 1,
                    r2Status: 1,
                  },
                }
              );
            }

            const versionConditions: any[] = [];
            if (streamUid)
              versionConditions.push({ 'version.streamUid': streamUid });
            if (mediaId) {
              versionConditions.push({ 'version.videoThumbnail': mediaId });
              const strId = String(mediaId);
              if (strId.length === 24) {
                const mId = toMongoObjectId(req.payload.db, strId);
                if (mId)
                  versionConditions.push({ 'version.videoThumbnail': mId });
              }
            }

            if (versionsColl && versionConditions.length > 0) {
              await versionsColl.updateMany(
                { $or: versionConditions },
                {
                  $set: {
                    'version.streamUid': '',
                    'version.videoFileName': '',
                    'version.hlsUrl': '',
                    'version.dashUrl': '',
                    'version.thumbnailUrl': '',
                    'version.animatedWebpUrl': '',
                    'version.cfStatus': 'processing',
                    'version.r2Key': '',
                    'version.r2Url': '',
                    'version.r2FileSize': null,
                    'version.r2Status': 'not_configured',
                    'version.videoThumbnail': null,
                  },
                  $unset: {
                    'version.videoThumbnail': 1,
                    'version.r2Key': 1,
                    'version.r2Url': 1,
                    'version.r2FileSize': 1,
                    'version.r2Status': 1,
                  },
                }
              );
            }

            if (streamUid) {
              try {
                const matching = await req.payload.find({
                  collection: 'videos',
                  where: {
                    streamUid: {
                      equals: streamUid,
                    },
                  },
                  draft: true,
                  limit: 100,
                  overrideAccess: true,
                  req,
                });

                for (const vid of matching.docs) {
                  await req.payload.update({
                    collection: 'videos',
                    id: vid.id,
                    data: {
                      streamUid: '',
                      videoFileName: '',
                      hlsUrl: '',
                      dashUrl: '',
                      thumbnailUrl: '',
                      animatedWebpUrl: '',
                      cfStatus: 'processing',
                      videoThumbnail: null,
                      r2Key: '',
                      r2Url: '',
                      r2FileSize: null as any,
                      r2Status: 'not_configured' as any,
                    } as any,
                    draft: true,
                    overrideAccess: true,
                    req,
                  });
                }
              } catch {}
            }

            req.payload.logger.info(
              `[VideosMedia afterDelete] Discarded video and thumbnail for ${streamUid || mediaId} from all entries.`
            );
          } catch (err) {
            req.payload.logger.error(
              `[VideosMedia afterDelete] Error discarding video from videos collection: ${err}`
            );
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'autoDetect',
      type: 'ui',
      admin: {
        components: {
          Field:
            '@/Payload/components/VideosMediaAutoDetect#VideosMediaAutoDetect',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      admin: {
        description:
          'Auto-populated from video file name. You can edit it if needed.',
      },
    },
    {
      name: 'ratio',
      type: 'select',
      label: 'Ratio',
      defaultValue: '16:9',
      options: [
        { label: '16:9 (Horizontal)', value: '16:9' },
        { label: '9:16 (Vertical)', value: '9:16' },
      ],
      admin: {
        description: 'Auto-detected from video resolution.',
        components: {
          Cell: '@/Payload/components/VideoListCells/RatioCell#RatioCell',
        },
      },
    },
    {
      name: 'videoThumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Custom Thumbnail (Optional)',
      admin: {
        description:
          'Optional: select or upload a custom thumbnail. If left empty, the video’s auto-generated thumbnail from Cloudflare will be used.',
      },
    },
    {
      name: 'streamUid',
      type: 'text',
      label: 'Cloudflare Stream UID',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'hlsUrl',
      type: 'text',
      label: 'HLS Stream URL',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'dashUrl',
      type: 'text',
      label: 'DASH Stream URL',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'thumbnailUrl',
      type: 'text',
      label: 'Thumbnail URL',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'animatedWebpUrl',
      type: 'text',
      label: 'Animated WebP / GIF URL',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'cfStatus',
      type: 'select',
      label: 'Status',
      defaultValue: 'ready',
      options: [
        { label: 'Ready', value: 'ready' },
        { label: 'Processing', value: 'processing' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        hidden: true,
      },
    },
    {
      name: 'r2Key',
      type: 'text',
      label: 'Cloudflare R2 Backup Key',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'r2Url',
      type: 'text',
      label: 'Cloudflare R2 Download URL',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'r2FileSize',
      type: 'number',
      label: 'Original Video File Size (Bytes)',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'r2Status',
      type: 'select',
      label: 'R2 Backup Status',
      defaultValue: 'not_configured',
      options: [
        { label: 'Ready', value: 'ready' },
        { label: 'Uploading', value: 'uploading' },
        { label: 'Not Configured', value: 'not_configured' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        hidden: true,
      },
    },
  ],
  endpoints: [
    {
      path: '/register',
      method: 'post',
      handler: async (req) => {
        try {
          const body = (await req.json?.().catch(() => ({}))) || {};
          if (!body.streamUid) {
            return Response.json(
              { error: 'Missing streamUid' },
              { status: 400 }
            );
          }

          const streamDomain =
            process.env.CLOUDFLARE_STREAM_DOMAIN || 'videodelivery.net';

          const existing = await req.payload.find({
            collection: 'videos-media',
            where: {
              streamUid: {
                equals: body.streamUid,
              },
            },
            limit: 1,
            req,
          });

          if (existing.docs.length > 0) {
            const existingDoc = existing.docs[0] as any;
            if (
              body.r2Key &&
              (!existingDoc.r2Key || existingDoc.r2Status !== 'ready')
            ) {
              try {
                const mediaCollection = getMongoCollection(
                  req.payload.db,
                  'videos-medias'
                );

                if (mediaCollection) {
                  const docId = existingDoc.id || existingDoc._id;
                  const objId = toMongoObjectId(req.payload.db, String(docId));
                  const query = objId
                    ? {
                        $or: [
                          { _id: docId },
                          { _id: objId },
                          { streamUid: body.streamUid },
                        ],
                      }
                    : { streamUid: body.streamUid };
                  await mediaCollection.updateOne(query, {
                    $set: {
                      r2Key: body.r2Key,
                      ...(body.r2Url ? { r2Url: body.r2Url } : {}),
                      ...(body.r2FileSize
                        ? { r2FileSize: body.r2FileSize }
                        : {}),
                      r2Status: body.r2Status || 'ready',
                      updatedAt: new Date(),
                    },
                  });
                } else {
                  await req.payload.update({
                    collection: 'videos-media',
                    id: existingDoc.id,
                    data: {
                      r2Key: body.r2Key,
                      ...(body.r2Url ? { r2Url: body.r2Url } : {}),
                      ...(body.r2FileSize
                        ? { r2FileSize: body.r2FileSize }
                        : {}),
                      r2Status: body.r2Status || 'ready',
                    } as any,
                    req,
                    overrideAccess: true,
                  });
                }
              } catch {}
            }
            return Response.json({ success: true, doc: existing.docs[0] });
          }

          const cleanTitle = (body.title || 'Uploaded Video').trim();
          const safeFilename =
            body.filename ||
            `${cleanTitle.toLowerCase().replace(/[^a-z0-9_-]+/g, '-') || 'video'}-${body.streamUid.slice(0, 8)}.mp4`;
          const ratio = body.ratio === '9:16' ? '9:16' : '16:9';
          const now = new Date();

          const docData = {
            title: cleanTitle,
            filename: safeFilename,
            mimeType: 'video/mp4',
            filesize: body.r2FileSize || 10485760,
            width: ratio === '9:16' ? 1080 : 1920,
            height: ratio === '9:16' ? 1920 : 1080,
            url: `/api/videos-media/file/${safeFilename}`,
            ratio,
            streamUid: body.streamUid,
            hlsUrl:
              body.hlsUrl ||
              `https://${streamDomain}/${body.streamUid}/manifest/video.m3u8`,
            dashUrl:
              body.dashUrl ||
              `https://${streamDomain}/${body.streamUid}/manifest/video.mpd`,
            thumbnailUrl:
              body.thumbnailUrl ||
              `https://${streamDomain}/${body.streamUid}/thumbnails/thumbnail.jpg?time=1s&height=720`,
            animatedWebpUrl:
              body.animatedWebpUrl ||
              `https://${streamDomain}/${body.streamUid}/thumbnails/thumbnail.gif`,
            cfStatus: body.cfStatus || 'ready',
            r2Key: body.r2Key || null,
            r2Url: body.r2Url || null,
            r2FileSize: body.r2FileSize || null,
            r2Status:
              body.r2Status || (body.r2Key ? 'ready' : 'not_configured'),
            createdAt: now,
            updatedAt: now,
          };

          const mediaCollection = getMongoCollection(
            req.payload.db,
            'videos-medias'
          );

          if (mediaCollection) {
            const insertResult = await mediaCollection.insertOne(docData);
            return Response.json({
              success: true,
              id: insertResult.insertedId,
              doc: { ...docData, id: insertResult.insertedId },
            });
          }

          const createdDoc = await req.payload.create({
            collection: 'videos-media',
            data: docData as any,
            req,
            overrideAccess: true,
          });

          return Response.json({
            success: true,
            id: createdDoc.id,
            doc: createdDoc,
          });
        } catch (err: unknown) {
          const msg =
            err instanceof Error ? err.message : 'Registration failed';
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  ],
};

export default VideosMedia;
