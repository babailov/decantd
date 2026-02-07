import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Decantd - AI Wine Tasting Planner',
    short_name: 'Decantd',
    description:
      'Plan the perfect wine tasting in seconds with AI-powered recommendations.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FDF8F0',
    theme_color: '#722F37',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
