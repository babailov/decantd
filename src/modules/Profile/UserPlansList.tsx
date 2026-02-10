'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronRight, Wine } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/common/components/Badge';
import { Card } from '@/common/components/Card';
import { queryKeys } from '@/common/constants/queryKeys';
import { OCCASIONS } from '@/common/constants/wine.const';
import { cn } from '@/common/functions/cn';

interface PlanSummary {
  id: string;
  title: string;
  description: string;
  occasion: string;
  wineCount: number;
  createdAt: string;
}

export function UserPlansList() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.user.plans,
    queryFn: async (): Promise<{ plans: PlanSummary[] }> => {
      const res = await fetch('/api/user/plans');
      if (!res.ok) throw new Error('Failed to fetch plans');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-s">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-surface animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="text-center py-l">
        <p className="text-body-m text-text-muted">
          Unable to load your plans.
        </p>
      </Card>
    );
  }

  if (data.plans.length === 0) {
    return (
      <Card className="text-center py-l">
        <Wine className="h-8 w-8 text-text-muted mx-auto mb-xs" />
        <p className="text-body-m text-text-secondary">No plans yet</p>
        <p className="text-body-s text-text-muted mt-1">
          Create your first tasting plan to see it here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-s">
      {data.plans.map((plan) => {
        const occasion = OCCASIONS.find((o) => o.value === plan.occasion);
        return (
          <Link key={plan.id} href={`/tasting/${plan.id}`}>
            <Card
              className={cn(
                'flex items-center gap-s hover:bg-surface transition-colors cursor-pointer',
              )}
              variant="outlined"
            >
              <div className="flex-1 min-w-0">
                <p className="font-display text-body-l text-primary font-medium truncate">
                  {plan.title}
                </p>
                <div className="flex items-center gap-xs mt-1">
                  {occasion && (
                    <Badge variant="default">
                      {occasion.emoji} {occasion.label}
                    </Badge>
                  )}
                  <span className="text-body-xs text-text-muted">
                    {plan.wineCount} wines
                  </span>
                </div>
                <p className="text-body-xs text-text-muted mt-1">
                  {format(new Date(plan.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-text-muted flex-shrink-0" />
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
