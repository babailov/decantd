'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronRight, Info, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/common/components/Button';
import { Card } from '@/common/components/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/common/components/Dialog';
import { queryKeys } from '@/common/constants/queryKeys';
import { cn } from '@/common/functions/cn';
import { useAuthStore } from '@/common/stores/useAuthStore';

import { PalateProfileCard } from '@/modules/PalateProfile';
import { UserPlansList } from '@/modules/Profile/UserPlansList';

export function HomeView() {
  const { user } = useAuthStore();
  const [streakInfoOpen, setStreakInfoOpen] = useState(false);
  const { data: streak } = useQuery({
    queryKey: queryKeys.user.streak,
    queryFn: async (): Promise<{ currentStreak: number; actionsThisWeek: number }> => {
      const res = await fetch('/api/user/streak');
      if (!res.ok) throw new Error('Failed to fetch streak');
      return res.json();
    },
  });

  return (
    <div className="vineyard-bg px-s py-m max-w-lg mx-auto">
      {/* Greeting */}
      <h1 className="font-display text-heading-m text-primary mb-xs tracking-tight">
        Welcome back, {user?.displayName}
      </h1>
      <p className="text-body-s text-text-secondary mb-m">
        Your cellar club is ready. Pick a vibe and pour smarter tonight.
      </p>

      {/* Create new plan CTA */}
      <Link href="/tasting/new">
        <Button className="w-full gap-xs mb-l shadow-[0_16px_28px_-20px_rgba(185,72,104,0.6)]" size="lg">
          <Sparkles className="w-5 h-5" />
          Create New Tasting Plan
          <ChevronRight className="w-4 h-4" />
        </Button>
      </Link>

      {/* Palate Profile */}
      <div className="mb-l">
        <h2 className="font-display text-heading-xs text-primary mb-s">
          My Palate
        </h2>
        <PalateProfileCard />
      </div>

      {/* Gamified streak */}
      <div className="mb-l">
        <Card className="bg-gradient-to-r from-accent/18 via-primary/10 to-accent/10 border-primary/18 shadow-[0_14px_24px_-20px_rgba(76,79,105,0.65)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-body-xs text-text-muted">Consistency Streak</p>
                <button
                  className={cn(
                    'group relative inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors',
                    'focus:outline-none',
                  )}
                  type="button"
                  onClick={() => setStreakInfoOpen(true)}
                >
                  <Info className="h-3.5 w-3.5" />
                  <span className="sr-only">What counts toward consistency streak?</span>
                  <span
                    className={cn(
                      'hidden md:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-[calc(100%+0.35rem)]',
                      'w-64 rounded-md border border-border bg-surface-elevated p-xs text-left text-body-xs text-text-secondary shadow-lg',
                      'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity',
                    )}
                  >
                    Days count when you complete at least one meaningful action: generate a plan,
                    complete a guided tasting, create a journal entry, save a venue, or claim a deal.
                  </span>
                </button>
              </div>
              <p className="font-display text-heading-s text-primary">
                {streak?.currentStreak ?? 0} day{(streak?.currentStreak ?? 0) === 1 ? '' : 's'}
              </p>
              <p className="text-body-xs text-text-secondary mt-1">
                {streak?.actionsThisWeek ?? 0} qualifying actions this week
              </p>
            </div>
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </Card>
      </div>
      <Dialog open={streakInfoOpen} onOpenChange={setStreakInfoOpen}>
        <DialogContent>
          <DialogTitle>Consistency Streak</DialogTitle>
          <DialogDescription>
            Your streak increases when you complete at least one meaningful action in a day:
            generate a plan, complete a guided tasting, create a journal entry, save a venue, or claim a deal.
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {/* Recent Pairings */}
      <div className="mb-l">
        <div className="flex items-center justify-between mb-s">
          <h2 className="font-display text-heading-xs text-primary">
            Recent Pairings
          </h2>
          <Link
            className="text-body-s text-blue-600 font-medium hover:text-blue-700"
            href="/journal"
          >
            View all
          </Link>
        </div>
        <UserPlansList limit={3} />
      </div>

      {/* Journal link */}
      <Link
        className="flex items-center gap-xs text-body-m text-blue-600 font-medium hover:text-blue-700"
        href="/journal"
      >
        <BookOpen className="w-5 h-5" />
        View your tasting journal
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
