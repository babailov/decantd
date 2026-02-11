import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getPlanUrl } from '@/common/constants/urls';
import { OCCASIONS } from '@/common/constants/wine.const';

import { getDb } from '@/server/auth/get-db';
import { sendEmail } from '@/server/email/send-email';
import { getSharePlanEmail } from '@/server/email/templates/share-plan';
import { fetchPlanById } from '@/server/plans/fetch-plan';

const shareEmailSchema = z.object({
  planId: z.string().min(1),
  recipientEmail: z.string().email(),
  senderName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = shareEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { planId, recipientEmail, senderName } = parsed.data;

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 },
      );
    }

    const plan = await fetchPlanById(db, planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 },
      );
    }

    const occasionLabel =
      OCCASIONS.find((o) => o.value === plan.occasion)?.label || plan.occasion;
    const occasionEmoji =
      OCCASIONS.find((o) => o.value === plan.occasion)?.emoji || '';

    const { subject, html } = getSharePlanEmail({
      planTitle: plan.title,
      occasion: `${occasionEmoji} ${occasionLabel}`,
      description: plan.description,
      wines: plan.wines.map((w) => ({
        varietal: w.varietal,
        region: w.region,
        estimatedPriceMin: w.estimatedPriceMin,
        estimatedPriceMax: w.estimatedPriceMax,
        tastingOrder: w.tastingOrder,
      })),
      totalEstimatedCostMin: plan.totalEstimatedCostMin,
      totalEstimatedCostMax: plan.totalEstimatedCostMax,
      planUrl: getPlanUrl(planId),
      senderName,
    });

    const sent = await sendEmail({
      to: recipientEmail,
      subject,
      html,
    });

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
