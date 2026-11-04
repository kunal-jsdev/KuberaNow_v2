import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
} from 'payload';

import { buildStorySegment } from '@/Payload/lib/utilities/articleId';
import { getServerSideURL } from '@/Payload/lib/utilities/getURL';
import type { News, NewsCategory } from '@/payload-types';

const pendingPaths = new Map<string, 'page' | 'layout' | undefined>();
const pendingTags = new Set<string>();
let isFlushing = false;

async function flushRevalidations() {
  if (isFlushing) return;

  const paths = Array.from(pendingPaths.entries()).map(([path, type]) => ({
    path,
    type,
  }));
  const tags = Array.from(pendingTags);

  if (paths.length === 0 && tags.length === 0) return;

  isFlushing = true;
  pendingPaths.clear();
  pendingTags.clear();

  try {
    const serverUrl = getServerSideURL().replace(/\/+$/, '');
    const secret = process.env.CRON_SECRET || process.env.PAYLOAD_SECRET;

    const response = await fetch(`${serverUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ paths, tags }),
    });

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('Failed to flush revalidations:', await response.text());
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error flushing revalidations:', err);
  } finally {
    isFlushing = false;
  }
}

// Module-level interval to flush queue outside of request contexts
if (typeof setInterval !== 'undefined') {
  setInterval(flushRevalidations, 2000);
}

function queueRevalidatePath(path: string, type?: 'page' | 'layout') {
  pendingPaths.set(path, type);
}

function queueRevalidateTag(tag: string) {
  pendingTags.add(tag);
}

/** Paths must be encoded to match the cache key Next assigns prerendered entries. */
const categoryListingPath = (slug: string): string =>
  `/${encodeURIComponent(slug)}`;

const newsArticlePath = (
  categorySlug: string,
  articleSlug: string,
  articleId?: string | null
): string =>
  `/${encodeURIComponent(categorySlug)}/${encodeURIComponent(
    buildStorySegment(articleSlug, articleId)
  )}`;

function getCategoryId(
  category: string | NewsCategory | null | undefined
): string | null {
  if (!category) return null;
  return typeof category === 'string' ? category : category.id;
}

async function resolveCategorySlug(
  category: string | NewsCategory | null | undefined,
  req: PayloadRequest
): Promise<string | null> {
  if (!category) return null;

  if (typeof category === 'object') {
    return category.slug ?? null;
  }

  try {
    const doc = await req.payload.findByID({
      collection: 'news-categories',
      id: category,
      depth: 0,
      select: { slug: true },
      req,
    });

    return doc?.slug ?? null;
  } catch {
    return null;
  }
}

async function revalidateNewsPaths(
  articleSlug: string | null | undefined,
  category: string | NewsCategory | null | undefined,
  req: PayloadRequest,
  logLabel: string,
  articleId?: string | null
): Promise<void> {
  if (!articleSlug && !articleId) return;

  const categorySlug = await resolveCategorySlug(category, req);
  if (!categorySlug) return;

  // 1. Canonical story segment path: /{category}/{slug}-{articleId}
  if (articleSlug && articleId) {
    const canonicalSegment = buildStorySegment(articleSlug, articleId);
    const canonicalPath = newsArticlePath(categorySlug, canonicalSegment);
    req.payload.logger.info(`${logLabel}: ${canonicalPath}`);
    queueRevalidatePath(canonicalPath, 'page');
  }

  // 2. Plain slug path: /{category}/{slug}
  if (articleSlug) {
    const plainPath = newsArticlePath(categorySlug, articleSlug);
    queueRevalidatePath(plainPath, 'page');
  }

  // 3. Short article ID path: /{articleId}
  if (articleId) {
    queueRevalidatePath(`/${encodeURIComponent(articleId)}`, 'page');
  }

  queueRevalidatePath(categoryListingPath(categorySlug), 'page');
  queueRevalidatePath('/rss.xml', 'page');
  queueRevalidatePath(`/rss/${encodeURIComponent(categorySlug)}`, 'page');
}

export const revalidateNews: CollectionAfterChangeHook<News> = async ({
  doc,
  previousDoc,
  req,
}) => {
  const { payload, context } = req;
  // A draft that has never been published is not on the site yet, so there is
  // nothing to revalidate. Skipping these matters: this collection autosaves,
  // so every keystroke-triggered save of a new article would otherwise
  // revalidate the whole layout, and `revalidatePath` throws outside a render
  // context (as when the admin creates the initial autosave draft).
  const isDraftOnly =
    doc._status !== 'published' && previousDoc?._status !== 'published';

  if (!context.disableRevalidate && !isDraftOnly) {
    try {
      if (doc._status === 'published') {
        await revalidateNewsPaths(
          doc.slug,
          doc.category,
          req,
          'Revalidating news article at path',
          doc.article_id
        );
        if (doc.slug) queueRevalidateTag(`news-${doc.slug}`);
        if (doc.article_id) queueRevalidateTag(`news-${doc.article_id}`);
        if (doc.id) queueRevalidateTag(`news-${doc.id}`);
        queueRevalidateTag('news-sitemap');
      }

      const wasUnpublished =
        previousDoc?._status === 'published' && doc._status !== 'published';
      const slugChanged =
        previousDoc?._status === 'published' && previousDoc.slug !== doc.slug;
      const categoryChanged =
        previousDoc?._status === 'published' &&
        getCategoryId(previousDoc.category) !== getCategoryId(doc.category);

      if (wasUnpublished || slugChanged || categoryChanged) {
        await revalidateNewsPaths(
          previousDoc.slug,
          previousDoc.category,
          req,
          'Revalidating old news article at path',
          previousDoc.article_id
        );
        if (previousDoc.slug) queueRevalidateTag(`news-${previousDoc.slug}`);
        if (previousDoc.article_id)
          queueRevalidateTag(`news-${previousDoc.article_id}`);
        if (previousDoc.id) queueRevalidateTag(`news-${previousDoc.id}`);
        queueRevalidateTag('news-sitemap');
      }

      queueRevalidatePath('/', 'layout');
    } catch (err) {
      payload.logger.error({ err }, 'Failed to revalidate news article');
    }
  }

  return doc;
};

export const revalidateNewsDelete: CollectionAfterDeleteHook<News> = async ({
  doc,
  req,
}) => {
  const { payload, context } = req;
  if (!context.disableRevalidate) {
    try {
      if (doc?.slug || doc?.article_id) {
        await revalidateNewsPaths(
          doc.slug,
          doc.category,
          req,
          'Revalidating deleted news article at path',
          doc.article_id
        );
        if (doc?.slug) queueRevalidateTag(`news-${doc.slug}`);
        if (doc?.article_id) queueRevalidateTag(`news-${doc.article_id}`);
        if (doc?.id) queueRevalidateTag(`news-${doc.id}`);
      }

      queueRevalidateTag('news-sitemap');
      queueRevalidatePath('/', 'layout');
    } catch (err) {
      payload.logger.error(
        { err },
        'Failed to revalidate deleted news article'
      );
    }
  }

  return doc;
};
