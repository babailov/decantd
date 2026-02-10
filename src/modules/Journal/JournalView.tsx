'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BookOpen, ChevronRight, FileText, GlassWater, Star, Wine } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { Badge } from '@/common/components/Badge';
import { Card } from '@/common/components/Card';
import { CollapsibleSection } from '@/common/components/CollapsibleSection';
import { ShowMoreList } from '@/common/components/ShowMoreList';
import { queryKeys } from '@/common/constants/queryKeys';
import { OCCASIONS } from '@/common/constants/wine.const';
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

interface PlanSummary {
  id: string;
  title: string;
  description: string;
  occasion: string;
  wineCount: number;
  createdAt: string;
}

const WINE_TYPE_LABELS: Record<string, string> = {
  red: 'Red',
  white: 'White',
  rose: 'Rosé',
  sparkling: 'Sparkling',
};

function getTastingTitle(tasting: SavedGuidedTasting): string {
  if (tasting.wineName) {
    return tasting.year ? `${tasting.wineName} ${tasting.year}` : tasting.wineName;
  }

  const typeLabel = WINE_TYPE_LABELS[tasting.wineType] ?? 'Wine';

  if (tasting.sweetness >= 4) return `Sweet ${typeLabel} Wine`;
  if (tasting.acidity >= 4) return `Crisp ${typeLabel} Wine`;
  if (tasting.tannin >= 4) return `Bold ${typeLabel} Wine`;
  if (tasting.body >= 4) return `Full-Bodied ${typeLabel} Wine`;
  if (tasting.body <= 1) return `Light ${typeLabel} Wine`;
  if (tasting.selectedAromas.length > 0) return `Aromatic ${typeLabel} Wine`;

  return `Unnamed ${typeLabel} Wine`;
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
            {getTastingTitle(tasting)}
          </p>
          {tasting.varietal && (
            <p className="text-body-s text-text-secondary truncate">
              {tasting.varietal}
              {tasting.year && !tasting.wineName ? ` · ${tasting.year}` : ''}
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

function TastingNoteCard({ tasting }: { tasting: SavedGuidedTasting }) {
  return (
    <Link href={`/explore/tasting-guide?id=${tasting.id}`}>
      <Card
        className="flex items-center gap-s p-s hover:bg-surface transition-colors cursor-pointer"
        variant="outlined"
      >
        <div className="flex-1 min-w-0">
          <p className="font-display text-body-l text-primary font-medium truncate">
            {getTastingTitle(tasting)}
          </p>
          <p className="text-body-s text-text-muted mt-xs line-clamp-2">
            {tasting.notes}
          </p>
          <p className="text-body-xs text-text-muted mt-1">
            {format(new Date(tasting.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-text-muted flex-shrink-0" />
      </Card>
    </Link>
  );
}

function PlanCard({ plan }: { plan: PlanSummary }) {
  const occasion = OCCASIONS.find((o) => o.value === plan.occasion);
  return (
    <Link href={`/tasting/${plan.id}`}>
      <Card
        className="flex items-center gap-s p-s hover:bg-surface transition-colors cursor-pointer"
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

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: queryKeys.user.plans,
    queryFn: async (): Promise<{ plans: PlanSummary[] }> => {
      const res = await fetch('/api/user/plans');
      if (!res.ok) throw new Error('Failed to fetch plans');
      return res.json();
    },
    enabled: isAuthed,
  });

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

  const tastingsWithNotes = useMemo(() => {
    return guidedTastings.filter((t) => t.notes.trim().length > 0);
  }, [guidedTastings]);

  const plans = plansData?.plans ?? [];

  const defaultOpenSection = guidedTastings.length > 0 ? 'guided'
    : ratings.length > 0 ? 'ratings'
    : tastingsWithNotes.length > 0 ? 'notes'
    : 'plans';

  if (isLoading || ratingsLoading || guidedLoading || plansLoading) {
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

      <div className="space-y-xs">
        {/* Guided Tastings */}
        <CollapsibleSection
          count={guidedTastings.length}
          defaultOpen={defaultOpenSection === 'guided'}
          emptyMessage={
            <>
              No tasting notes yet.{' '}
              <Link className="text-accent font-medium" href="/explore/tasting-guide">
                Start a guided tasting
              </Link>
            </>
          }
          icon={GlassWater}
          title="Guided Tastings"
        >
          <ShowMoreList
            items={guidedTastings}
            keyExtractor={(t) => t.id}
            renderItem={(tasting) => <GuidedTastingCard tasting={tasting} />}
          />
        </CollapsibleSection>

        {/* Recommended Pairings — hidden when empty */}
        {ratings.length > 0 && (
          <CollapsibleSection
            count={ratings.length}
            defaultOpen={defaultOpenSection === 'ratings'}
            icon={Wine}
            title="Recommended Pairings"
          >
            <ShowMoreList
              items={ratings}
              keyExtractor={(e) => e.id}
              renderItem={(entry) => <RatingCard entry={entry} />}
            />
          </CollapsibleSection>
        )}

        {/* My Tasting Notes — hidden when empty */}
        {tastingsWithNotes.length > 0 && (
          <CollapsibleSection
            count={tastingsWithNotes.length}
            defaultOpen={defaultOpenSection === 'notes'}
            icon={FileText}
            title="My Tasting Notes"
          >
            <ShowMoreList
              items={tastingsWithNotes}
              keyExtractor={(t) => t.id}
              renderItem={(tasting) => <TastingNoteCard tasting={tasting} />}
            />
          </CollapsibleSection>
        )}

        {/* My Pairings */}
        <CollapsibleSection
          count={plans.length}
          defaultOpen={defaultOpenSection === 'plans'}
          emptyMessage="Create your first tasting plan to see it here."
          icon={BookOpen}
          title="My Pairings"
        >
          <ShowMoreList
            items={plans}
            keyExtractor={(p) => p.id}
            renderItem={(plan) => <PlanCard plan={plan} />}
          />
        </CollapsibleSection>
      </div>
    </div>
  );
}
