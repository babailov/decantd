'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bookmark,
  BookmarkCheck,
  DollarSign,
  ExternalLink,
  MapPin,
  Phone,
  Search,
  UtensilsCrossed,
  Wine,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { AuthDialog } from '@/common/components/AuthDialog';
import { Badge } from '@/common/components/Badge';
import { Card } from '@/common/components/Card';
import { queryKeys } from '@/common/constants/queryKeys';
import { cn } from '@/common/functions/cn';
import { trackEvent } from '@/common/services/analytics-api';
import { useAuthStore } from '@/common/stores/useAuthStore';

interface CorkageRestaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  neighborhood: string | null;
  cuisineType: string;
  corkageFee: number | null;
  corkageNotes: string | null;
  phone: string | null;
  website: string | null;
  isVerified: boolean;
  offerTitle: string | null;
  offerDescription: string | null;
  offerCode: string | null;
  offerExpiresAt: string | null;
}

const CUISINE_FILTERS = [
  'All',
  'Chinese',
  'French',
  'Italian',
  'Vietnamese',
  'Spanish',
  'Mediterranean',
  'Mexican',
  'Canadian',
];

export function CorkageDirectory() {
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [onlyWithDeals, setOnlyWithDeals] = useState(false);
  const [maxFee, setMaxFee] = useState<number | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const viewedDealIds = useRef(new Set<string>());

  const { data: savedData, refetch: refetchSaved } = useQuery({
    queryKey: queryKeys.corkage.saved,
    queryFn: async (): Promise<{ restaurantIds: string[] }> => {
      const res = await fetch('/api/corkage/save');
      if (!res.ok) return { restaurantIds: [] };
      return res.json();
    },
    enabled: isAuthenticated(),
  });

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.corkage.all, 'Toronto', onlyWithDeals, maxFee],
    queryFn: async (): Promise<{ restaurants: CorkageRestaurant[] }> => {
      const params = new URLSearchParams({ city: 'Toronto' });
      if (onlyWithDeals) params.set('hasOffer', '1');
      if (maxFee !== null) params.set('maxFee', String(maxFee));

      const res = await fetch(`/api/corkage?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const savedVenueIds = new Set(savedData?.restaurantIds ?? []);

  useEffect(() => {
    trackEvent('corkage_page_viewed', { city: 'Toronto' });
  }, []);

  useEffect(() => {
    for (const restaurant of data?.restaurants || []) {
      if (restaurant.offerTitle && !viewedDealIds.current.has(restaurant.id)) {
        viewedDealIds.current.add(restaurant.id);
        trackEvent('deal_viewed', {
          restaurantId: restaurant.id,
          neighborhood: restaurant.neighborhood,
        });
      }
    }
  }, [data]);

  const handleToggleSave = async (restaurantId: string, restaurantName: string) => {
    if (!isAuthenticated()) {
      trackEvent('upgrade_cta_clicked', { source: 'corkage_save_gate' });
      setAuthOpen(true);
      return;
    }

    const wasSaved = savedVenueIds.has(restaurantId);
    const res = await fetch('/api/corkage/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId }),
    });
    if (!res.ok) {
      toast.error('Could not update saved venues');
      return;
    }

    await refetchSaved();
    trackEvent('corkage_saved', {
      restaurantId,
      restaurantName,
      action: wasSaved ? 'unsave' : 'save',
    });
  };

  const restaurants = (data?.restaurants || []).filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.neighborhood?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisineType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCuisine =
      selectedCuisine === 'All' ||
      r.cuisineType.toLowerCase().includes(selectedCuisine.toLowerCase());

    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="max-w-lg mx-auto px-s py-m">
      {/* Header */}
      <div className="mb-m">
        <div className="flex items-center gap-xs mb-xs">
          <Wine className="h-6 w-6 text-primary" />
          <h1 className="font-display text-heading-m text-primary">
            Corkage Directory
          </h1>
        </div>
        <p className="text-body-m text-text-secondary">
          Find BYOB-friendly restaurants to enjoy your tasting wines. Toronto focus — more cities coming soon.
        </p>
      </div>

      {/* Search */}
      <div className="mb-s">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            className={cn(
              'w-full rounded-xl border border-border bg-surface-elevated pl-9 pr-s py-xs text-body-m text-text-primary',
              'placeholder:text-text-muted focus:border-primary focus:outline-none',
            )}
            placeholder="Search by name, neighborhood, or cuisine..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              trackEvent('corkage_search_used', { queryLength: e.target.value.length });
            }}
          />
        </div>
      </div>

      {/* Quick intent filters */}
      <div className="flex flex-wrap gap-1.5 mb-s">
        <button
          className={cn(
            'text-body-xs px-s py-1 rounded-full border transition-colors',
            onlyWithDeals
              ? 'bg-primary text-text-on-primary border-primary'
              : 'bg-surface-elevated text-text-secondary border-border hover:border-primary',
          )}
          onClick={() => {
            const next = !onlyWithDeals;
            setOnlyWithDeals(next);
            trackEvent('corkage_filter_used', { filter: 'hasDeal', value: next });
          }}
        >
          Deals only
        </button>
        {[20, 30].map((fee) => (
          <button
            key={fee}
            className={cn(
              'text-body-xs px-s py-1 rounded-full border transition-colors',
              maxFee === fee
                ? 'bg-primary text-text-on-primary border-primary'
                : 'bg-surface-elevated text-text-secondary border-border hover:border-primary',
            )}
            onClick={() => {
              const next = maxFee === fee ? null : fee;
              setMaxFee(next);
              trackEvent('corkage_filter_used', { filter: 'maxFee', value: next });
            }}
          >
            {maxFee === fee ? `Fee ≤ $${fee}` : `Under $${fee} fee`}
          </button>
        ))}
      </div>

      {/* Cuisine filter chips */}
      <div className="flex flex-wrap gap-1.5 mb-m">
        {CUISINE_FILTERS.map((cuisine) => (
          <button
            key={cuisine}
            className={cn(
              'text-body-xs px-s py-1 rounded-full border transition-colors',
              selectedCuisine === cuisine
                ? 'bg-primary text-text-on-primary border-primary'
                : 'bg-surface-elevated text-text-secondary border-border hover:border-primary',
            )}
            onClick={() => {
              setSelectedCuisine(cuisine);
              trackEvent('corkage_filter_used', { filter: 'cuisine', value: cuisine });
            }}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-xs">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : (data?.restaurants?.length ?? 0) === 0 ? (
        <Card className="text-center py-l">
          <UtensilsCrossed className="h-8 w-8 text-text-muted mx-auto mb-xs" />
          <p className="text-body-m text-text-secondary">Listings coming soon</p>
          <p className="text-body-s text-text-muted mt-1">
            We&apos;re onboarding corkage-friendly businesses now. Check back soon.
          </p>
        </Card>
      ) : restaurants.length === 0 ? (
        <Card className="text-center py-l">
          <UtensilsCrossed className="h-8 w-8 text-text-muted mx-auto mb-xs" />
          <p className="text-body-m text-text-secondary">No restaurants found</p>
          <p className="text-body-s text-text-muted mt-1">
            Try adjusting your search or filters.
          </p>
        </Card>
      ) : (
        <div className="space-y-xs">
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              variant="outlined"
              onClick={() => trackEvent('corkage_card_opened', {
                restaurantId: restaurant.id,
                neighborhood: restaurant.neighborhood,
              })}
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-display text-body-l text-primary font-semibold">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-1.5">
                  {restaurant.corkageFee !== null && (
                    <Badge variant="default">
                      <DollarSign className="h-3 w-3 inline" />
                      {restaurant.corkageFee === 0
                        ? 'Free!'
                        : `$${restaurant.corkageFee}`}
                    </Badge>
                  )}
                  <button
                    className="text-primary hover:text-primary/80 transition-colors"
                    onClick={() => handleToggleSave(restaurant.id, restaurant.name)}
                  >
                    {savedVenueIds.has(restaurant.id) ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 text-body-xs text-text-secondary mb-1">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                <span>{restaurant.cuisineType}</span>
                {restaurant.neighborhood && (
                  <>
                    <span className="text-text-muted">·</span>
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{restaurant.neighborhood}</span>
                  </>
                )}
              </div>

              <p className="text-body-xs text-text-muted mb-xs">
                {restaurant.address}
              </p>

              {restaurant.corkageNotes && (
                <p className="text-body-xs text-text-secondary italic mb-xs">
                  {restaurant.corkageNotes}
                </p>
              )}

              {restaurant.offerTitle && (
                <div className="mb-xs p-xs rounded-lg border border-accent/30 bg-accent/10">
                  <p className="text-body-xs font-medium text-accent">{restaurant.offerTitle}</p>
                  {restaurant.offerDescription && (
                    <p className="text-body-xs text-text-secondary mt-0.5">{restaurant.offerDescription}</p>
                  )}
                  {restaurant.offerCode && (
                    <button
                      className="text-body-xs text-accent font-medium mt-1 hover:underline"
                      onClick={() => {
                        trackEvent('deal_claim_started', {
                          restaurantId: restaurant.id,
                          neighborhood: restaurant.neighborhood,
                        });
                        navigator.clipboard.writeText(restaurant.offerCode || '');
                        toast.success(`Code copied: ${restaurant.offerCode}`);
                        trackEvent('deal_claim_completed', {
                          restaurantId: restaurant.id,
                          neighborhood: restaurant.neighborhood,
                        });
                      }}
                    >
                      Copy code: {restaurant.offerCode}
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-s">
                {restaurant.phone && (
                  <a
                    className="flex items-center gap-1 text-body-xs text-primary hover:underline"
                    href={`tel:${restaurant.phone}`}
                    onClick={() => trackEvent('corkage_call_clicked', {
                      restaurantId: restaurant.id,
                      neighborhood: restaurant.neighborhood,
                    })}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>
                )}
                {restaurant.website && (
                  <a
                    className="flex items-center gap-1 text-body-xs text-primary hover:underline"
                    href={restaurant.website}
                    rel="noopener noreferrer"
                    target="_blank"
                    onClick={() => trackEvent('corkage_website_clicked', {
                      restaurantId: restaurant.id,
                      neighborhood: restaurant.neighborhood,
                    })}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Website
                  </a>
                )}
                <a
                  className="flex items-center gap-1 text-body-xs text-primary hover:underline"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
                  rel="noopener noreferrer"
                  target="_blank"
                  onClick={() => trackEvent('corkage_direction_clicked', {
                    restaurantId: restaurant.id,
                    neighborhood: restaurant.neighborhood,
                  })}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Directions
                </a>
                {restaurant.isVerified && (
                  <span className="text-body-xs text-success">Verified</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-body-xs text-text-muted text-center mt-m">
        Know a corkage-friendly restaurant? We&apos;d love to add it.
      </p>
      <AuthDialog defaultMode="signup" open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
