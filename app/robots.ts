import type { MetadataRoute } from 'next';

import { isStagingEnvironment } from '@/utils';

export default function robots(): MetadataRoute.Robots {
  if (isStagingEnvironment()) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  const siteUrl = (
    process.env.NEXT_PUBLIC_SERVER_URL || 'https://kuberanow.com'
  ).replace(/\/+$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/next'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
