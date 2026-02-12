import { Metadata } from 'next';

import { getOgImageUrl } from '@/common/constants/urls';
import { OCCASIONS } from '@/common/constants/wine.const';

import { TastingPlanPageClient } from './TastingPlanPageClient';

import { getDb } from '@/server/auth/get-db';
import { fetchPlanById } from '@/server/plans/fetch-plan';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const db = await getDb();
    if (!db) return {};

    const plan = await fetchPlanById(db, id);
    if (!plan) return {};

    const occasionLabel =
      OCCASIONS.find((o) => o.value === plan.occasion)?.label || plan.occasion;

    const wineNames = plan.wines
      .slice(0, 3)
      .map((w) => w.varietal)
      .join(', ');
    const suffix = plan.wines.length > 3 ? '...' : '';

    const description = plan.foodPairing
      ? `${occasionLabel} tasting plan paired with ${plan.foodPairing}: ${wineNames}${suffix}`
      : `${occasionLabel} tasting plan: ${wineNames}${suffix}`;

    const title = `${plan.title} — ${plan.wineCount} ${plan.wineCount === 1 ? 'Wine' : 'Wines'}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: getOgImageUrl(id), width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [getOgImageUrl(id)],
      },
    };
  } catch {
    return {};
  }
}

export default async function TastingPlanPage({ params }: PageProps) {
  const { id } = await params;
  return <TastingPlanPageClient id={id} />;
}
