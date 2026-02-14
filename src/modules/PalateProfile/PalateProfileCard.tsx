'use client';

import { useQuery } from '@tanstack/react-query';
import { Share2, Wine } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/common/components/Badge';
import { Button } from '@/common/components/Button';
import { Card } from '@/common/components/Card';
import { FlavorRadar } from '@/common/components/FlavorRadar';
import { copy } from '@/common/content';
import { cn } from '@/common/functions/cn';
import { useAuthStore } from '@/common/stores/useAuthStore';

interface PalateProfile {
  flavorPreferences: {
    acidity: number;
    tannin: number;
    sweetness: number;
    alcohol: number;
    body: number;
  };
  topRegions: string[];
  topVarietals: string[];
  topWineTypes: string[];
  adventurousness: number;
  archetype: {
    label: string;
    description: string;
  };
}

interface PalateResponse {
  ready: boolean;
  ratingsCount: number;
  minRequired?: number;
  message?: string;
  profile?: PalateProfile;
}

export function PalateProfileCard() {
  const { user, isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['user', 'palate'],
    queryFn: async (): Promise<PalateResponse> => {
      const res = await fetch('/api/user/palate');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: isAuthenticated(),
  });

  if (!isAuthenticated() || isLoading) return null;

  if (!data?.ready || !data.profile) {
    return (
      <Card className="text-center py-l" variant="outlined">
        <Wine className="h-8 w-8 text-text-muted mx-auto mb-xs" />
        <p className="font-display text-body-l font-semibold text-primary mb-1">
          {copy.profile.profileTitle}
        </p>
        <p className="text-body-s text-text-secondary">
          {data?.message || copy.profile.profileUnlockFallback}
        </p>
        {data && (
          <div className="mt-s">
            <div className="w-full bg-surface rounded-full h-2">
              <div
                className="bg-accent rounded-full h-2 transition-all"
                style={{ width: `${((data.ratingsCount || 0) / 3) * 100}%` }}
              />
            </div>
            <p className="text-body-xs text-text-muted mt-1">
              {data.ratingsCount} / 3 wines rated
            </p>
          </div>
        )}
      </Card>
    );
  }

  const { profile } = data;

  const handleShare = async () => {
    const text = `${copy.profile.profileShareTitle}: ${profile.archetype.label}\n${profile.archetype.description}\n\n${copy.profile.topRegions}: ${profile.topRegions.join(', ')}\n${copy.profile.adventurousness}: ${profile.adventurousness}%\n\nDiscover your profile on Decantd.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: copy.profile.profileShareTitle, text });
        return;
      } catch {
        // Fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(text);
    toast.success(copy.toasts.palateCopied);
  };

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden',
        'bg-gradient-to-br from-primary/5 via-surface-elevated to-accent/5',
        'border border-border shadow-md',
      )}
    >
      {/* Card header with branding */}
      <div className="px-m pt-m pb-xs">
        <div className="flex items-center justify-between mb-xs">
          <div className="flex items-center gap-xs">
            <Wine className="h-5 w-5 text-primary" />
            <span className="font-display text-body-s text-primary font-bold">
              Decantd
            </span>
          </div>
          <Button size="sm" variant="ghost" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>

        {/* User name + archetype */}
        <h2 className="font-display text-heading-s text-primary">
          {user?.displayName}
        </h2>
        <div className="mt-1">
          <Badge variant="default">{profile.archetype.label}</Badge>
        </div>
        <p className="text-body-s text-text-secondary mt-xs">
          {profile.archetype.description}
        </p>
      </div>

      {/* Flavor radar */}
      <div className="px-m py-xs">
        <FlavorRadar
          data={profile.flavorPreferences}
          wineType={profile.topWineTypes[0] as 'red' | 'white' | 'rose' | 'sparkling' || 'red'}
        />
      </div>

      {/* Stats */}
      <div className="px-m pb-m">
        <div className="grid grid-cols-2 gap-xs">
          <div>
            <p className="text-body-xs text-text-muted font-medium">{copy.profile.topRegions}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {profile.topRegions.slice(0, 3).map((region) => (
                <span
                  key={region}
                  className="text-body-xs bg-surface px-2 py-0.5 rounded-full text-text-secondary"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-body-xs text-text-muted font-medium">{copy.profile.topVarietals}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {profile.topVarietals.slice(0, 3).map((varietal) => (
                <span
                  key={varietal}
                  className="text-body-xs bg-surface px-2 py-0.5 rounded-full text-text-secondary"
                >
                  {varietal}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Adventurousness meter */}
        <div className="mt-s">
          <div className="flex items-center justify-between mb-1">
            <span className="text-body-xs text-text-muted font-medium">{copy.profile.adventurousness}</span>
            <span className="text-body-xs text-accent font-bold">{profile.adventurousness}%</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className="bg-accent rounded-full h-2 transition-all"
              style={{ width: `${profile.adventurousness}%` }}
            />
          </div>
        </div>

        <p className="text-body-xs text-text-muted text-center mt-s">
          {copy.profile.basedOnRatingsPrefix} {data.ratingsCount} wines rated
        </p>
      </div>
    </div>
  );
}
