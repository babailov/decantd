'use client';

import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { OCCASIONS } from '@/common/constants/wine.const';
import { trackEvent } from '@/common/services/analytics-api';
import { TastingPlan } from '@/common/types/tasting';

const WINE_TYPE_COLORS: Record<string, string> = {
  red: '#7B2D3A',
  white: '#C4953A',
  rose: '#DB7093',
  sparkling: '#D4A84B',
};

interface ShareAsImageProps {
  plan: TastingPlan;
}

export function ShareAsImage({ plan }: ShareAsImageProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const occasionLabel =
    OCCASIONS.find((o) => o.value === plan.occasion)?.label || plan.occasion;
  const occasionEmoji =
    OCCASIONS.find((o) => o.value === plan.occasion)?.emoji || '';

  const handleSave = useCallback(async () => {
    if (!cardRef.current || saving) return;

    setSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#FAF7F2',
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${plan.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-decantd.png`;
      link.href = dataUrl;
      link.click();

      toast.success('Image saved!');
      trackEvent('plan_shared_image', { planId: plan.id });
    } catch {
      toast.error('Failed to save image');
    } finally {
      setSaving(false);
    }
  }, [plan, saving]);

  return (
    <>
      {/* Hidden off-screen card for capture */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: 600,
          zIndex: -1,
        }}
      >
        <div
          ref={cardRef}
          style={{
            width: 600,
            padding: 40,
            backgroundColor: '#FAF7F2',
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <div
              style={{ fontSize: 24, fontWeight: 700, color: '#7B2D3A' }}
            >
              Decantd
            </div>
            <div style={{ fontSize: 14, color: '#6B5E54' }}>
              {plan.wineCount} {plan.wineCount === 1 ? 'wine' : 'wines'}
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#2C1810',
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {plan.title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 16,
              color: '#6B5E54',
              marginBottom: 24,
            }}
          >
            {occasionEmoji} {occasionLabel}
            {plan.foodPairing ? ` · Paired with ${plan.foodPairing}` : ''}
          </div>

          {/* Wine list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {plan.wines.map((wine) => (
              <div
                key={wine.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 10,
                  padding: '14px 16px',
                  borderLeft: `4px solid ${WINE_TYPE_COLORS[wine.wineType] || '#7B2D3A'}`,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor:
                      WINE_TYPE_COLORS[wine.wineType] || '#7B2D3A',
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {wine.tastingOrder}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#2C1810',
                    }}
                  >
                    {wine.varietal}
                  </div>
                  <div style={{ fontSize: 13, color: '#6B5E54' }}>
                    {wine.region} · ${wine.estimatedPriceMin}–$
                    {wine.estimatedPriceMax}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid #E8DFD5',
            }}
          >
            <div style={{ fontSize: 14, color: '#6B5E54' }}>
              {plan.totalEstimatedCostMin > 0 &&
                `Est. $${plan.totalEstimatedCostMin}–$${plan.totalEstimatedCostMax}`}
            </div>
            <div
              style={{ fontSize: 14, fontWeight: 600, color: '#7B2D3A' }}
            >
              decantd.app
            </div>
          </div>
        </div>
      </div>

      {/* Trigger button */}
      <button
        className="flex items-center gap-s w-full text-left px-s py-xs rounded-xl hover:bg-surface-elevated transition-colors"
        disabled={saving}
        onClick={handleSave}
      >
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
          {saving ? (
            <Loader2 className="w-5 h-5 text-accent animate-spin" />
          ) : (
            <Download className="w-5 h-5 text-accent" />
          )}
        </div>
        <div>
          <p className="text-body-m font-medium text-text-primary">
            Save as Image
          </p>
          <p className="text-body-xs text-text-muted">
            Download as PNG
          </p>
        </div>
      </button>
    </>
  );
}
