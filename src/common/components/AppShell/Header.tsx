'use client';

import { Wine } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/common/functions/cn';

export function Header() {
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-header h-[var(--header-height)]',
        'bg-background/80 backdrop-blur-md border-b border-border',
        'flex items-center justify-between px-s',
      )}
    >
      <Link className="flex items-center gap-xs" href="/">
        <Wine className="h-6 w-6 text-primary" />
        <span className="font-display text-heading-xs text-primary font-bold">
          Vino
        </span>
      </Link>
    </header>
  );
}
