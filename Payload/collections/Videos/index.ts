import {
  MetaDescriptionField,
  MetaTitleField,
} from '@payloadcms/plugin-seo/fields';
import {
  APIError,
  type CollectionConfig,
  type Field,
  type FieldHook,
  slugField,
  type TextField,
  type TextFieldSingleValidation,
} from 'payload';

import { authenticatedOrPublished } from '@/Payload/access/authenticatedOrPublished';
import { isAdmin } from '@/Payload/access/isAdmin';
import { staff } from '@/Payload/access/staff';
import {
  revalidateVideoPage,
  revalidateVideoPageDelete,
} from '@/Payload/hooks/revalidateVideoPage';
import { isAdminOrEditorUser } from '@/Payload/lib/Auth/roles';
import { deleteR2VideoBackup } from '@/Payload/lib/r2';
import { generatePreviewPath } from '@/Payload/lib/utilities/generatePreviewPath';
import {
  getMongoCollection,
  toMongoObjectId,
} from '@/Payload/lib/utilities/mongo';
import { unicodeSlugify, validateSlug } from '@/Payload/lib/utilities/slugify';

import { checkCloudflareStatusHandler } from './endpoints/checkCloudflareStatus';
import {
  deleteCloudflareVideoHandler,
  deleteVideoFromCloudflare,
} from './endpoints/deleteCloudflareVideo';
import { getCloudflareR2DownloadUrlHandler } from './endpoints/getCloudflareR2DownloadUrl';
import { getCloudflareUploadUrlHandler } from './endpoints/getCloudflareUploadUrl';
import { syncR2BackupHandler } from './endpoints/syncR2Backup';
import { generateVideoId } from './hooks/generateVideoId';
import { populateAuthors } from './hooks/populateAuthors';

export const Videos: CollectionConfig<'videos'> = {
  slug: 'videos',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'title',
    group: 'Video Collection',
    defaultColumns: [
      'videoThumbnail',
      'title',
      'category',
      'videoSource',
      'ratio',
      'author',
      '_status',
      'createdAt',
    ],
    components: {
      beforeListTable: ['@/Payload/components/VideoListHeader#VideoListHeader'],
      views: {
        edit: {
          versions: {
            Component: '@/Payload/components/ArticleVersionsView#default',
          },
        },
      },
    },
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          videoId: data?.video_id,
          category: data?.category,
          collection: 'videos',
          ratio: data?.ratio,
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        videoId: data?.video_id,
        category: data?.category,
        collection: 'videos',
        ratio: data?.ratio,
        req,
      }),
  },
  access: {
    create: staff,
    delete: isAdmin,
    update: staff,
    read: authenticatedOrPublished,
  },

  endpoints: [
    {
      path: '/get-cloudflare-upload-url',
      method: 'get',
      handler: getCloudflareUploadUrlHandler,
    },
    {
      path: '/check-cloudflare-status',
      method: 'get',
      handler: checkCloudflareStatusHandler,
    },
    {
      path: '/delete-cloudflare-video',
      method: 'post',
      handler: deleteCloudflareVideoHandler,
    },
    {
      path: '/delete-cloudflare-video',
      method: 'delete',
      handler: deleteCloudflareVideoHandler,
    },
    {
      path: '/get-cloudflare-r2-download-url',
      method: 'get',
      handler: getCloudflareR2DownloadUrlHandler,
    },
    {
      path: '/sync-r2-backup',
      method: 'post',
      handler: syncR2BackupHandler,
    },
    {
      path: '/sync-r2-backup',
      method: 'get',
      handler: syncR2BackupHandler,
    },
  ],

  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data;

        const isPublishing =
          data._status === 'published' ||
          (!data._status && originalDoc?._status === 'published');

        if (isPublishing) {
          const videoSource =
            data.videoSource ?? originalDoc?.videoSource ?? 'upload';

          if (videoSource === 'upload') {
            const streamUid =
              data.streamUid !== undefined
                ? data.streamUid
                : originalDoc?.streamUid;

            if (
              !streamUid ||
              typeof streamUid !== 'string' ||
              streamUid.trim() === ''
            ) {
              throw new APIError(
                'Please upload or select a video before publishing.',
                400,
                [
                  {
                    field: 'streamUid',
                    message:
                      'Please upload or select a video before publishing.',
                  },
                ],
                true
              );
            }
          } else if (videoSource === 'youtube') {
            const youtubeUrl =
              data.youtubeUrl !== undefined
                ? data.youtubeUrl
                : originalDoc?.youtubeUrl;

            if (
              !youtubeUrl ||
              typeof youtubeUrl !== 'string' ||
              youtubeUrl.trim() === ''
            ) {
              throw new APIError(
                'Please provide a YouTube URL before publishing.',
                400,
                [
                  {
                    field: 'youtubeUrl',
                    message: 'Please provide a YouTube URL before publishing.',
                  },
                ],
                true
              );
            }
          }
        }

        return data;
      },
    ],
    beforeChange: [
      populateAuthors,
      async ({ data, originalDoc, req }) => {
        if (!data) return data;

        const streamDomain =
          process.env.CLOUDFLARE_STREAM_DOMAIN || 'videodelivery.net';

        if (data.videoSource === 'upload' && data.streamUid) {
          if (
            !data.ratio &&
            originalDoc?.streamUid === data.streamUid &&
            originalDoc?.ratio
          ) {
            data.ratio = originalDoc.ratio;
          }
          if (!data.originalRatio) {
            data.originalRatio =
              originalDoc?.originalRatio ||
              (originalDoc?.streamUid === data.streamUid
                ? originalDoc?.ratio
                : undefined) ||
              data.ratio ||
              '16:9';
          }
          if (!data.hlsUrl || data.hlsUrl === 'pending') {
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

          if (data.cfStatus === 'processing' || !data.cfStatus) {
            try {
              const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
              const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
              if (accountId && apiToken && !accountId.includes('your_')) {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 1500);
                const check = await fetch(
                  `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${data.streamUid}`,
                  {
                    headers: { Authorization: `Bearer ${apiToken}` },
                    signal: controller.signal,
                  }
                ).catch(() => null);
                clearTimeout(timeout);
                if (check?.ok) {
                  const json = (await check.json().catch(() => null)) as {
                    result?: {
                      readyToStream?: boolean;
                      status?: { state?: string };
                    };
                  } | null;
                  if (
                    json?.result?.readyToStream ||
                    json?.result?.status?.state === 'ready'
                  ) {
                    data.cfStatus = 'ready';
                  }
                }
              }
            } catch {}
          }
          if (!data.r2Key || data.r2Status !== 'ready') {
            try {
              const mediaColl = getMongoCollection(
                req?.payload?.db,
                'videos-medias'
              );
              const mediaDoc = await mediaColl?.findOne({
                streamUid: data.streamUid,
              });
              if (mediaDoc?.r2Key && mediaDoc?.r2Status === 'ready') {
                data.r2Key = mediaDoc.r2Key;
                data.r2Status = 'ready';
                if (mediaDoc.r2Url) data.r2Url = mediaDoc.r2Url;
                if (mediaDoc.r2FileSize) data.r2FileSize = mediaDoc.r2FileSize;
              }
            } catch {}
          }
        } else if (data.videoSource === 'youtube' && data.youtubeUrl) {
          data.hlsUrl = data.youtubeUrl;
        }

        return data;
      },
    ],
    afterRead: [
      async ({ doc, req }) => {
        if (!doc) return doc;
        if (doc.videoSource === 'upload' && doc.streamUid) {
          try {
            const mediaColl = getMongoCollection(
              req?.payload?.db,
              'videos-medias'
            );

            let exists = false;
            let mediaDoc: any = null;
            if (mediaColl) {
              mediaDoc = await mediaColl.findOne({
                streamUid: doc.streamUid,
              });
              exists = !!mediaDoc;
            } else if (req?.payload) {
              const res = await req.payload.find({
                collection: 'videos-media',
                where: { streamUid: { equals: doc.streamUid } },
                limit: 1,
                overrideAccess: true,
                req,
              });
              mediaDoc = res.docs[0] || null;
              exists = res.docs.length > 0;
            } else {
              exists = true;
            }

            if (!exists) {
              doc.streamUid = '';
              doc.videoFileName = '';
              doc.hlsUrl = '';
              doc.dashUrl = '';
              doc.thumbnailUrl = '';
              doc.animatedWebpUrl = '';
              doc.cfStatus = 'processing';
              doc.r2Key = '';
              doc.r2Url = '';
              doc.r2FileSize = null;
              doc.r2Status = 'not_configured';
              doc.videoThumbnail = null;

              const videoColl = getMongoCollection(req?.payload?.db, 'videos');
              const versionsColl = getMongoCollection(
                req?.payload?.db,
                '_videos_versions'
              );

              if (videoColl && doc.id) {
                const idStr = String(doc.id);
                const query: any = { $or: [{ _id: idStr }] };
                const objId = toMongoObjectId(req?.payload?.db, idStr);
                if (objId) {
                  query.$or.push({ _id: objId });
                }

                videoColl
                  .updateOne(query, {
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
                  })
                  .catch(() => {});
              }

              if (versionsColl && doc.id) {
                const idStr = String(doc.id);
                const vQuery: any = { $or: [{ parent: idStr }] };
                const objId = toMongoObjectId(req?.payload?.db, idStr);
                if (objId) {
                  vQuery.$or.push({ parent: objId });
                }

                versionsColl
                  .updateMany(vQuery, {
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
                  })
                  .catch(() => {});
              }
            } else if (mediaDoc) {
              if (
                mediaDoc.r2Key &&
                (!doc.r2Key || doc.r2Key !== mediaDoc.r2Key)
              ) {
                doc.r2Key = mediaDoc.r2Key;
              }
              if (
                mediaDoc.r2Url &&
                (!doc.r2Url || doc.r2Url !== mediaDoc.r2Url)
              ) {
                doc.r2Url = mediaDoc.r2Url;
              }
              if (mediaDoc.r2FileSize && !doc.r2FileSize) {
                doc.r2FileSize = mediaDoc.r2FileSize;
              }
              if (mediaDoc.r2Status && doc.r2Status !== mediaDoc.r2Status) {
                doc.r2Status = mediaDoc.r2Status;
              }
              if (!doc.videoFileName && mediaDoc.filename) {
                doc.videoFileName = mediaDoc.filename;
              }
              if (!doc.ratio && mediaDoc.ratio) {
                doc.ratio = mediaDoc.ratio;
              }
              if (!doc.originalRatio && (doc.ratio || mediaDoc.ratio)) {
                doc.originalRatio = doc.ratio || mediaDoc.ratio;
              }
              if (mediaDoc.cfStatus && doc.cfStatus !== mediaDoc.cfStatus) {
                doc.cfStatus = mediaDoc.cfStatus;
              }
            }
          } catch {}
        }
        return doc;
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        if (doc?.streamUid) {
          try {
            const db = (req.payload.db as any)?.connection?.db;
            if (db) {
              const mediaCollection = db.collection('videos-medias');
              const existing = await mediaCollection.findOne({
                streamUid: doc.streamUid,
              });
              const streamDomain =
                process.env.CLOUDFLARE_STREAM_DOMAIN || 'videodelivery.net';
              const cleanTitle = (doc.title || 'Untitled Video').trim();
              const safeFilename =
                doc.videoFileName ||
                `${
                  cleanTitle.toLowerCase().replace(/[^a-z0-9_-]+/g, '-') ||
                  'video'
                }-${doc.streamUid.slice(0, 8)}.mp4`;
              const ratio = doc.ratio === '9:16' ? '9:16' : '16:9';
              const now = new Date();

              if (!existing) {
                await mediaCollection.insertOne({
                  title: cleanTitle,
                  filename: safeFilename,
                  mimeType: 'video/mp4',
                  filesize: 10485760,
                  width: ratio === '9:16' ? 1080 : 1920,
                  height: ratio === '9:16' ? 1920 : 1080,
                  url: `/api/videos-media/file/${safeFilename}`,
                  ratio,
                  streamUid: doc.streamUid,
                  hlsUrl:
                    doc.hlsUrl ||
                    `https://${streamDomain}/${doc.streamUid}/manifest/video.m3u8`,
                  dashUrl:
                    doc.dashUrl ||
                    `https://${streamDomain}/${doc.streamUid}/manifest/video.mpd`,
                  thumbnailUrl:
                    doc.thumbnailUrl ||
                    `https://${streamDomain}/${doc.streamUid}/thumbnails/thumbnail.jpg?time=1s&height=720`,
                  animatedWebpUrl:
                    doc.animatedWebpUrl ||
                    `https://${streamDomain}/${doc.streamUid}/thumbnails/thumbnail.gif`,
                  cfStatus: doc.cfStatus || 'ready',
                  r2Key: doc.r2Key || undefined,
                  r2Url: doc.r2Url || undefined,
                  r2FileSize: doc.r2FileSize || undefined,
                  r2Status: doc.r2Status || 'not_configured',
                  createdAt: now,
                  updatedAt: now,
                });
              } else {
                await mediaCollection.updateOne(
                  { streamUid: doc.streamUid },
                  {
                    $set: {
                      title: cleanTitle,
                      filename: safeFilename,
                      ratio,
                      ...(doc.r2Key ? { r2Key: doc.r2Key } : {}),
                      ...(doc.r2Url ? { r2Url: doc.r2Url } : {}),
                      ...(doc.r2FileSize ? { r2FileSize: doc.r2FileSize } : {}),
                      ...(doc.r2Status ? { r2Status: doc.r2Status } : {}),
                      updatedAt: now,
                    },
                  }
                );
              }
            }
          } catch (err) {
            req.payload.logger.warn(`[Videos afterChange sync note]: ${err}`);
          }
        }
      },
      revalidateVideoPage,
    ],
    afterDelete: [
      async ({ doc }) => {
        if (doc?.streamUid || doc?.r2Key) {
          await deleteR2VideoBackup({
            streamUid: doc?.streamUid,
            r2Key: doc?.r2Key,
            filename: doc?.videoFileName,
          });
        }
        if (doc?.streamUid) {
          await deleteVideoFromCloudflare(doc.streamUid);
        }
      },
      revalidateVideoPageDelete,
    ],
  },

  fields: [
    {
      name: 'videoSidebarPreview',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/Payload/components/SidebarVideoInfo#SidebarVideoInfo',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        components: {
          Cell: '@/Payload/components/VideoListCells/TitleCell#TitleCell',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'news-categories',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'ratio',
          type: 'select',
          options: [
            { label: '16:9 (Horizontal)', value: '16:9' },
            { label: '9:16 (Vertical)', value: '9:16' },
          ],
          defaultValue: '16:9',
          admin: {
            width: '50%',
            components: {
              Description:
                '@/Payload/components/RatioDescription#RatioDescription',
              Cell: '@/Payload/components/VideoListCells/RatioCell#RatioCell',
            },
          },
        },
      ],
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        allowCreate: false,
        allowEdit: true,
        description:
          'Search existing tags, or type a new name and press Enter or comma (,) to add it.',
        components: {
          Field: '@/Payload/components/TagsField#TagsField',
        },
      },
    },
    slugField({
      slugify: unicodeSlugify,
      position: 'main',
      overrides: (field) => {
        const slug = field.fields.find(
          (f: Field) => 'name' in f && f.name === 'slug'
        ) as TextField | undefined;
        if (slug) {
          slug.validate = validateSlug(
            slug.validate as TextFieldSingleValidation | undefined
          );
          slug.hooks = {
            ...slug.hooks,
            beforeValidate: [
              ...(slug.hooks?.beforeValidate || []),
              (({ value, req, data }) => {
                if (typeof value === 'string') {
                  const slugified = unicodeSlugify({
                    data,
                    req,
                    valueToSlugify: value,
                  });
                  return slugified || value;
                }
                return value;
              }) as FieldHook,
            ],
          };
          if (slug.admin?.components) {
            slug.admin.components.Description =
              '@/Payload/collections/News/components/SlugDescription#SlugDescription';
            delete slug.admin.components.Error;
          }
        }

        field.fields.unshift({
          name: 'slugWarningUI',
          type: 'ui',
          admin: {
            components: {
              Field: '@/Payload/components/SlugWarning#SlugWarning',
            },
          },
        });

        return field;
      },
    }),
    {
      name: 'videoSource',
      type: 'radio',
      options: [
        { label: 'YouTube URL (upcoming)', value: 'youtube' },
        { label: 'Upload Video', value: 'upload' },
      ],
      defaultValue: 'upload',
      admin: {
        components: {
          Field: '@/Payload/components/VideoSourceField#VideoSourceField',
          Cell: '@/Payload/components/VideoListCells/SourceCell#SourceCell',
        },
      },
    },
    {
      name: 'youtubeUrl',
      type: 'text',
      label: 'YouTube URL (upcoming)',
      admin: {
        condition: (_, siblingData) => siblingData?.videoSource === 'youtube',
        description: 'Paste a YouTube watch, youtu.be, embed, or Shorts URL.',
      },
      validate: (
        value: unknown,
        { data, siblingData }: { data?: any; siblingData?: any }
      ) => {
        const isPublishing =
          (data as any)?._status === 'published' ||
          (siblingData as any)?._status === 'published';
        const source =
          (siblingData as any)?.videoSource ?? (data as any)?.videoSource;

        if (isPublishing && source === 'youtube') {
          if (!value || typeof value !== 'string' || value.trim() === '') {
            return 'Please provide a YouTube URL before publishing.';
          }
        }
        return true;
      },
    },
    {
      name: 'uploadVideo',
      type: 'ui',
      admin: {
        condition: (_, siblingData) => siblingData?.videoSource === 'upload',
        components: {
          Field: '@/Payload/components/CustomUploadField#CustomUploadField',
        },
      },
    },

    {
      name: 'isRatioAutoDetected',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'originalRatio',
      type: 'select',
      options: [
        { label: '16:9 (Horizontal)', value: '16:9' },
        { label: '9:16 (Vertical)', value: '9:16' },
      ],
      admin: {
        hidden: true,
      },
    },
    {
      name: 'videoFileName',
      type: 'text',
      label: 'Video File Name',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'streamUid',
      type: 'text',
      label: 'Cloudflare Stream UID',
      admin: {
        hidden: true,
        description: 'Set automatically after upload. Do not edit manually.',
      },
      validate: (
        value: unknown,
        { data, siblingData }: { data?: any; siblingData?: any }
      ) => {
        const isPublishing =
          (data as any)?._status === 'published' ||
          (siblingData as any)?._status === 'published';
        const source =
          (siblingData as any)?.videoSource ??
          (data as any)?.videoSource ??
          'upload';

        if (isPublishing && source === 'upload') {
          if (!value || typeof value !== 'string' || value.trim() === '') {
            return 'Please upload or select a video before publishing.';
          }
        }
        return true;
      },
    },
    {
      name: 'hlsUrl',
      type: 'text',
      label: 'HLS Stream URL',
      admin: {
        hidden: true,
        description:
          'Auto-generated from streamUid. Used by the frontend player.',
      },
    },
    {
      name: 'dashUrl',
      type: 'text',
      label: 'DASH Stream URL',
      admin: { hidden: true },
    },
    {
      name: 'thumbnailUrl',
      type: 'text',
      label: 'Cloudflare Thumbnail URL',
      admin: { hidden: true },
    },
    {
      name: 'animatedWebpUrl',
      type: 'text',
      label: 'Animated WebP / GIF URL',
      admin: { hidden: true },
    },
    {
      name: 'cfStatus',
      type: 'select',
      label: 'Processing Status',
      options: [
        { label: '⏳ Processing', value: 'processing' },
        { label: '✅ Ready', value: 'ready' },
        { label: '❌ Failed', value: 'failed' },
      ],
      defaultValue: 'processing',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'r2Key',
      type: 'text',
      label: 'Cloudflare R2 Backup Key',
      admin: { hidden: true },
    },
    {
      name: 'r2Url',
      type: 'text',
      label: 'Cloudflare R2 Download URL',
      admin: { hidden: true },
    },
    {
      name: 'r2FileSize',
      type: 'number',
      label: 'Original Video File Size (Bytes)',
      admin: { hidden: true },
    },
    {
      name: 'r2Status',
      type: 'select',
      label: 'R2 Backup Status',
      options: [
        { label: 'Ready', value: 'ready' },
        { label: 'Uploading', value: 'uploading' },
        { label: 'Not Configured', value: 'not_configured' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'not_configured',
      admin: { hidden: true },
    },
    {
      name: 'meta',
      type: 'group',
      label: false,
      admin: { hideGutter: true },
      fields: [
        // eslint-disable-next-line new-cap
        MetaTitleField({
          hasGenerateFn: true,
          overrides: {
            label: 'SEO Meta Title',
          },
        }),
        // eslint-disable-next-line new-cap
        MetaDescriptionField({
          hasGenerateFn: true,
          overrides: {
            label: 'SEO Meta Description',
          },
        }),
      ],
    },
    {
      name: 'videoThumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Video Thumbnail',
      admin: {
        // disableSort: true,
        components: {
          Field:
            '@/Payload/components/CustomThumbnailField#CustomThumbnailField',
          Cell: '@/Payload/components/VideoListCells/ThumbnailCell#ThumbnailCell',
        },
        description:
          'Optional. Leave empty to automatically use the Cloudflare video thumbnail. Upload a custom image here if you wish to override it (recommended: 16:9 for landscape, 9:16 for vertical).',
      },
    },
    {
      name: 'transcript',
      type: 'textarea',
      admin: {
        components: {
          Field:
            '@/Payload/components/CustomTranscriptField#CustomTranscriptField',
        },
        description:
          'Import from file only (.vtt, .srt, .txt). Non-editable to preserve subtitle timestamp integrity.',
      },
    },
    {
      name: 'video_id',
      type: 'text',
      label: 'videoId',
      unique: true,
      index: true,
      hooks: {
        beforeChange: [generateVideoId],
        // Payload's default for unique text fields appends " - Copy"; a
        // duplicated video should get a fresh id instead.
        beforeDuplicate: [() => undefined],
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Auto-generated when the video is created: YYYYMMDD followed by a 5-digit daily sequence (e.g. 2026100900004). Assigned once and never changes. Short link: /videos/{videoId}.',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      defaultValue: ({ user }) => user?.id,
      admin: {
        position: 'sidebar',
        description:
          'Internal attribution (the user who uploaded / published the video).',
        allowCreate: false,
        allowEdit: false,
      },
      access: {
        update: ({ req: { user } }) => isAdminOrEditorUser(user),
      },
    },
    {
      name: 'updatedBy',
      label: 'Last Modified By',
      type: 'relationship',
      relationTo: 'users',
      defaultValue: ({ user }) => user?.id,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'User who last modified this video / version.',
        allowCreate: false,
        allowEdit: false,
      },
    },
  ],
  versions: {
    drafts: {
      autosave: { interval: 3000 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
};
