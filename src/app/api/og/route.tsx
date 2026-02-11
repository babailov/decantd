import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

import { OCCASIONS } from '@/common/constants/wine.const';

import { getDb } from '@/server/auth/get-db';
import { fetchPlanById } from '@/server/plans/fetch-plan';

export const runtime = 'edge';

const WINE_TYPE_COLORS: Record<string, string> = {
  red: '#7B2D3A',
  white: '#C4953A',
  rose: '#DB7093',
  sparkling: '#D4A84B',
};

export async function GET(request: NextRequest) {
  const planId = request.nextUrl.searchParams.get('planId');

  if (!planId) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #FAF7F2, #EDE7DC)',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 700, color: '#7B2D3A' }}>
            Decantd
          </div>
          <div style={{ fontSize: 24, color: '#6B5E54', marginTop: 12 }}>
            AI Wine Tasting Planner
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  try {
    const db = await getDb();
    if (!db) {
      return fallbackImage();
    }

    const plan = await fetchPlanById(db, planId);
    if (!plan) {
      return fallbackImage();
    }

    const occasionLabel =
      OCCASIONS.find((o) => o.value === plan.occasion)?.label || plan.occasion;
    const occasionEmoji =
      OCCASIONS.find((o) => o.value === plan.occasion)?.emoji || '';

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #FAF7F2, #EDE7DC)',
            fontFamily: 'sans-serif',
            padding: '48px 56px',
          }}
        >
          {/* Top bar: branding + wine count */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 32,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: '#7B2D3A' }}>
              Decantd
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(123,45,58,0.1)',
                padding: '8px 20px',
                borderRadius: 24,
                fontSize: 18,
                fontWeight: 600,
                color: '#7B2D3A',
              }}
            >
              {plan.wineCount} {plan.wineCount === 1 ? 'Wine' : 'Wines'}
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: '#2C1810',
              lineHeight: 1.2,
              marginBottom: 12,
              maxWidth: '90%',
            }}
          >
            {plan.title}
          </div>

          {/* Subtitle: occasion + food */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 20,
              color: '#6B5E54',
              marginBottom: 36,
            }}
          >
            <span>
              {occasionEmoji} {occasionLabel}
            </span>
            {plan.foodPairing && (
              <>
                <span style={{ color: '#C4A98A' }}>|</span>
                <span>Paired with {plan.foodPairing}</span>
              </>
            )}
          </div>

          {/* Wine list chips */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              flex: 1,
              alignContent: 'flex-start',
            }}
          >
            {plan.wines.slice(0, 6).map((wine, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#FFFFFF',
                  borderRadius: 12,
                  padding: '12px 20px',
                  borderLeft: `4px solid ${WINE_TYPE_COLORS[wine.wineType] || '#7B2D3A'}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    background: WINE_TYPE_COLORS[wine.wineType] || '#7B2D3A',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {wine.tastingOrder}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{ fontSize: 16, fontWeight: 600, color: '#2C1810' }}
                  >
                    {wine.varietal}
                  </span>
                  <span style={{ fontSize: 13, color: '#6B5E54' }}>
                    {wine.region}
                    {wine.estimatedPriceMin && wine.estimatedPriceMax
                      ? ` · $${wine.estimatedPriceMin}–$${wine.estimatedPriceMax}`
                      : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #D9CFC4',
              paddingTop: 20,
              marginTop: 16,
            }}
          >
            <div style={{ fontSize: 16, color: '#6B5E54' }}>
              {plan.totalEstimatedCostMin > 0 &&
                `Est. $${plan.totalEstimatedCostMin}–$${plan.totalEstimatedCostMax} total`}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#7B2D3A' }}>
              decantd.app
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  } catch {
    return fallbackImage();
  }
}

function fallbackImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FAF7F2, #EDE7DC)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 700, color: '#7B2D3A' }}>
          Decantd
        </div>
        <div style={{ fontSize: 24, color: '#6B5E54', marginTop: 12 }}>
          AI Wine Tasting Planner
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
