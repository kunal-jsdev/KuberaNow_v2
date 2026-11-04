import { NextResponse } from 'next/server';

import {
  buildArticleHref,
  buildStorySegment,
} from '@/Payload/lib/utilities/articleId';
import { getNewsByCategory } from '@/Payload/lib/utilities/getNewsByCategory';
import { getServerSideURL } from '@/Payload/lib/utilities/getURL';

export const dynamic = 'force-dynamic';

const SITE_URL = getServerSideURL().replace(/\/+$/, '');

const IST_OFFSET_MINUTES = 330;

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

const toISTString = (value: string | null | undefined): string | null => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const shifted = new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
  return `${shifted.toISOString().slice(0, 19)}+05:30`;
};

export async function GET(req: Request) {
  const expectedKey = process.env.LATEST_NEWS_API_KEY?.trim();
  if (!expectedKey || req.headers.get('x-api-key') !== expectedKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const categorySlug =
    new URL(req.url).searchParams.get('category')?.trim().toLowerCase() ?? '';
  const [article] = categorySlug
    ? await getNewsByCategory(categorySlug, 1)
    : [];

  const href = article
    ? buildArticleHref(categorySlug, article?.slug, article?.article_id)
    : null;

  if (!article || !href) {
    return NextResponse.json(
      {
        title: null,
        url: categorySlug ? `${SITE_URL}/${categorySlug}` : SITE_URL,
        slug: null,
        published_at: null,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json(
    {
      title: article?.title,
      url: `${SITE_URL}${href}`,
      slug: buildStorySegment(article?.slug, article?.article_id),
      published_at: toISTString(article?.publishedAt),
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
