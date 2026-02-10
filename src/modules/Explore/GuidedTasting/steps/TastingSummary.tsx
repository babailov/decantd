'use client';

import {
  Brain,
  Check,
  Eye,
  Pencil,
  Star,
  ThumbsDown,
  ThumbsUp,
  Wind,
  Wine,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { AuthDialog } from '@/common/components/AuthDialog';
import { Badge } from '@/common/components/Badge';
import { Button } from '@/common/components/Button';
import { FlavorRadar } from '@/common/components/FlavorRadar';
import { findAromaById } from '@/common/constants/aroma-wheel.const';
import {
  CLARITY_OPTIONS,
  COLOR_DEPTH_OPTIONS,
  FINISH_LENGTH_OPTIONS,
} from '@/common/constants/tasting-guide.const';
import { cn } from '@/common/functions/cn';
import {
  useUpdateGuidedTasting,
} from '@/common/hooks/services/useGuidedTastings';
import { useAuthStore } from '@/common/stores/useAuthStore';
import { useGuidedTastingStore } from '@/common/stores/useGuidedTastingStore';
import type { WineTypeContext } from '@/common/types/explore';

function SectionHeader({
  icon: Icon,
  label,
  onEdit,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onEdit: () => void;
}) {
  return (
    <button
      className="flex items-center justify-between w-full mb-xs group"
      onClick={onEdit}
    >
      <div className="flex items-center gap-xs">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-body-s font-medium text-text-primary">{label}</h3>
      </div>
      <Pencil className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
    </button>
  );
}

export function TastingSummary() {
  const setCurrentStep = useGuidedTastingStore((s) => s.setCurrentStep);
  const resetSession = useGuidedTastingStore((s) => s.resetSession);
  const savedTastingId = useGuidedTastingStore((s) => s.savedTastingId);

  // Wine identity
  const wineName = useGuidedTastingStore((s) => s.wineName);
  const varietal = useGuidedTastingStore((s) => s.varietal);
  const year = useGuidedTastingStore((s) => s.year);

  // Look
  const wineType = useGuidedTastingStore((s) => s.wineType);
  const colorDepth = useGuidedTastingStore((s) => s.colorDepth);
  const clarity = useGuidedTastingStore((s) => s.clarity);
  const viscosityNoted = useGuidedTastingStore((s) => s.viscosityNoted);

  // Smell
  const selectedAromas = useGuidedTastingStore((s) => s.selectedAromas);

  // Taste
  const acidity = useGuidedTastingStore((s) => s.acidity);
  const tannin = useGuidedTastingStore((s) => s.tannin);
  const sweetness = useGuidedTastingStore((s) => s.sweetness);
  const alcohol = useGuidedTastingStore((s) => s.alcohol);
  const body = useGuidedTastingStore((s) => s.body);

  // Think
  const balance = useGuidedTastingStore((s) => s.balance);
  const complexity = useGuidedTastingStore((s) => s.complexity);
  const finishLength = useGuidedTastingStore((s) => s.finishLength);
  const wouldDrinkAgain = useGuidedTastingStore((s) => s.wouldDrinkAgain);
  const notes = useGuidedTastingStore((s) => s.notes);

  const { isAuthenticated } = useAuthStore();
  const updateMutation = useUpdateGuidedTasting();
  const [authOpen, setAuthOpen] = useState(false);

  const colorDepthLabel = wineType && colorDepth
    ? COLOR_DEPTH_OPTIONS[wineType]?.find((o) => o.value === colorDepth)?.label
    : null;

  const clarityLabel = clarity
    ? CLARITY_OPTIONS.find((o) => o.value === clarity)?.label
    : null;

  const finishLabel = finishLength
    ? FINISH_LENGTH_OPTIONS.find((o) => o.value === finishLength)?.label
    : null;

  const handleUpdate = async () => {
    if (!isAuthenticated()) {
      setAuthOpen(true);
      return;
    }
    if (!savedTastingId) return;

    try {
      await updateMutation.mutateAsync({
        id: savedTastingId,
        data: {
          wineName: wineName || undefined,
          varietal: varietal || undefined,
          year: year ? parseInt(year, 10) : undefined,
          wineType: wineType as WineTypeContext,
          colorDepth,
          clarity,
          viscosityNoted,
          selectedAromas,
          acidity,
          tannin,
          sweetness,
          alcohol,
          body,
          balance,
          complexity,
          finishLength,
          wouldDrinkAgain,
          notes,
          isComplete: true,
        },
      });
      toast.success('Tasting updated!');
    } catch {
      toast.error('Failed to update tasting');
    }
  };

  const handleNewTasting = () => {
    resetSession();
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Wine identity header */}
      <div className="text-center mb-m">
        <h2 className="font-display text-heading-m text-primary">
          {wineName || 'Unnamed Wine'}
        </h2>
        {(varietal || year) && (
          <p className="text-body-s text-text-secondary mt-2xs">
            {[varietal, year].filter(Boolean).join(' \u00B7 ')}
          </p>
        )}
      </div>

      {/* Look section */}
      <div className="p-m rounded-xl border border-border bg-surface-elevated mb-s">
        <SectionHeader
          icon={Eye}
          label="Look"
          onEdit={() => setCurrentStep('look')}
        />
        <div className="flex flex-wrap gap-1.5">
          {wineType && (
            <Badge variant={wineType}>
              {wineType.charAt(0).toUpperCase() + wineType.slice(1)}
            </Badge>
          )}
          {colorDepthLabel && (
            <Badge>{colorDepthLabel} depth</Badge>
          )}
          {clarityLabel && (
            <Badge>{clarityLabel}</Badge>
          )}
          {viscosityNoted && (
            <Badge>Legs noted</Badge>
          )}
        </div>
      </div>

      {/* Smell section */}
      <div className="p-m rounded-xl border border-border bg-surface-elevated mb-s">
        <SectionHeader
          icon={Wind}
          label="Smell"
          onEdit={() => setCurrentStep('smell')}
        />
        {selectedAromas.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {selectedAromas.map((id) => {
              const aroma = findAromaById(id);
              return (
                <span
                  key={id}
                  className="text-body-xs px-xs py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  {aroma?.label ?? id}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-body-xs text-text-muted">No aromas recorded</p>
        )}
      </div>

      {/* Taste section */}
      <div className="p-m rounded-xl border border-border bg-surface-elevated mb-s">
        <SectionHeader
          icon={Wine}
          label="Taste"
          onEdit={() => setCurrentStep('taste')}
        />
        <FlavorRadar
          className="h-48"
          data={{ acidity, tannin, sweetness, alcohol, body }}
          wineType={wineType ?? 'red'}
        />
      </div>

      {/* Think section */}
      <div className="p-m rounded-xl border border-border bg-surface-elevated mb-s">
        <SectionHeader
          icon={Brain}
          label="Think"
          onEdit={() => setCurrentStep('think')}
        />
        <div className="flex flex-col gap-xs">
          {/* Balance */}
          <div className="flex items-center justify-between">
            <span className="text-body-xs text-text-secondary">Balance</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((v) => (
                <Star
                  key={v}
                  className={cn(
                    'w-4 h-4',
                    v <= balance ? 'text-primary fill-primary' : 'text-border',
                  )}
                />
              ))}
            </div>
          </div>

          {/* Complexity */}
          <div className="flex items-center justify-between">
            <span className="text-body-xs text-text-secondary">Complexity</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((v) => (
                <Star
                  key={v}
                  className={cn(
                    'w-4 h-4',
                    v <= complexity ? 'text-accent fill-accent' : 'text-border',
                  )}
                />
              ))}
            </div>
          </div>

          {/* Finish */}
          {finishLabel && (
            <div className="flex items-center justify-between">
              <span className="text-body-xs text-text-secondary">Finish</span>
              <span className="text-body-xs font-medium text-text-primary">{finishLabel}</span>
            </div>
          )}

          {/* Would drink again */}
          {wouldDrinkAgain !== null && (
            <div className="flex items-center justify-between">
              <span className="text-body-xs text-text-secondary">Drink again?</span>
              <div className="flex items-center gap-1">
                {wouldDrinkAgain ? (
                  <ThumbsUp className="w-4 h-4 text-primary" />
                ) : (
                  <ThumbsDown className="w-4 h-4 text-text-muted" />
                )}
                <span className="text-body-xs font-medium text-text-primary">
                  {wouldDrinkAgain ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div className="mt-xs pt-xs border-t border-border">
              <span className="text-body-xs text-text-muted block mb-1">Notes</span>
              <p className="text-body-s text-text-primary">{notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-xs mt-l">
        {savedTastingId && (
          <Button
            className="w-full"
            disabled={updateMutation.isPending}
            onClick={handleUpdate}
          >
            {updateMutation.isPending ? 'Updating...' : (
              <>
                <Check className="w-4 h-4 mr-1" />
                Update Tasting
              </>
            )}
          </Button>
        )}
        <Button className="w-full" variant="ghost" onClick={handleNewTasting}>
          Start New Tasting
        </Button>
        <Link href="/explore">
          <Button className="w-full" variant="ghost">
            Back to Explore
          </Button>
        </Link>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </motion.div>
  );
}
