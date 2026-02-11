import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { corkageRestaurants } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { message: 'Database not available' },
        { status: 503 },
      );
    }

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const neighborhood = searchParams.get('neighborhood');
    const cuisine = searchParams.get('cuisine');
    const hasOffer = searchParams.get('hasOffer');
    const maxFee = searchParams.get('maxFee');

    let query = db.select().from(corkageRestaurants);

    if (city) {
      query = query.where(eq(corkageRestaurants.city, city)) as typeof query;
    }

    const restaurants = await query;

    // Apply additional filters in-memory for simplicity
    let results = restaurants;
    if (neighborhood) {
      results = results.filter(
        (r) => r.neighborhood?.toLowerCase() === neighborhood.toLowerCase(),
      );
    }
    if (cuisine) {
      results = results.filter(
        (r) => r.cuisineType.toLowerCase() === cuisine.toLowerCase(),
      );
    }
    if (hasOffer === '1') {
      results = results.filter((r) => !!r.offerTitle);
    }
    if (maxFee) {
      const parsedMaxFee = Number(maxFee);
      if (!Number.isNaN(parsedMaxFee)) {
        results = results.filter((r) => r.corkageFee === null || r.corkageFee <= parsedMaxFee);
      }
    }

    return NextResponse.json({
      restaurants: results.map((r) => ({
        id: r.id,
        name: r.name,
        address: r.address,
        city: r.city,
        neighborhood: r.neighborhood,
        cuisineType: r.cuisineType,
        corkageFee: r.corkageFee,
        corkageNotes: r.corkageNotes,
        phone: r.phone,
        website: r.website,
        latitude: r.latitude,
        longitude: r.longitude,
        isVerified: r.isVerified,
        verifiedAt: r.verifiedAt,
        offerTitle: r.offerTitle,
        offerDescription: r.offerDescription,
        offerCode: r.offerCode,
        offerExpiresAt: r.offerExpiresAt,
      })),
    });
  } catch (err) {
    console.error('Corkage list error:', err);
    return NextResponse.json(
      { message: 'Failed to fetch restaurants' },
      { status: 500 },
    );
  }
}
