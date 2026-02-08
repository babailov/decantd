'use client';

import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  ExternalLink,
  MapPin,
  Phone,
  Search,
  UtensilsCrossed,
  Wine,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/common/components/Badge';
import { Card } from '@/common/components/Card';
import { Input } from '@/common/components/Input';
import { queryKeys } from '@/common/constants/queryKeys';
import { cn } from '@/common/functions/cn';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.corkage.all, 'Toronto'],
    queryFn: async (): Promise<{ restaurants: CorkageRestaurant[] }> => {
      const res = await fetch('/api/corkage?city=Toronto');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, neighborhood, or cuisine..."
            value={searchQuery}
          />
        </div>
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
            onClick={() => setSelectedCuisine(cuisine)}
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
            <Card key={restaurant.id} variant="outlined">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-display text-body-l text-primary font-semibold">
                  {restaurant.name}
                </h3>
                {restaurant.corkageFee !== null && (
                  <Badge variant="default">
                    <DollarSign className="h-3 w-3 inline" />
                    {restaurant.corkageFee === 0
                      ? 'Free!'
                      : `$${restaurant.corkageFee}`}
                  </Badge>
                )}
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

              <div className="flex items-center gap-s">
                {restaurant.phone && (
                  <a
                    className="flex items-center gap-1 text-body-xs text-primary hover:underline"
                    href={`tel:${restaurant.phone}`}
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
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Website
                  </a>
                )}
                {restaurant.isVerified && (
                  <span className="text-body-xs text-success">Verified</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-body-xs text-text-muted text-center mt-m">
        Know a corkage-friendly restaurant? We'd love to add it.
      </p>
    </div>
  );
}
