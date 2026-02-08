'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BookOpen, ChevronRight, Star, Wine } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Badge } from '@/common/components/Badge';
import { Card } from '@/common/components/Card';
import { queryKeys } from '@/common/constants/queryKeys';
import { cn } from '@/common/functions/cn';
import { useAuthStore } from '@/common/stores/useAuthStore';

interface JournalEntry {
  id: string;
  rating: number;
  tastingNotes: string | null;
  tried: boolean;
  createdAt: string;
  planId: string;
  wine: {
    id: string;
    varietal: string;
    region: string;
    wineType: string;
    description: string;
  } | null;
  plan: {
    id: string;
    title: string;
  } | null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating ? 'fill-accent text-accent' : 'text-text-muted',
          )}
        />
      ))}
    </div>
  );
}

export function JournalView() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const { data, isLoading: ratingsLoading } = useQuery({
    queryKey: queryKeys.user.ratings,
    queryFn: async (): Promise<{ ratings: JournalEntry[] }> => {
      const res = await fetch('/api/ratings/user');
      if (!res.ok) throw new Error('Failed to fetch ratings');
      return res.json();
    },
    enabled: !isLoading && isAuthenticated(),
  });

  if (isLoading || ratingsLoading) {
    return (
      <div className="px-s py-m max-w-lg mx-auto">
        <h1 className="font-display text-heading-m text-primary mb-m">
          Tasting Journal
        </h1>
        <div className="space-y-xs">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-surface animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const ratings = data?.ratings ?? [];

  return (
    <div className="px-s py-m max-w-lg mx-auto">
      <div className="flex items-center gap-xs mb-m">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="font-display text-heading-m text-primary">
          Tasting Journal
        </h1>
      </div>

      {ratings.length === 0 ? (
        <Card className="text-center py-l">
          <Wine className="h-8 w-8 text-text-muted mx-auto mb-xs" />
          <p className="text-body-m text-text-secondary">No tastings yet</p>
          <p className="text-body-s text-text-muted mt-1">
            Rate wines in your plans to build your journal.
          </p>
          <Link className="inline-block mt-s" href="/tasting/new">
            <span className="text-body-s text-accent font-medium">
              Create a tasting plan
            </span>
          </Link>
        </Card>
      ) : (
        <div className="space-y-xs">
          {ratings.map((entry) => (
            <Link key={entry.id} href={`/tasting/${entry.planId}`}>
              <Card
                className="hover:bg-surface transition-colors cursor-pointer"
                variant="outlined"
              >
                <div className="flex items-start gap-s">
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-body-l text-primary font-medium truncate">
                      {entry.wine?.varietal ?? 'Unknown wine'}
                    </p>
                    {entry.wine && (
                      <p className="text-body-s text-text-secondary truncate">
                        {entry.wine.region}
                      </p>
                    )}
                    <div className="flex items-center gap-xs mt-1">
                      <StarRating rating={entry.rating} />
                      {entry.wine && (
                        <Badge variant="default">{entry.wine.wineType}</Badge>
                      )}
                    </div>
                    {entry.tastingNotes && (
                      <p className="text-body-s text-text-muted mt-xs line-clamp-2">
                        {entry.tastingNotes}
                      </p>
                    )}
                    <div className="flex items-center gap-xs mt-xs text-body-xs text-text-muted">
                      {entry.plan && (
                        <span className="truncate">{entry.plan.title}</span>
                      )}
                      <span>&middot;</span>
                      <span className="shrink-0">
                        {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-muted flex-shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
