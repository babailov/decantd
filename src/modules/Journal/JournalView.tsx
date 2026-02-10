'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BookOpen, ChevronRight, GlassWater, Star, Wine } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { Badge } from '@/common/components/Badge';
import { Card } from '@/common/components/Card';
import { queryKeys } from '@/common/constants/queryKeys';
import { cn } from '@/common/functions/cn';
import { useGuidedTastingsList } from '@/common/hooks/services/useGuidedTastings';
import { useAuthStore } from '@/common/stores/useAuthStore';
import type { SavedGuidedTasting } from '@/common/types/explore';

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

const WINE_TYPE_LABELS: Record<string, string> = {
  red: 'Red',
  white: 'White',
  rose: 'Rosé',
  sparkling: 'Sparkling',
};

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

function RatingCard({ entry }: { entry: JournalEntry }) {
  return (
    <Link href={`/tasting/${entry.planId}`}>
      <Card
        className="flex items-center gap-s p-s hover:bg-surface transition-colors cursor-pointer"
        variant="outlined"
      >
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
              <Badge variant={entry.wine.wineType as 'red' | 'white' | 'rose' | 'sparkling'}>
                {WINE_TYPE_LABELS[entry.wine.wineType] ?? entry.wine.wineType}
              </Badge>
            )}
          </div>
          {entry.tastingNotes && (
            <p className="text-body-s text-text-muted mt-xs line-clamp-2">
              {entry.tastingNotes}
            </p>
          )}
          <p className="text-body-xs text-text-muted mt-1">
            {entry.plan && <>{entry.plan.title} &middot; </>}
            {format(new Date(entry.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-text-muted flex-shrink-0" />
      </Card>
    </Link>
  );
}

function GuidedTastingCard({ tasting }: { tasting: SavedGuidedTasting }) {
  return (
    <Link href={`/explore/tasting-guide?id=${tasting.id}`}>
      <Card
        className="flex items-center gap-s p-s hover:bg-surface transition-colors cursor-pointer"
        variant="outlined"
      >
        <div className="flex-1 min-w-0">
          <p className="font-display text-body-l text-primary font-medium truncate">
            {tasting.wineName || 'Unnamed Wine'}
          </p>
          {tasting.varietal && (
            <p className="text-body-s text-text-secondary truncate">
              {tasting.varietal}
              {tasting.year ? ` · ${tasting.year}` : ''}
            </p>
          )}
          <div className="flex items-center gap-xs mt-1">
            {tasting.balance > 0 && <StarRating rating={tasting.balance} />}
            <Badge variant={tasting.wineType as 'red' | 'white' | 'rose' | 'sparkling'}>
              {WINE_TYPE_LABELS[tasting.wineType] ?? tasting.wineType}
            </Badge>
          </div>
          {tasting.notes && (
            <p className="text-body-s text-text-muted mt-xs line-clamp-2">
              {tasting.notes}
            </p>
          )}
          <p className="text-body-xs text-text-muted mt-1">
            {format(new Date(tasting.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-text-muted flex-shrink-0" />
      </Card>
    </Link>
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

  const isAuthed = !isLoading && isAuthenticated();

  const { data: ratingsData, isLoading: ratingsLoading } = useQuery({
    queryKey: queryKeys.user.ratings,
    queryFn: async (): Promise<{ ratings: JournalEntry[] }> => {
      const res = await fetch('/api/ratings/user');
      if (!res.ok) throw new Error('Failed to fetch ratings');
      return res.json();
    },
    enabled: isAuthed,
  });

  const { data: guidedData, isLoading: guidedLoading } = useGuidedTastingsList();

  const guidedTastings = useMemo(() => {
    const items = [...(guidedData?.tastings ?? [])];
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  }, [guidedData]);

  const ratings = useMemo(() => {
    const items = [...(ratingsData?.ratings ?? [])];
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  }, [ratingsData]);

  const isEmpty = guidedTastings.length === 0 && ratings.length === 0;

  if (isLoading || ratingsLoading || guidedLoading) {
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

  return (
    <div className="px-s py-m max-w-lg mx-auto">
      <div className="flex items-center gap-xs mb-m">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="font-display text-heading-m text-primary">
          Tasting Journal
        </h1>
      </div>

      {isEmpty ? (
        <Card className="text-center py-l">
          <Wine className="h-8 w-8 text-text-muted mx-auto mb-xs" />
          <p className="text-body-m text-text-secondary">No tastings yet</p>
          <p className="text-body-s text-text-muted mt-1">
            Rate wines in your plans or complete a guided tasting to build your journal.
          </p>
          <div className="flex flex-col items-center gap-xs mt-s">
            <Link href="/tasting/new">
              <span className="text-body-s text-accent font-medium">
                Create a tasting plan
              </span>
            </Link>
            <Link href="/explore/tasting-guide">
              <span className="text-body-s text-accent font-medium">
                Start a guided tasting
              </span>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-l">
          {/* Guided Tastings */}
          {guidedTastings.length > 0 && (
            <section>
              <div className="flex items-center gap-xs mb-s">
                <GlassWater className="h-5 w-5 text-primary" />
                <h2 className="font-display text-heading-s text-text-primary">
                  Guided Tastings
                </h2>
              </div>
              <div className="flex flex-col gap-s">
                {guidedTastings.map((tasting) => (
                  <GuidedTastingCard key={tasting.id} tasting={tasting} />
                ))}
              </div>
            </section>
          )}

          {/* Recommended Pairings / Flights */}
          {ratings.length > 0 && (
            <section>
              <div className="flex items-center gap-xs mb-s">
                <Wine className="h-5 w-5 text-primary" />
                <h2 className="font-display text-heading-s text-text-primary">
                  Recommended Pairings
                </h2>
              </div>
              <div className="flex flex-col gap-s">
                {ratings.map((entry) => (
                  <RatingCard key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
