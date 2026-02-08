import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { tastingPlanWines, wineRatings } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

// Archetype classification based on palate preferences
function classifyArchetype(preferences: {
  acidity: number;
  tannin: number;
  sweetness: number;
  body: number;
  adventurousness: number;
}): { label: string; description: string } {
  const { acidity, tannin, sweetness, body, adventurousness } = preferences;

  if (adventurousness > 0.7 && body > 3) {
    return { label: 'Bold Explorer', description: 'You seek intense, full-bodied wines from diverse regions.' };
  }
  if (adventurousness > 0.7 && acidity > 3) {
    return { label: 'Curious Wanderer', description: 'You love discovering crisp, bright wines from unexpected places.' };
  }
  if (acidity > 3.5 && sweetness < 2) {
    return { label: 'Mineral Purist', description: 'You gravitate toward clean, mineral-driven wines with high acidity.' };
  }
  if (tannin > 3.5 && body > 3.5) {
    return { label: 'Structured Connoisseur', description: 'You appreciate powerful, tannic wines with depth and structure.' };
  }
  if (sweetness > 3) {
    return { label: 'Sweet Whisperer', description: 'You enjoy wines with a touch of sweetness and generous fruit.' };
  }
  if (body < 2.5 && acidity > 2.5) {
    return { label: 'Elegant Purist', description: 'You prefer delicate, refined wines with precision and grace.' };
  }
  if (adventurousness > 0.5) {
    return { label: 'Adventurous Taster', description: 'You enjoy trying new things and have a balanced, open palate.' };
  }
  return { label: 'Classic Enthusiast', description: 'You appreciate well-made wines in traditional styles.' };
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { message: 'Database not available' },
        { status: 503 },
      );
    }

    const user = await getUserFromRequest(request, db);
    if (!user) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 },
      );
    }

    // Get all user ratings
    const ratings = await db.query.wineRatings.findMany({
      where: eq(wineRatings.userId, user.id),
    });

    if (ratings.length < 3) {
      return NextResponse.json({
        ready: false,
        ratingsCount: ratings.length,
        minRequired: 3,
        message: `Rate ${3 - ratings.length} more wines to unlock your Palate Profile.`,
      });
    }

    // Get associated wine details
    const wines = await Promise.all(
      ratings.map((r) =>
        db.query.tastingPlanWines.findFirst({
          where: eq(tastingPlanWines.id, r.planWineId),
        }),
      ),
    );

    // Compute weighted averages (weighted by user rating)
    let totalWeight = 0;
    let avgAcidity = 0;
    let avgTannin = 0;
    let avgSweetness = 0;
    let avgAlcohol = 0;
    let avgBody = 0;
    const regionCounts = new Map<string, number>();
    const wineTypeCounts = new Map<string, number>();
    const varietalCounts = new Map<string, number>();

    ratings.forEach((rating, i) => {
      const wine = wines[i];
      if (!wine) return;

      const weight = rating.rating; // Higher-rated wines count more
      totalWeight += weight;
      avgAcidity += wine.acidity * weight;
      avgTannin += wine.tannin * weight;
      avgSweetness += wine.sweetness * weight;
      avgAlcohol += wine.alcohol * weight;
      avgBody += wine.body * weight;

      regionCounts.set(
        wine.region,
        (regionCounts.get(wine.region) || 0) + weight,
      );
      wineTypeCounts.set(
        wine.wineType,
        (wineTypeCounts.get(wine.wineType) || 0) + weight,
      );
      varietalCounts.set(
        wine.varietal,
        (varietalCounts.get(wine.varietal) || 0) + weight,
      );
    });

    if (totalWeight === 0) {
      return NextResponse.json({
        ready: false,
        ratingsCount: 0,
        minRequired: 3,
        message: 'Rate at least 3 wines to unlock your Palate Profile.',
      });
    }

    avgAcidity /= totalWeight;
    avgTannin /= totalWeight;
    avgSweetness /= totalWeight;
    avgAlcohol /= totalWeight;
    avgBody /= totalWeight;

    // Sort and get top entries
    const topRegions = [...regionCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const topVarietals = [...varietalCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const topWineTypes = [...wineTypeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    // Adventurousness = unique regions / total ratings (normalized 0-1)
    const uniqueRegions = regionCounts.size;
    const adventurousness = Math.min(uniqueRegions / Math.max(ratings.length, 1), 1);

    const archetype = classifyArchetype({
      acidity: avgAcidity,
      tannin: avgTannin,
      sweetness: avgSweetness,
      body: avgBody,
      adventurousness,
    });

    return NextResponse.json({
      ready: true,
      ratingsCount: ratings.length,
      profile: {
        flavorPreferences: {
          acidity: Math.round(avgAcidity * 10) / 10,
          tannin: Math.round(avgTannin * 10) / 10,
          sweetness: Math.round(avgSweetness * 10) / 10,
          alcohol: Math.round(avgAlcohol * 10) / 10,
          body: Math.round(avgBody * 10) / 10,
        },
        topRegions,
        topVarietals,
        topWineTypes,
        adventurousness: Math.round(adventurousness * 100),
        archetype,
      },
    });
  } catch (err) {
    console.error('Palate profile error:', err);
    return NextResponse.json(
      { message: 'Failed to compute palate profile' },
      { status: 500 },
    );
  }
}
