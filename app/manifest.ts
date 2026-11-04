import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'KuberaNow',
    short_name: 'KuberaNow',
    description:
      'Breaking news, real-time market updates, and offline reading.',
    start_url:
      '/?utm_source=pwa&utm_medium=homescreen&utm_campaign=pwa_install',
    display: 'standalone',
    orientation: 'any',
    background_color: '#ffffff',
    theme_color: '#0076ff',
    categories: ['news', 'finance', 'business'],
    icons: [
      {
        src: 'pwa_icon_two_new.jpg',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'pwa_icon_two_new.jpg',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'pwa_icon_two_new.jpg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: 'pwa_icon_two_new.jpg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: 'pwa_icon_two_new.jpg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
