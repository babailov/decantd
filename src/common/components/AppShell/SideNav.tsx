'use client';

import {
  BookOpen,
  Compass,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/common/functions/cn';
import { useAuthStore } from '@/common/stores/useAuthStore';

export function SideNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const loggedIn = isAuthenticated();

  const navItems = [
    { href: '/', icon: Home, label: 'Home', enabled: true },
    { href: '/explore', icon: Compass, label: 'Explore', enabled: true },
    { href: '/journal', icon: BookOpen, label: 'Journal', enabled: loggedIn },
  ];

  return (
    <nav
      className={cn(
        'fixed top-[var(--header-height)] left-0 bottom-0 z-bottom-nav',
        'w-[var(--side-nav-width)]',
        'bg-background/90 backdrop-blur-md border-r border-border',
        'hidden md:flex flex-col items-center pt-m gap-xs',
      )}
    >
      {navItems.map((item) => {
        const isActive = item.href === '/'
          ? pathname === '/'
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        if (!item.enabled) {
          return (
            <button
              key={item.href}
              disabled
              className={cn(
                'flex flex-col items-center gap-0.5 py-xs px-xs w-full',
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
              'flex flex-col items-center gap-0.5 py-xs px-xs w-full',
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
