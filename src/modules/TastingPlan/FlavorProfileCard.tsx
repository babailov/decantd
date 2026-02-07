'use client';

import { Card } from '@/common/components/Card';
import { FlavorRadar } from '@/common/components/FlavorRadar';
import { FlavorProfile, WineType } from '@/common/types/wine';

interface FlavorProfileCardProps {
  profile: FlavorProfile;
  wineType: WineType;
  flavorNotes: string[];
}

export function FlavorProfileCard({
  profile,
  wineType,
  flavorNotes,
}: FlavorProfileCardProps) {
  return (
    <Card className="p-s" variant="default">
      <FlavorRadar data={profile} wineType={wineType} />
      <div className="flex flex-wrap gap-1.5 mt-xs">
        {flavorNotes.map((note) => (
          <span
            key={note}
            className="text-body-xs bg-background px-2 py-0.5 rounded-full text-text-secondary"
          >
            {note}
          </span>
        ))}
      </div>
    </Card>
  );
}
