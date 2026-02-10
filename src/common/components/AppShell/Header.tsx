'use client';

import { LogIn, LogOut, Wine } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { AuthDialog } from '@/common/components/AuthDialog';
import { cn } from '@/common/functions/cn';
import { logout } from '@/common/services/auth-api';
import { useAuthStore } from '@/common/stores/useAuthStore';

export function Header() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [authOpen, setAuthOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    clearAuth();
  };

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

        {isAuthenticated() ? (
          <button
            className="flex items-center gap-1.5 text-text-secondary hover:text-primary transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-body-xs font-medium hidden sm:inline">
              Sign Out
            </span>
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

      <AuthDialog
        defaultMode="login"
        open={authOpen}
        onOpenChange={setAuthOpen}
      />
    </>
  );
}
