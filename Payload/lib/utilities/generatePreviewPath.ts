import { CollectionSlug, PayloadRequest } from 'payload';

import { PreviewSearchParams } from '@/app/(frontend)/next/preview/route';
import { buildStorySegment } from '@/Payload/lib/utilities/articleId';
import { buildVideoSegment } from '@/Payload/lib/utilities/videoId';

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  pages: '',
  news: '',
  videos: '/videos',
};

type Props = {
  collection: keyof typeof collectionPrefixMap;
  slug: string;
  /** News only: the article id, so preview opens the canonical `-{id}` URL. */
  articleId?: unknown;
  category?: unknown;
  /** Videos only: vertical (9:16) videos live under `/short-videos`. */
  ratio?: unknown;
  /** Videos only: the video id, so preview opens the canonical `-{id}` URL. */
  videoId?: unknown;
  req: PayloadRequest;
};

async function resolveCategorySlug(
  category: unknown,
  req: PayloadRequest
): Promise<string | null> {
  if (!category) return null;

  if (typeof category === 'object' && 'slug' in category) {
    const { slug } = category as { slug?: unknown };
    if (typeof slug === 'string') return slug;
  }

  let id = '';
  if (typeof category === 'string') {
    id = category;
  } else if (typeof category === 'object' && 'id' in category) {
    id = String((category as { id?: unknown }).id ?? '');
  }

  if (!id) return null;

  try {
    const doc = await req.payload.findByID({
      collection: 'news-categories',
      id,
      depth: 0,
      select: { slug: true },
    });

    return typeof doc?.slug === 'string' ? doc.slug : null;
  } catch {
    return null;
  }
}

export const generatePreviewPath = async ({
  collection,
  slug,
  articleId,
  category,
  ratio,
  videoId,
  req,
}: Props): Promise<string | null> => {
  if (slug === undefined || slug === null) {
    return null;
  }

  const encodedSlug = encodeURIComponent(slug);

  let path: string;

  if (collection === 'news') {
    const categorySlug = await resolveCategorySlug(category, req);

    if (!categorySlug) {
      return null;
    }

    const id = typeof articleId === 'string' && articleId ? articleId : null;
    const storySegment = buildStorySegment(slug, id);

    // Neither half of the address exists yet -- a new article still being
    // typed, before the save that assigns its slug and id. Without a segment
    // the path would be `/{category}/`, which the route reads as a category
    // listing and would preview the wrong page entirely.
    if (!storySegment) {
      return null;
    }

    path = `/${encodeURIComponent(categorySlug)}/${encodeURIComponent(
      storySegment
    )}`;
  } else if (collection === 'videos') {
    const vId = typeof videoId === 'string' && videoId ? videoId : null;
    const videoSegment = buildVideoSegment(slug, vId);
    const encodedSegment = encodeURIComponent(videoSegment);
    path =
      ratio === '9:16'
        ? `/short-videos/${encodedSegment}`
        : `/videos/${encodedSegment}`;
  } else if (slug === 'home') {
    path = '/';
  } else {
    path = `${collectionPrefixMap[collection]}/${encodedSlug}`.replace(
      /\/{2,}/g,
      '/'
    );
  }

  const encodedParams = new URLSearchParams({
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams);

  return `/next/preview?${encodedParams.toString()}`;
};
