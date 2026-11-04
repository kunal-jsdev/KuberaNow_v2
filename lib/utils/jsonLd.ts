import { HOME_SAME_AS } from '@/constants/mainPage';
import { buildStorySegment } from '@/Payload/lib/utilities/articleId';
import { getMediaUrl } from '@/Payload/lib/utilities/getMediaUrl';
import { getServerSideURL } from '@/Payload/lib/utilities/getURL';
import type { Media, News, NewsCategory } from '@/payload-types';

export const SITE_URL = getServerSideURL().replace(/\/+$/, '');

const SITE_NAME = 'KuberaNow';
const SITE_LOGO_URL = `${SITE_URL}/assets/logo-no-badge.svg`;

/** Default byline used when an article leaves "News By" blank. */
const DEFAULT_NEWS_BY = 'desk@kuberanow';

/** How many articles to list in a category page's ItemList. */
const CATEGORY_ITEM_LIST_LIMIT = 8;

type JsonLdNode = Record<string, unknown>;

/** Anything with the card fields the ItemList needs — full docs or selected ones. */
type NewsListItem = Pick<News, 'slug' | 'title'> & {
  category?: News['category'] | null;
  article_id?: News['article_id'] | null;
};

/**
 * Publisher node. Every graph on the site points at this same `@id`, so search
 * engines resolve one organisation instead of one per page.
 */
export function organizationNode(): JsonLdNode {
  return {
    '@type': 'NewsMediaOrganization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: SITE_LOGO_URL,
    sameAs: HOME_SAME_AS,
  };
}

export function websiteNode(inLanguage: string): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage,
  };
}

/**
 * Schema.org dates must be ISO 8601. Editors can save `publishedAt` as an
 * arbitrary string, and `new Date('nonsense').toISOString()` throws a
 * RangeError — which would take down the whole server-rendered page — so bad
 * values are dropped rather than emitted or thrown.
 */
export function toIsoDate(value?: string | null): string | null {
  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/**
 * Absolute, social-card sized image URL for an article hero. Cloudinary
 * originals get the same 1200x630 JPG transform the OG tags use.
 */
export function getShareImageUrl(
  heroImage: Media | string | null | undefined
): string {
  const heroUrl = getMediaUrl(heroImage);
  if (!heroUrl) return '';

  let imageUrl = /^https?:\/\//i.test(heroUrl)
    ? heroUrl
    : `${SITE_URL}${heroUrl.startsWith('/') ? heroUrl : `/${heroUrl}`}`;

  if (
    imageUrl.includes('res.cloudinary.com') &&
    imageUrl.includes('/upload/') &&
    !imageUrl.includes('/upload/w_1200')
  ) {
    imageUrl = imageUrl
      .replace('/upload/', '/upload/w_1200,h_630,c_fill,q_auto,f_jpg/')
      .replace(/\.[a-zA-Z0-9]+$/, '.jpg');
  }

  return imageUrl;
}

/**
 * Resolves an absolute, social-share-ready thumbnail URL for videos and shorts.
 * If isVertical is true (for 9:16 Shorts), it preserves the full vertical height & width
 * without cropping into a 1200x630 horizontal box.
 */
export function getVideoShareImageUrl(
  thumbnail: Media | string | null | undefined,
  fallbackUrl?: string | null,
  isVertical: boolean = false
): string {
  const mediaUrl = getMediaUrl(thumbnail);
  let imageUrl = mediaUrl || fallbackUrl || '';
  if (!imageUrl) return '';

  if (!/^https?:\/\//i.test(imageUrl)) {
    imageUrl = `${SITE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
  }

  if (
    imageUrl.includes('res.cloudinary.com') &&
    imageUrl.includes('/upload/')
  ) {
    if (isVertical) {
      // For vertical 9:16 shorts: preserve true vertical height & width!
      // Scale with c_limit (never crop out top/bottom) or keep original vertical proportions.
      if (
        !imageUrl.includes('/upload/w_') &&
        !imageUrl.includes('/upload/h_')
      ) {
        imageUrl = imageUrl
          .replace('/upload/', '/upload/w_720,h_1280,c_limit,q_auto,f_jpg/')
          .replace(/\.[a-zA-Z0-9]+$/, '.jpg');
      }
    } else {
      // For horizontal 16:9 videos: standard 1200x630 landscape card
      if (!imageUrl.includes('/upload/w_1200')) {
        imageUrl = imageUrl
          .replace('/upload/', '/upload/w_1200,h_630,c_fill,q_auto,f_jpg/')
          .replace(/\.[a-zA-Z0-9]+$/, '.jpg');
      }
    }
  }

  return imageUrl;
}

/**
 * Resolves the true width & height for a video/short thumbnail.
 * Honors the Media dimensions if available, or falls back to 720x1280 for Shorts / 1200x630 for Landscape.
 */
export function getVideoDimensions(
  thumbnail: Media | string | null | undefined,
  isVertical: boolean = false
): { width: number; height: number } {
  if (typeof thumbnail === 'object' && thumbnail !== null) {
    if (thumbnail.width && thumbnail.height) {
      return { width: thumbnail.width, height: thumbnail.height };
    }
  }
  return isVertical
    ? { width: 720, height: 1280 }
    : { width: 1200, height: 630 };
}

/**
 * Formats a clean description for social share cards (matching article summaries).
 * Strips HTML, normalizes spaces, and trims at a natural length limit if excessively long.
 */
export function formatShareDescription(
  text?: string | null,
  fallback: string = 'Watch on KuberaNow',
  maxLength: number = 160
): string {
  if (!text) return fallback;
  const clean = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return fallback;
  if (clean.length <= maxLength) {
    return clean;
  }
  return `${clean.slice(0, maxLength).trimEnd()}...`;
}

export function buildArticleUrl(
  categorySlug: string,
  slug: string,
  articleId?: string | null
): string {
  const storySegment = buildStorySegment(slug, articleId);
  let cleanSegment = storySegment;
  try {
    cleanSegment = decodeURIComponent(storySegment);
  } catch {
    cleanSegment = storySegment;
  }
  return `${SITE_URL}/${encodeURI(categorySlug)}/${cleanSegment}`;
}

export function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function breadcrumbList(
  id: string,
  crumbs: { name: string; item?: string }[]
): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    '@id': id,
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.item && { item: crumb.item }),
    })),
  };
}

/**
 * About-style page in Gujarati context (e.g. the leadership team): the page
 * node is `about` the organisation and links its breadcrumb by `@id`.
 */
export function buildAboutSubPageJsonLd({
  path,
  title,
  breadcrumbName,
  description,
}: {
  path: string;
  title: string;
  breadcrumbName: string;
  description: string;
}) {
  const pageUrl = `${SITE_URL}${path}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      websiteNode('gu-IN'),
      {
        '@type': 'AboutPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        inLanguage: 'gu-IN',
      },
      breadcrumbList(`${pageUrl}#breadcrumb`, [
        { name: 'Home', item: `${SITE_URL}/` },
        { name: breadcrumbName, item: pageUrl },
      ]),
    ],
  };
}

export function buildAboutPageJsonLd({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const pageUrl = `${SITE_URL}/about-us-kubera-now`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      websiteNode('en-IN'),
      {
        '@type': 'AboutPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-IN',
      },
      breadcrumbList(`${pageUrl}#breadcrumb`, [
        { name: 'Home', item: `${SITE_URL}/` },
        { name: title },
      ]),
    ],
  };
}

/**
 * Generic static-page graph (Organization + WebSite + one page node +
 * breadcrumb) for pages that are neither the homepage, a category listing,
 * nor a news article — disclaimer, contact, careers, advertise, etc.
 */
export function buildStaticPageJsonLd({
  path,
  title,
  description,
  pageType = 'WebPage',
}: {
  path: string;
  title: string;
  description: string;
  pageType?: 'WebPage' | 'AboutPage' | 'ContactPage';
}) {
  const pageUrl = `${SITE_URL}${path}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      websiteNode('en-IN'),
      {
        '@type': pageType,
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        inLanguage: 'en-IN',
      },
      breadcrumbList(`${pageUrl}#breadcrumb`, [
        { name: 'Home', item: `${SITE_URL}/` },
        { name: title },
      ]),
    ],
  };
}

export function buildListingPageJsonLd({
  path,
  title,
  description,
  breadcrumbName,
}: {
  path: string;
  title: string;
  description: string;
  breadcrumbName: string;
}) {
  const pageUrl = `${SITE_URL}${path}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      websiteNode('gu-IN'),
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        inLanguage: 'gu-IN',
      },
      breadcrumbList(`${pageUrl}#breadcrumb`, [
        { name: 'Home', item: `${SITE_URL}/` },
        { name: breadcrumbName, item: pageUrl },
      ]),
    ],
  };
}

export function buildNewsArticleJsonLd({
  news,
  categorySlug,
  articleSlug,
}: {
  news: News;
  categorySlug: string;
  articleSlug: string;
}) {
  const articleUrl = buildArticleUrl(
    categorySlug,
    articleSlug,
    news.article_id
  );
  const category =
    typeof news.category === 'object' && news.category !== null
      ? (news.category as NewsCategory)
      : null;
  const categoryName = category?.title?.trim() || titleFromSlug(categorySlug);

  const description = news.summary || '';
  const imageUrl = getShareImageUrl(news.heroImage as Media | string | null);
  const author = news.newsBy?.trim() || DEFAULT_NEWS_BY;
  const datePublished = toIsoDate(news.publishedAt);
  const dateModified = toIsoDate(news.updatedAt);

  const isLiveBlog = Boolean(news.isLiveBlog);
  const liveUpdates = Array.isArray(news.liveUpdates) ? news.liveUpdates : [];
  const isLiveArticle = isLiveBlog || liveUpdates.length > 0;

  const articleNode: JsonLdNode = {
    '@type': isLiveArticle ? ['NewsArticle', 'LiveBlogPosting'] : 'NewsArticle',
    '@id': `${articleUrl}#article`,
    mainEntityOfPage: { '@id': `${articleUrl}#webpage` },
    headline: news.title,
    description,
    inLanguage: 'gu-IN',
    ...(imageUrl && { image: [imageUrl] }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(isLiveArticle && datePublished && { coverageStartTime: datePublished }),
    ...((!isLiveBlog || news.liveBlogStatus === 'concluded') &&
      liveUpdates.length > 0 &&
      dateModified && { coverageEndTime: dateModified }),
    ...(liveUpdates.length > 0 && {
      liveBlogUpdate: liveUpdates.map((update, idx) => ({
        '@type': 'BlogPosting',
        '@id': `${articleUrl}#update-${update.id || idx}`,
        headline: update.headline,
        datePublished: toIsoDate(update.timestamp) || datePublished,
        dateModified: toIsoDate(update.timestamp) || dateModified,
        articleBody: update.headline,
      })),
    }),
    author: { '@type': 'Person', name: author },
    publisher: { '@id': `${SITE_URL}/#organization` },
    isAccessibleForFree: true,
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      websiteNode('gu-IN'),
      articleNode,
      {
        '@type': 'WebPage',
        '@id': `${articleUrl}#webpage`,
        url: articleUrl,
        name: `${news.title} | ${SITE_NAME}`,
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        breadcrumb: { '@id': `${articleUrl}#breadcrumb` },
        inLanguage: 'gu-IN',
      },
      breadcrumbList(`${articleUrl}#breadcrumb`, [
        { name: 'Home', item: `${SITE_URL}/` },
        {
          name: categoryName,
          item: `${SITE_URL}/${encodeURIComponent(categorySlug)}`,
        },
        { name: news.title },
      ]),
    ],
  };
}

export function buildCategoryPageJsonLd({
  categorySlug,
  categoryTitle,
  title,
  description,
  articles,
}: {
  categorySlug: string;
  categoryTitle?: string | null;
  title?: string | null;
  description?: string | null;
  articles: NewsListItem[];
}) {
  const pageUrl = `${SITE_URL}/${encodeURIComponent(categorySlug)}`;
  const categoryName = categoryTitle?.trim() || titleFromSlug(categorySlug);
  const pageName = title?.trim() || categoryName;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      websiteNode('gu-IN'),
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: pageName,
        ...(description?.trim() && { description: description.trim() }),
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        mainEntity: { '@id': `${pageUrl}#itemlist` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        inLanguage: 'gu-IN',
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#itemlist`,
        itemListElement: articles
          .filter((item) => item.slug && item.title)
          .slice(0, CATEGORY_ITEM_LIST_LIMIT)
          .map((item, index) => {
            const itemCategory =
              typeof item.category === 'object' && item.category !== null
                ? (item.category as NewsCategory)
                : null;
            const itemCategorySlug = itemCategory?.slug || categorySlug;

            return {
              '@type': 'ListItem',
              position: index + 1,
              url: buildArticleUrl(
                itemCategorySlug,
                item.slug,
                item.article_id
              ),
              name: item.title,
            };
          }),
      },
      breadcrumbList(`${pageUrl}#breadcrumb`, [
        { name: 'Home', item: `${SITE_URL}/` },
        { name: categoryName },
      ]),
    ],
  };
}
