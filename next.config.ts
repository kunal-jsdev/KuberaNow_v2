import withPWAInit from '@ducanh2912/next-pwa';
import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';
import path from 'path';

import { URL_301_REDIRECTS } from './constants/redirects';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
  fallbacks: {
    document: '/~offline',
  },
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*', 'https://marine-vineyard-anagram.ngrok-free.dev'],
  outputFileTracingIncludes: {
    '/**': ['./node_modules/@img/**'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Allows large video uploads
    },
  },
  serverExternalPackages: ['sharp'],
  sassOptions: {
    includePaths: [
      path.resolve(process.cwd(), 'node_modules/@payloadcms/ui/dist/scss'),
    ],
  },
  expireTime: 60 * 60 * 24 * 30,
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/d36985ec/login',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: '/d36985ec/login',
        permanent: false,
      },
      {
        source: '/rss',
        destination: '/rss.xml',
        permanent: true,
      },
      ...URL_301_REDIRECTS,
    ];
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/assets/**',
      },
      {
        pathname: '/leadership-assets/**',
      },
    ],
    remotePatterns: [
      {
        hostname: 'res.cloudinary.com',
        protocol: 'https',
      },
      {
        hostname: 'images.unsplash.com',
        protocol: 'https',
      },
      {
        hostname: 'picsum.photos',
        protocol: 'https',
      },
      // Cloudflare Stream auto-generated video thumbnails
      {
        hostname: '*.cloudflarestream.com',
        protocol: 'https',
      },
      {
        hostname: 'videodelivery.net',
        protocol: 'https',
      },
    ],
    qualities: [75, 85, 100],
  },
};

export default withPayload(withPWA(nextConfig));
