'use client';

import { ArrowLeft } from 'lucide-react';

import { Button } from '@/common/components/Button';
import { FlavorRadar } from '@/common/components/FlavorRadar';
import { Slider } from '@/common/components/Slider';
import { DIMENSION_EDUCATION } from '@/common/constants/tasting-guide.const';
import { useGuidedTastingStore } from '@/common/stores/useGuidedTastingStore';

const DIMENSIONS = ['acidity', 'tannin', 'sweetness', 'alcohol', 'body'] as const;

export function TasteStep() {
  const acidity = useGuidedTastingStore((s) => s.acidity);
  const tannin = useGuidedTastingStore((s) => s.tannin);
  const sweetness = useGuidedTastingStore((s) => s.sweetness);
  const alcohol = useGuidedTastingStore((s) => s.alcohol);
  const body = useGuidedTastingStore((s) => s.body);
  const wineType = useGuidedTastingStore((s) => s.wineType);
  const setDimension = useGuidedTastingStore((s) => s.setDimension);
  const nextStep = useGuidedTastingStore((s) => s.nextStep);
  const prevStep = useGuidedTastingStore((s) => s.prevStep);
  const isReviewMode = useGuidedTastingStore((s) => s.isReviewMode);
  const setCurrentStep = useGuidedTastingStore((s) => s.setCurrentStep);

  const values: Record<string, number> = { acidity, tannin, sweetness, alcohol, body };

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        Taste Your Wine
      </h2>
      <p className="text-body-m text-text-secondary mb-m">
        Take a sip. Let it coat your palate. Rate each dimension.
      </p>

      {/* Live FlavorRadar */}
      <div className="mb-m p-s rounded-xl border border-border bg-surface-elevated">
        <FlavorRadar
          className="h-52"
          data={{ acidity, tannin, sweetness, alcohol, body }}
          wineType={wineType ?? 'red'}
        />
      </div>

      {/* Dimension sliders */}
      <div className="flex flex-col gap-m">
        {DIMENSIONS.map((dim) => {
          const info = DIMENSION_EDUCATION[dim];
          const val = values[dim];

          return (
            <div key={dim}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-body-s font-medium text-text-primary">
                  {info.label}
                </span>
                <span className="text-body-xs font-medium text-primary">
                  {val}/5
                </span>
              </div>
              <Slider
                max={5}
                min={0}
                step={1}
                value={[val]}
                onValueChange={([v]) => setDimension(dim, v)}
              />
              <div className="flex justify-between mt-0.5">
                <span className="text-body-xs text-text-muted">{info.low}</span>
                <span className="text-body-xs text-text-muted">{info.high}</span>
              </div>
              <p className="text-body-xs text-text-muted mt-1">
                {info.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-s mt-l">
        {isReviewMode ? (
          <Button className="flex-1" onClick={() => setCurrentStep('summary')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Summary
          </Button>
        ) : (
          <>
            <Button className="flex-1" variant="ghost" onClick={prevStep}>
              Back
            </Button>
            <Button className="flex-1" onClick={nextStep}>
              Continue
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
