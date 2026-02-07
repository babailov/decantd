import { Metadata, Viewport } from 'next';
import type { PropsWithChildren } from 'react';

import { Sonner } from '@/common/components/Toast';
import { playfairDisplay, sourceSans } from '@/common/fonts';
import { cn } from '@/common/functions/cn';
import { QueryProvider } from '@/common/providers/QueryProvider';

import '@/common/styles/main.css';

export const viewport: Viewport = {
  themeColor: '#722F37',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Decantd - AI Wine Tasting Planner',
  description:
    'Plan the perfect wine tasting in seconds. AI-powered tasting plans with food pairings, flavor profiles, and expert recommendations.',
  openGraph: {
    title: 'Decantd - AI Wine Tasting Planner',
    description:
      'Plan the perfect wine tasting in seconds. AI-powered tasting plans with food pairings, flavor profiles, and expert recommendations.',
  },
};

const GlobalLayout = ({ children }: PropsWithChildren) => {
  return (
    <html
      className={cn(playfairDisplay.variable, sourceSans.variable)}
      lang="en"
    >
      <body className="bg-background text-text-primary font-body">
        <QueryProvider>
          {children}
          <Sonner />
        </QueryProvider>
      </body>
    </html>
  );
};

export default GlobalLayout;
