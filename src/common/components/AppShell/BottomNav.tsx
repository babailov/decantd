'use client';

import {
  BookOpen,
  Compass,
  Home,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/common/functions/cn';
import { useAuthStore } from '@/common/stores/useAuthStore';

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const loggedIn = isAuthenticated();

  const navItems = [
    { href: '/', icon: Home, label: 'Home', enabled: true },
    { href: '/explore', icon: Compass, label: 'Explore', enabled: true },
    { href: '/tasting/new', icon: Plus, label: 'New', enabled: true, primary: true },
    { href: '/journal', icon: BookOpen, label: 'Journal', enabled: loggedIn },
  ];

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-bottom-nav',
        'bg-background/90 backdrop-blur-md border-t border-border',
        'h-[var(--bottom-nav-height)]',
        'flex items-center justify-around px-xs',
        'pb-[env(safe-area-inset-bottom)]',
      )}
    >
      {navItems.map((item) => {
        const isActive = item.href === '/'
          ? pathname === '/'
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        if (item.primary) {
          return (
            <Link
              key={item.href}
              className={cn(
                'flex items-center justify-center',
                'w-12 h-12 rounded-full',
                'bg-primary text-text-on-primary shadow-lg',
                'active:scale-95 transition-transform',
              )}
              href={item.href}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        }

        if (!item.enabled) {
          return (
            <button
              key={item.href}
              disabled
              className={cn(
                'flex flex-col items-center gap-0.5 py-xs px-xs',
                'text-text-muted opacity-50',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-body-xs">{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 py-xs px-xs',
              isActive ? 'text-primary' : 'text-text-secondary',
            )}
            href={item.href}
          >
            <Icon className="h-5 w-5" />
            <span className="text-body-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
