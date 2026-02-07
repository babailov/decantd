'use client';

import { Wine } from 'lucide-react';

interface PairingRationaleProps {
  rationale: string;
}

export function PairingRationale({ rationale }: PairingRationaleProps) {
  return (
    <div className="flex items-start gap-xs">
      <Wine className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <p className="text-body-xs text-text-secondary italic">{rationale}</p>
    </div>
  );
}
