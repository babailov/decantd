import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { users } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import { getUserFromRequest } from '@/server/auth/session';
import { createCheckoutSession, createStripeCustomer } from '@/server/billing/stripe';

function getEnvValue(env: CloudflareEnv | null, key: keyof CloudflareEnv): string {
  if (env && env[key]) return String(env[key]);
  return process.env[key] || '';
}

async function getCloudflareEnvSafe() {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const ctx = await getCloudflareContext();
    return ctx.env as CloudflareEnv;
  } catch {
    return null;
  }
}

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

    const env = await getCloudflareEnvSafe();
    const stripeSecretKey = getEnvValue(env, 'STRIPE_SECRET_KEY');
    const stripePriceId = getEnvValue(env, 'STRIPE_PRICE_ID_MONTHLY');
    const configuredReturnUrl = getEnvValue(env, 'BILLING_RETURN_URL');

    if (!stripeSecretKey || !stripePriceId) {
      return NextResponse.json({ message: 'Billing is not configured' }, { status: 503 });
    }

    const appUrl = configuredReturnUrl || new URL(request.url).origin;
    const successUrl = `${appUrl}/?billing=success`;
    const cancelUrl = `${appUrl}/?billing=cancel`;

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });
    if (!dbUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let customerId = dbUser.stripeCustomerId;

    if (!customerId) {
      const customer = await createStripeCustomer(stripeSecretKey, dbUser.email, dbUser.id);
      customerId = customer.id;

      await db
        .update(users)
        .set({ stripeCustomerId: customerId } as Partial<typeof users.$inferInsert>)
        .where(eq(users.id, dbUser.id));
    }

    const session = await createCheckoutSession(stripeSecretKey, {
      customerId,
      priceId: stripePriceId,
      successUrl,
      cancelUrl,
      userId: dbUser.id,
    });

    if (!session.url) {
      return NextResponse.json({ message: 'Checkout session URL missing' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Billing checkout error:', err);
    const message = err instanceof Error ? err.message : 'Failed to create checkout session';
    return NextResponse.json({ message }, { status: 500 });
  }
}
