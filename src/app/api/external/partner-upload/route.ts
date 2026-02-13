import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  marketListings,
  pairingKnowledge,
  partnerSubmissions,
  sourceRegistry,
  venueWineLists,
} from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';

const venueRecordSchema = z.object({
  wineCanonicalId: z.string().uuid().optional(),
  venueName: z.string().min(1).max(200),
  city: z.string().min(1).max(120),
  neighborhood: z.string().max(120).optional(),
  servingFormat: z.enum(['glass', 'bottle']),
  currency: z.string().min(3).max(3).default('USD'),
  price: z.number().positive(),
  available: z.boolean().default(true),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  rawWineName: z.string().min(1).max(240),
  rawProducerName: z.string().max(240).optional(),
  rawVintage: z.number().int().min(1900).max(2100).optional(),
});

const marketRecordSchema = z.object({
  wineCanonicalId: z.string().uuid().optional(),
  merchantName: z.string().min(1).max(200),
  locationText: z.string().max(220).optional(),
  channel: z.enum(['retail', 'restaurant', 'distributor', 'agent']),
  currency: z.string().min(3).max(3).default('USD'),
  price: z.number().positive(),
  inStock: z.boolean().default(true),
  stockWindowStart: z.string().datetime().optional(),
  stockWindowEnd: z.string().datetime().optional(),
  listingUrl: z.string().url().max(500).optional(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  confidenceScore: z.number().min(0).max(1).default(0.5),
  rawWineName: z.string().min(1).max(240),
  rawProducerName: z.string().max(240).optional(),
  rawVintage: z.number().int().min(1900).max(2100).optional(),
});

const pairingRecordSchema = z.object({
  wineCanonicalId: z.string().uuid().optional(),
  dishName: z.string().min(1).max(200),
  cuisineType: z.string().max(120).optional(),
  dishAttributes: z.array(z.string().min(1).max(80)).max(20).default([]),
  rationale: z.string().min(1).max(2000),
  evidenceLevel: z.enum(['practitioner', 'editorial', 'reference']).default('practitioner'),
  authorLabel: z.string().max(200).optional(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
});

const uploadSchema = z.discriminatedUnion('submissionType', [
  z.object({
    sourceId: z.string().uuid(),
    submissionType: z.literal('venue_wine_list'),
    submittedByLabel: z.string().max(120).optional(),
    records: z.array(venueRecordSchema).min(1).max(1000),
  }),
  z.object({
    sourceId: z.string().uuid(),
    submissionType: z.literal('market_listing'),
    submittedByLabel: z.string().max(120).optional(),
    records: z.array(marketRecordSchema).min(1).max(1000),
  }),
  z.object({
    sourceId: z.string().uuid(),
    submissionType: z.literal('pairing_note'),
    submittedByLabel: z.string().max(120).optional(),
    records: z.array(pairingRecordSchema).min(1).max(1000),
  }),
]);

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ message: 'Database not available' }, { status: 503 });
    }

    const user = await getUserFromRequest(request, db);
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const input = uploadSchema.parse(body);

    const source = await db.query.sourceRegistry.findFirst({
      where: eq(sourceRegistry.id, input.sourceId),
    });

    if (!source || !source.isActive) {
      return NextResponse.json(
        { message: 'Active source not found for sourceId' },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const submissionId = crypto.randomUUID();

    await db.insert(partnerSubmissions).values({
      id: submissionId,
      sourceId: input.sourceId,
      submittedByUserId: user.id,
      submittedByLabel: input.submittedByLabel ?? null,
      submissionType: input.submissionType,
      status: 'accepted',
      parserVersion: 'v1',
      recordCount: input.records.length,
      validationErrors: [],
      rawPayload: body,
      receivedAt: now,
      createdAt: now,
    } as typeof partnerSubmissions.$inferInsert);

    if (input.submissionType === 'venue_wine_list') {
      for (const record of input.records) {
        await db.insert(venueWineLists).values({
          id: crypto.randomUUID(),
          sourceId: input.sourceId,
          wineCanonicalId: record.wineCanonicalId ?? null,
          venueName: record.venueName,
          city: record.city,
          neighborhood: record.neighborhood ?? null,
          servingFormat: record.servingFormat,
          currency: record.currency,
          price: record.price,
          available: record.available,
          effectiveFrom: record.effectiveFrom ?? null,
          effectiveTo: record.effectiveTo ?? null,
          rawWineName: record.rawWineName,
          rawProducerName: record.rawProducerName ?? null,
          rawVintage: record.rawVintage ?? null,
          createdAt: now,
          updatedAt: now,
        } as typeof venueWineLists.$inferInsert);
      }
    }

    if (input.submissionType === 'market_listing') {
      for (const record of input.records) {
        await db.insert(marketListings).values({
          id: crypto.randomUUID(),
          sourceId: input.sourceId,
          wineCanonicalId: record.wineCanonicalId ?? null,
          merchantName: record.merchantName,
          locationText: record.locationText ?? null,
          channel: record.channel,
          currency: record.currency,
          price: record.price,
          inStock: record.inStock,
          stockWindowStart: record.stockWindowStart ?? null,
          stockWindowEnd: record.stockWindowEnd ?? null,
          listingUrl: record.listingUrl ?? null,
          effectiveFrom: record.effectiveFrom ?? null,
          effectiveTo: record.effectiveTo ?? null,
          confidenceScore: record.confidenceScore,
          rawWineName: record.rawWineName,
          rawProducerName: record.rawProducerName ?? null,
          rawVintage: record.rawVintage ?? null,
          capturedAt: now,
        } as typeof marketListings.$inferInsert);
      }
    }

    if (input.submissionType === 'pairing_note') {
      for (const record of input.records) {
        await db.insert(pairingKnowledge).values({
          id: crypto.randomUUID(),
          sourceId: input.sourceId,
          wineCanonicalId: record.wineCanonicalId ?? null,
          dishName: record.dishName,
          cuisineType: record.cuisineType ?? null,
          dishAttributes: record.dishAttributes,
          rationale: record.rationale,
          evidenceLevel: record.evidenceLevel,
          authorLabel: record.authorLabel ?? null,
          effectiveFrom: record.effectiveFrom ?? null,
          effectiveTo: record.effectiveTo ?? null,
          createdAt: now,
          updatedAt: now,
        } as typeof pairingKnowledge.$inferInsert);
      }
    }

    return NextResponse.json({
      ok: true,
      submissionId,
      sourceId: input.sourceId,
      submissionType: input.submissionType,
      recordsAccepted: input.records.length,
      receivedAt: now,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid partner upload payload', errors: err.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error('Partner upload error:', err);
    return NextResponse.json({ message: 'Failed to ingest partner upload' }, { status: 500 });
  }
}
