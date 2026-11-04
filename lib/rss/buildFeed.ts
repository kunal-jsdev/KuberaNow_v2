import configPromise from '@payload-config';
import { getPayload } from 'payload';

import {
  buildArticleUrl,
  getShareImageUrl,
  SITE_URL,
} from '@/lib/utils/jsonLd';
import type { Media, News, NewsCategory } from '@/payload-types';

import { CATEGORY_ALIAS_MAP, RSS_FEEDS } from './feedConfig';

const PUBLISHER_SUFFIX_REGEX =
  /\s*(?:[|·–—-]\s*Kubera\s*Now|\s*:\s*Kubera\s*Now)\s*$/i;

function escapeXml(unsafe?: string | null): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cleanArticleTitle(headline?: string | null): string {
  const raw = (headline || '').trim();
  const cleaned = raw.replace(PUBLISHER_SUFFIX_REGEX, '').trim();
  return cleaned || raw || 'KuberaNow News';
}

function cleanExcerpt(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatRfc822Date(dateInput?: string | Date | null): string {
  if (!dateInput) return new Date().toUTCString();
  const date = new Date(dateInput);
  return Number.isNaN(date.getTime())
    ? new Date().toUTCString()
    : date.toUTCString();
}

export interface BuildFeedOptions {
  categorySlug?: string;
}

export async function generateRssFeedXml(options?: BuildFeedOptions): Promise<{
  xml: string;
  categoryTitle?: string;
  notFound?: boolean;
}> {
  const payload = await getPayload({ config: configPromise });
  const rawCategory = options?.categorySlug?.trim().toLowerCase();

  let targetCmsCategorySlug: string | undefined;
  let categoryDoc: NewsCategory | null = null;
  let feedDef = RSS_FEEDS.find((f) => f.id === 'all');

  if (rawCategory) {
    targetCmsCategorySlug = CATEGORY_ALIAS_MAP[rawCategory] || rawCategory;
    feedDef =
      RSS_FEEDS.find((f) => f.id === rawCategory) ||
      RSS_FEEDS.find((f) => f.categorySlug === targetCmsCategorySlug);

    try {
      const catRes = await payload.find({
        collection: 'news-categories',
        where: {
          slug: { equals: targetCmsCategorySlug },
        },
        limit: 1,
        pagination: false,
        depth: 0,
      });

      if (catRes.docs.length > 0) {
        categoryDoc = catRes.docs[0] as NewsCategory;
      }
    } catch (err) {
      payload.logger.error(
        { err },
        `[RSS] Error finding category ${targetCmsCategorySlug}`
      );
    }
  }

  const nowIso = new Date().toISOString();
  const whereConditions: Record<string, any> = {
    _status: { equals: 'published' },
    // eslint-disable-next-line camelcase
    publishedAt: { less_than_equal: nowIso },
  };

  if (categoryDoc) {
    whereConditions.category = { equals: categoryDoc.id };
  } else if (rawCategory) {
    if (!feedDef) {
      return { xml: '', notFound: true };
    }
    const siteBase = SITE_URL.replace(/\/+$/, '');
    const fallbackTitle = feedDef.titleEn || rawCategory;
    const fallbackTitleGu = feedDef.titleGu || '';
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title>KuberaNow - ${escapeXml(fallbackTitle)}${fallbackTitleGu ? ` (${escapeXml(fallbackTitleGu)})` : ''} - Latest 50 Articles</title>
    <link>${escapeXml(siteBase)}/${escapeXml(rawCategory)}</link>
    <description>${escapeXml(feedDef.description || `Latest 50 articles in ${fallbackTitle} from KuberaNow.`)}</description>
    <language>gu-IN</language>
    <copyright>© 2026 Kubera Now. All rights reserved.</copyright>
    <lastBuildDate>${formatRfc822Date(new Date())}</lastBuildDate>
    <atom:link href="${escapeXml(siteBase)}/rss/${escapeXml(rawCategory)}" rel="self" type="application/rss+xml" />
  </channel>
</rss>
`;
    return { xml, categoryTitle: fallbackTitle };
  }

  let articles: News[] = [];
  try {
    const newsRes = await payload.find({
      collection: 'news',
      where: whereConditions,
      sort: '-publishedAt',
      limit: 50,
      pagination: false,
      depth: 1,
    });
    articles = (newsRes.docs || []) as News[];
  } catch (err) {
    payload.logger.error({ err }, '[RSS] Error fetching news items for feed');
    articles = [];
  }

  const siteBase = SITE_URL.replace(/\/+$/, '');
  let categoryLabel = categoryDoc?.title || '';
  if (categoryDoc && feedDef?.titleEn) {
    if (
      categoryDoc.title.trim().toLowerCase() ===
      feedDef.titleEn.trim().toLowerCase()
    ) {
      categoryLabel = feedDef.titleEn;
    } else {
      categoryLabel = `${categoryDoc.title} (${feedDef.titleEn})`;
    }
  }

  const feedChannelTitle = categoryLabel
    ? `KuberaNow - ${categoryLabel} - Latest 50 Articles`
    : 'KuberaNow - Latest 50 Articles - RSS Feed';

  const feedChannelLink = categoryDoc
    ? `${siteBase}/${categoryDoc.slug}`
    : `${siteBase}/`;

  const feedDescription = categoryDoc
    ? feedDef?.description ||
      `Latest 50 published news and market updates in ${categoryDoc.title} from KuberaNow.`
    : 'Snapshot of the 50 most recent published business, market, and financial articles from KuberaNow.';

  const currentEndpointUrl = rawCategory
    ? `${siteBase}/rss/${rawCategory}`
    : `${siteBase}/rss.xml`;

  const lastBuildDate =
    articles.length > 0 && articles[0].publishedAt
      ? formatRfc822Date(articles[0].publishedAt)
      : formatRfc822Date(new Date());

  const itemsXml = articles
    .map((doc) => {
      const catObj =
        typeof doc.category === 'object' && doc.category !== null
          ? (doc.category as NewsCategory)
          : null;
      const catSlug = catObj?.slug || categoryDoc?.slug || 'news';
      const matchedFeed = RSS_FEEDS.find(
        (f) => f.categorySlug === catSlug || f.id === catSlug
      );
      const catTitle =
        matchedFeed?.titleEn || catObj?.title || categoryDoc?.title || 'News';

      const canonicalUrl = buildArticleUrl(
        catSlug,
        doc.slug || '',
        doc.article_id
      );
      const title = cleanArticleTitle(doc.title);
      const description = cleanExcerpt(doc.summary);
      const pubDate = formatRfc822Date(doc.publishedAt);
      const creator = (doc.newsBy || 'desk@kuberanow').trim();

      const heroMedia = (doc.heroImage || doc.meta?.image) as
        Media | string | null | undefined;
      const imageUrl = getShareImageUrl(heroMedia);

      let mediaTag = '';
      if (imageUrl) {
        mediaTag = `\n      <media:content url="${escapeXml(imageUrl)}" medium="image" type="image/jpeg" width="1200" height="630" />`;
      }

      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(canonicalUrl)}</link>
      <guid isPermaLink="true">${escapeXml(canonicalUrl)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(creator)}</dc:creator>
      <category>${escapeXml(catTitle)}</category>${mediaTag}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title>${escapeXml(feedChannelTitle)}</title>
    <link>${escapeXml(feedChannelLink)}</link>
    <description>${escapeXml(feedDescription)}</description>
    <language>gu-IN</language>
    <copyright>© 2026 Kubera Now. All rights reserved.</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(currentEndpointUrl)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>
`;

  return {
    xml,
    categoryTitle: categoryDoc?.title,
  };
}
