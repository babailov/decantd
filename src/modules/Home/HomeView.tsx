'use client';

import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/common/components/Button';
import { copy } from '@/common/content';
import { useAuthStore } from '@/common/stores/useAuthStore';

import { PalateProfileCard } from '@/modules/PalateProfile';
import { UserPlansList } from '@/modules/Profile/UserPlansList';

function getTimeBasedGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeView() {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    setGreeting(getTimeBasedGreeting(new Date().getHours()));
  }, []);

  return (
    <div className="vineyard-bg px-s py-m max-w-lg mx-auto">
      {/* Greeting */}
      <h1 className="font-display text-heading-m text-primary mb-xs tracking-tight">
        {greeting}, {user?.displayName}
      </h1>
      <p className="text-body-s text-text-secondary mb-m">
        {copy.home.subtitle}
      </p>

      {/* Create new plan CTA */}
      <Link href="/tasting/new">
        <Button className="w-full gap-xs mb-l shadow-[0_16px_28px_-20px_rgba(123,45,58,0.4)]" size="lg">
          <Sparkles className="w-5 h-5" />
          {copy.home.createPlan}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </Link>

      {/* Palate Profile */}
      <div className="mb-l">
        <h2 className="font-display text-heading-xs text-primary mb-s">
          {copy.home.palateTitle}
        </h2>
        <PalateProfileCard />
      </div>

      {/* Recent Pairings */}
      <div className="mb-l">
        <div className="flex items-center justify-between mb-s">
          <h2 className="font-display text-heading-xs text-primary">
            {copy.home.recentPlansTitle}
          </h2>
          <Link
            className="text-body-s text-primary font-medium hover:text-primary-hover"
            href="/journal"
          >
            {copy.home.viewAll}
          </Link>
        </div>
        <UserPlansList limit={3} />
      </div>

      {/* Journal link */}
      <Link
        className="flex items-center gap-xs text-body-m text-primary font-medium hover:text-primary-hover"
        href="/journal"
      >
        <BookOpen className="w-5 h-5" />
        {copy.home.journalCta}
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
