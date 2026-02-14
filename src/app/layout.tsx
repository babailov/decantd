import { Metadata, Viewport } from 'next';
import type { PropsWithChildren } from 'react';

import { Sonner } from '@/common/components/Toast';
import { TastingGenerationToastController } from '@/common/components/Toast/TastingGenerationToastController';
import { copy } from '@/common/content';
import { playfairDisplay, sourceSans } from '@/common/fonts';
import { cn } from '@/common/functions/cn';
import { AuthProvider } from '@/common/providers/AuthProvider';
import { QueryProvider } from '@/common/providers/QueryProvider';

import '@/common/styles/main.css';

export const viewport: Viewport = {
  themeColor: '#7B2D3A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://decantd.app'),
  title: {
    default: copy.metadata.titleDefault,
    template: copy.metadata.titleTemplate,
  },
  description: copy.metadata.description,
  openGraph: {
    type: 'website',
    siteName: 'Decantd',
    title: copy.metadata.titleDefault,
    description: copy.metadata.description,
  },
  twitter: {
    card: 'summary_large_image',
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
          <AuthProvider>
            {children}
          </AuthProvider>
          <TastingGenerationToastController />
          <Sonner />
        </QueryProvider>
      </body>
    </html>
  );
};

export default GlobalLayout;
