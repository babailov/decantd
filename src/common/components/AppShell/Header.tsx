'use client';

import { LogIn, Wine } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { AuthDialog } from '@/common/components/AuthDialog';
import { ProfileDrawer } from '@/common/components/ProfileDrawer';
import { cn } from '@/common/functions/cn';
import { useAuthStore } from '@/common/stores/useAuthStore';

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
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
            Decantd
          </span>
        </Link>

        {isAuthenticated() && user ? (
          <button
            className={cn(
              'w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center',
              'text-primary font-display text-body-s font-bold',
              'hover:bg-primary/20 transition-colors',
            )}
            onClick={() => setProfileOpen(true)}
          >
            {user.displayName.charAt(0).toUpperCase()}
          </button>
        ) : (
          <button
            className="flex items-center gap-1.5 text-text-secondary hover:text-primary transition-colors"
            onClick={() => setAuthOpen(true)}
          >
            <LogIn className="h-5 w-5" />
            <span className="text-body-s font-medium">Sign In</span>
          </button>
        )}
      </header>

      <ProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />

      <AuthDialog
        defaultMode="login"
        open={authOpen}
        onOpenChange={setAuthOpen}
      />
    </>
  );
}
