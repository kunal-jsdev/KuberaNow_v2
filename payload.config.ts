import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

import { releaseStaleJobs, startJobWorkerOnce } from '@/Payload/jobs/jobWorker';

import {
  getCronSecret,
  getDatabaseUrl,
  getPayloadSecret,
} from './lib/env/validateEnv';
import { CustomNavLinks } from './Payload/collections/CustomNavLinks';
import { LottieFiles } from './Payload/collections/LottieFiles';
import { Media } from './Payload/collections/Media';
import { News } from './Payload/collections/News';
import { NewsCategories } from './Payload/collections/NewsCategories';
import { NewsSearchCounts } from './Payload/collections/NewsSearchCounts';
import { Pages } from './Payload/collections/Pages';
import { Sidebars } from './Payload/collections/Sidebars';
import { Tags } from './Payload/collections/Tags';
import { Users } from './Payload/collections/Users';
import { Videos } from './Payload/collections/Videos';
import { VideosMedia } from './Payload/collections/VideosMedia';
import { Carousel } from './Payload/globals/Carousel';
import { FloatingCTA } from './Payload/globals/FloatingCTA';
import { NavConfig } from './Payload/globals/NavConfig';
import { PinnedArticles } from './Payload/globals/PinnedArticles';
import { PinnedNewsCategories } from './Payload/globals/PinnedNewsCategories';
import { PinnedVideos } from './Payload/globals/PinnedVideos';
import { adjustScheduleTime } from './Payload/hooks/adjustScheduleTime';
import { plugins } from './Payload/plugins';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  routes: {
    admin: '/d36985ec',
  },
  // Start the job worker as soon as Payload initialises, whichever route got
  // there first. Payload only starts its cron when something calls
  // `getPayload({ cron: true })`, and inside Next that is done exclusively by
  // @payloadcms/next when rendering the admin panel or handling auth — never by
  // the frontend's own `getPayload({ config })` calls. Without this, scheduled
  // publishing depends on somebody having opened the admin panel in the current
  // server process, which is why jobs sat in the queue with `totalTried: 0`.
  //
  // Admin requests also start crons via `getPayload({ cron: true })`;
  // `startJobWorkerOnce` makes those later calls no-ops so only one worker runs.
  onInit: async (payload) => {
    if (process.env.ENABLE_PAYLOAD_AUTORUN !== 'true') return;

    await startJobWorkerOnce(payload);

    const jobsCollection = payload.collections['payload-jobs'];
    if (jobsCollection) {
      if (!jobsCollection.config.hooks.beforeChange) {
        jobsCollection.config.hooks.beforeChange = [];
      }
      if (
        !jobsCollection.config.hooks.beforeChange.includes(adjustScheduleTime)
      ) {
        jobsCollection.config.hooks.beforeChange.push(adjustScheduleTime);
      }
    }

    try {
      const publishedLiveBlogs = await payload.find({
        collection: 'news',
        draft: false,
        where: {
          isLiveBlog: { equals: true },
        },
        depth: 0,
        limit: 100,
      });

      for (const pubDoc of publishedLiveBlogs.docs) {
        const draftDoc = await payload.findByID({
          collection: 'news',
          id: pubDoc.id,
          draft: true,
          depth: 0,
        });

        if (
          draftDoc &&
          (!draftDoc.isInActiveBlogs || !draftDoc.publishedIsLiveBlog)
        ) {
          await payload.update({
            collection: 'news',
            id: pubDoc.id,
            draft: true,
            data: {
              publishedIsLiveBlog: true,
              isInActiveBlogs: true,
              liveBlogStatus: 'active',
            },
          });
        }
      }
    } catch {}
  },
  jobs: {
    enableConcurrencyControl: true,
    // Payload derives `jobs.enabled` from the tasks/workflows declared *here*,
    // in the authored config. The `schedulePublish` task is appended
    // internally, but only after that check has already run — so a config that
    // declares no tasks of its own leaves the job system disabled, no cron is
    // ever started, and scheduled articles sit in the queue untouched forever.
    // This no-op task exists solely to flip that flag on.
    tasks: [
      {
        slug: 'noop',
        handler: () => ({ output: {} }),
      },
      {
        slug: 'schedulePublish',
        concurrency: {
          exclusive: true,
          key: ({ input }) =>
            input?.doc
              ? `schedulePublish:${input.doc.relationTo}:${input.doc.value}`
              : `schedulePublish:global:${input?.global}`,
        },
        retries: {
          attempts: 10,
          backoff: { type: 'fixed', delay: 2000 },
        },
        handler: async ({ input, req }) => {
          //eslint-disable-next-line no-console
          console.log(
            `[Job Worker - ${new Date().toISOString()}] Executing schedulePublish for doc relation: ${
              input?.doc?.relationTo
            }, value: ${input?.doc?.value}`
          );

          const _status =
            input?.type === 'publish' || !input?.type ? 'published' : 'draft';
          // Since Payload 3.90 the scheduling user is stored as a polymorphic
          // relationship `{ relationTo, value }`. Jobs queued before the
          // upgrade stored the plain user ID, so accept both shapes.
          const inputUser = input?.user as
            | string
            | number
            | {
                relationTo: string;
                value: string | number | { id: string | number };
              }
            | null
            | undefined;
          const userCollection = (
            typeof inputUser === 'object' && inputUser?.relationTo
              ? inputUser.relationTo
              : req.payload.config.admin.user
          ) as 'users';
          const userValue =
            typeof inputUser === 'object' ? inputUser?.value : inputUser;
          const userID =
            typeof userValue === 'object' ? userValue?.id : userValue;
          let user: Record<string, unknown> | null = null;

          if (userID) {
            const foundUser = await req.payload.findByID({
              id: userID,
              collection: userCollection,
              depth: 0,
              req,
            });
            user = foundUser as unknown as Record<string, unknown>;
            if (user) {
              user.collection = userCollection;
            }
          }

          let publishSpecificLocale: string | undefined;

          if (
            input?.type === 'publish' &&
            input.locale &&
            req.payload.config.localization
          ) {
            const locales = req.payload.config.localization
              .locales as unknown as Array<{ code: string }>;
            const matchedLocale = locales.find(
              (locale) => locale.code === input.locale
            );

            if (matchedLocale) {
              publishSpecificLocale = input.locale;
            }
          }

          if (input.doc) {
            const collections = req.payload.collections as unknown as Record<
              string,
              { customIDType?: string }
            >;
            const idType =
              collections[input.doc.relationTo]?.customIDType ??
              req.payload.db?.defaultIDType ??
              'text';
            const id =
              idType === 'number' ? Number(input.doc.value) : input.doc.value;

            await req.payload.update({
              id,
              collection: input.doc.relationTo as unknown as 'news',
              data: { _status },
              depth: 0,
              disableTransaction: true,
              overrideAccess: user === null,
              publishSpecificLocale:
                publishSpecificLocale as unknown as undefined,
              user: user as unknown as undefined,
              req,
            });
          }

          if (input.global) {
            await req.payload.updateGlobal({
              slug: input.global as unknown as 'carousel',
              data: { _status },
              depth: 0,
              overrideAccess: user === null,
              publishSpecificLocale:
                publishSpecificLocale as unknown as undefined,
              user: user as unknown as undefined,
              req,
            });
          }

          return { output: {} };
        },
      },
    ],
    // Scheduled publish/unpublish is queued as a job; nothing happens until a
    // worker drains the queue. On a long-lived Node process (the AWS server)
    // this built-in cron is that worker. Off by default so `next build` and
    // local tooling do not start a scheduler.
    autoRun:
      process.env.ENABLE_PAYLOAD_AUTORUN === 'true'
        ? [{ cron: '* * * * *', limit: 100 }]
        : undefined,
    // Belt and braces: never let the scheduler start during a production build.
    // Runs before every cron tick, so it also recovers jobs orphaned by a
    // restart before the queue is drained.
    shouldAutoRun: async (payload) => {
      if (process.env.NEXT_PHASE === 'phase-production-build') return false;
      await releaseStaleJobs(payload);
      return true;
    },
    // Also allow an external cron (or a logged-in admin) to drive the queue over
    // HTTP at GET /api/payload-jobs/run.
    access: {
      run: ({ req }) => {
        if (req.user) return true;
        const cronSecret = getCronSecret();
        if (!cronSecret) return false;
        return req.headers.get('authorization') === `Bearer ${cronSecret}`;
      },
    },
  },
  admin: {
    user: Users.slug,
    avatar: {
      Component: '@/Payload/components/AdminAvatar#default',
    },
    components: {
      beforeLogin: ['@/Payload/components/PasswordToggle#default'],
      views: {
        forgot: {
          Component: '@/Payload/components/ForgotPasswordDisabled#default',
          path: '/forgot',
          exact: true,
        },
      },
      providers: ['@/Payload/components/ActiveLiveBlogsBadge#default'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    timezones: {
      defaultTimezone: 'Asia/Kolkata',
      supportedTimezones: [{ label: 'Asia/Kolkata', value: 'Asia/Kolkata' }],
    },
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  globals: [
    Carousel,
    PinnedArticles,
    PinnedNewsCategories,
    FloatingCTA,
    NavConfig,
    PinnedVideos,
  ],
  collections: [
    Pages,
    News,
    NewsCategories,
    Tags,
    Users,
    Media,
    Sidebars,
    NewsSearchCounts,
    LottieFiles,
    Videos,
    VideosMedia,
    CustomNavLinks,
  ],
  editor: lexicalEditor(),
  plugins,
  secret: getPayloadSecret(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: getDatabaseUrl(),
  }),
  sharp,
});
