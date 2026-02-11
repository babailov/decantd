'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/common/components/Button';
import { Card } from '@/common/components/Card';
import { queryKeys } from '@/common/constants/queryKeys';
import { useAuthStore } from '@/common/stores/useAuthStore';

import { PalateProfileCard } from '@/modules/PalateProfile';
import { UserPlansList } from '@/modules/Profile/UserPlansList';

export function HomeView() {
  const { user } = useAuthStore();
  const { data: streak } = useQuery({
    queryKey: queryKeys.user.streak,
    queryFn: async (): Promise<{ currentStreak: number; actionsThisWeek: number }> => {
      const res = await fetch('/api/user/streak');
      if (!res.ok) throw new Error('Failed to fetch streak');
      return res.json();
    },
  });

  return (
    <div className="px-s py-m max-w-lg mx-auto">
      {/* Greeting */}
      <h1 className="font-display text-heading-m text-primary mb-m">
        Welcome back, {user?.displayName}
      </h1>

      {/* Create new plan CTA */}
      <Link href="/tasting/new">
        <Button className="w-full gap-xs mb-l" size="lg">
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
        <Card className="bg-gradient-to-r from-accent/10 via-primary/5 to-accent/5 border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-xs text-text-muted">Consistency Streak</p>
              <p className="font-display text-heading-s text-primary">
                {streak?.currentStreak ?? 0} day{(streak?.currentStreak ?? 0) === 1 ? '' : 's'}
              </p>
              <p className="text-body-xs text-text-secondary mt-1">
                {streak?.actionsThisWeek ?? 0} qualifying actions this week
              </p>
            </div>
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
        </Card>
      </div>

      {/* Recent Pairings */}
      <div className="mb-l">
        <div className="flex items-center justify-between mb-s">
          <h2 className="font-display text-heading-xs text-primary">
            Recent Pairings
          </h2>
          <Link
            className="text-body-s text-accent font-medium"
            href="/journal"
          >
            View all
          </Link>
        </div>
        <UserPlansList limit={3} />
      </div>

      {/* Journal link */}
      <Link
        className="flex items-center gap-xs text-body-m text-accent font-medium"
        href="/journal"
      >
        <BookOpen className="w-5 h-5" />
        View your tasting journal
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
