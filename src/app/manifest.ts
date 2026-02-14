import type { MetadataRoute } from 'next';

import { copy } from '@/common/content';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: copy.metadata.manifestName,
    short_name: 'Decantd',
    description: copy.metadata.manifestDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#7B2D3A',
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
