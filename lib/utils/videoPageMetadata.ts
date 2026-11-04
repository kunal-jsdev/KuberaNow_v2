import type { Metadata } from 'next';

import { VIDEO_PAGE_SEO } from '@/constants/pageSeo';
import { robotsMetadata } from '@/utils';

type VideoPageSeo = (typeof VIDEO_PAGE_SEO)[keyof typeof VIDEO_PAGE_SEO];

const DEFAULT_SHARE_IMAGE = '/assets/openGraph.jpg';

/**
 * Metadata for the /videos and /short-videos listing pages: title,
 * description, keywords, canonical and matching Open Graph / Twitter cards.
 */
export function buildVideoPageMetadata(seo: VideoPageSeo): Metadata {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SERVER_URL || 'https://kuberanow.com'
  ).replace(/\/+$/, '');
  const url = `${siteUrl}${seo.path}`;
  const image = `${siteUrl}${DEFAULT_SHARE_IMAGE}`;

  return {
    title: { absolute: seo.title },
    description: seo.description,
    keywords: [...seo.keywords],
    alternates: { canonical: url },
    robots: robotsMetadata,
    openGraph: {
      type: 'website',
      title: seo.title,
      description: seo.description,
      url,
      siteName: 'KuberaNow',
      images: [{ url: image, alt: seo.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [image],
    },
  };
}
