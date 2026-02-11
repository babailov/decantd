import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { analyticsEvents, users } from '@/common/db/schema';

import { getDb } from '@/server/auth/get-db';
import {
  getSubscription,
  mapStripeStatusToBillingStatus,
  mapStripeStatusToTier,
  verifyStripeWebhookSignature,
} from '@/server/billing/stripe';

interface StripeEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

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

function toIsoPeriodEnd(unixTs: number | undefined) {
  if (!unixTs) return null;
  return new Date(unixTs * 1000).toISOString();
}

async function upsertUserSubscriptionByCustomer(
  db: Awaited<ReturnType<typeof getDb>>,
  payload: {
    customerId: string;
    subscriptionId: string | null;
    subscriptionStatus: string | null;
    currentPeriodEnd: number | undefined;
  },
) {
  if (!db) return;

  const nextTier = mapStripeStatusToTier(payload.subscriptionStatus);
  const nextStatus = mapStripeStatusToBillingStatus(payload.subscriptionStatus);

  await db
    .update(users)
    .set({
      stripeSubscriptionId: payload.subscriptionId,
      subscriptionStatus: nextStatus,
      subscriptionTier: nextTier,
      subscriptionCurrentPeriodEnd: toIsoPeriodEnd(payload.currentPeriodEnd),
      updatedAt: new Date().toISOString(),
    } as Partial<typeof users.$inferInsert>)
    .where(eq(users.stripeCustomerId, payload.customerId));

  if (nextTier === 'paid') {
    const targetUser = await db.query.users.findFirst({
      where: eq(users.stripeCustomerId, payload.customerId),
      columns: { id: true },
    });

    if (targetUser) {
      await db.insert(analyticsEvents).values({
        id: crypto.randomUUID(),
        userId: targetUser.id,
        sessionId: 'billing-webhook',
        eventName: 'subscription_activated',
        propertiesJson: {
          status: nextStatus,
        },
        path: '/api/billing/webhook',
        createdAt: new Date().toISOString(),
      } as typeof analyticsEvents.$inferInsert);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ message: 'Database not available' }, { status: 503 });
    }

    const env = await getCloudflareEnvSafe();
    const stripeSecretKey = getEnvValue(env, 'STRIPE_SECRET_KEY');
    const webhookSecret = getEnvValue(env, 'STRIPE_WEBHOOK_SECRET');

    if (!stripeSecretKey || !webhookSecret) {
      return NextResponse.json({ message: 'Billing webhook not configured' }, { status: 503 });
    }

    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ message: 'Missing stripe-signature' }, { status: 400 });
    }

    const rawBody = await request.text();
    const isValid = verifyStripeWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as StripeEvent;

    if (event.type === 'checkout.session.completed') {
      const object = event.data.object;
      const customerId = typeof object.customer === 'string' ? object.customer : null;
      const subscriptionId = typeof object.subscription === 'string' ? object.subscription : null;

      if (customerId && subscriptionId) {
        const subscription = await getSubscription(stripeSecretKey, subscriptionId);
        await upsertUserSubscriptionByCustomer(db, {
          customerId,
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
        });
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const object = event.data.object;
      const customerId = typeof object.customer === 'string' ? object.customer : null;
      const subscriptionId = typeof object.id === 'string' ? object.id : null;
      const status = typeof object.status === 'string' ? object.status : null;
      const currentPeriodEnd = typeof object.current_period_end === 'number'
        ? object.current_period_end
        : undefined;

      if (customerId) {
        await upsertUserSubscriptionByCustomer(db, {
          customerId,
          subscriptionId,
          subscriptionStatus: status,
          currentPeriodEnd,
        });
      } else if (subscriptionId) {
        await db
          .update(users)
          .set({
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: mapStripeStatusToBillingStatus(status),
            subscriptionTier: mapStripeStatusToTier(status),
            subscriptionCurrentPeriodEnd: toIsoPeriodEnd(currentPeriodEnd),
            updatedAt: new Date().toISOString(),
          } as Partial<typeof users.$inferInsert>)
          .where(eq(users.stripeSubscriptionId, subscriptionId));
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Billing webhook error:', err);
    return NextResponse.json({ message: 'Webhook handling failed' }, { status: 500 });
  }
}
