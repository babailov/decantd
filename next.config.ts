import type { NextConfig } from 'next';

const isProdEnvironment = (process.env.DEPLOY_ENV || process.env.NEXT_PUBLIC_ENV) === 'production';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  output: 'standalone',

  compiler: {
    removeConsole: isProdEnvironment
      ? {
          exclude: ['error', 'warn'],
        }
      : false,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  env: {
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
    NEXT_PUBLIC_ENV: process.env.DEPLOY_ENV || process.env.NEXT_PUBLIC_ENV,
  },
};

export default nextConfig;
