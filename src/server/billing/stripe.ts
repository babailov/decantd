import crypto from 'node:crypto';

interface StripeCustomer {
  id: string;
}

interface StripeCheckoutSession {
  id: string;
  url: string | null;
}

interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_end?: number;
}

function getStripeBaseUrl() {
  return 'https://api.stripe.com/v1';
}

function toFormBody(params: Record<string, string>) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    body.set(key, value);
  }
  return body;
}

async function stripeRequest<T>(secretKey: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getStripeBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stripe API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export function mapStripeStatusToBillingStatus(
  status: string | null | undefined,
): 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' {
  if (!status) return 'inactive';
  if (status === 'trialing') return 'trialing';
  if (status === 'active') return 'active';
  if (status === 'past_due') return 'past_due';
  if (status === 'canceled') return 'canceled';
  if (status === 'unpaid') return 'unpaid';
  return 'inactive';
}

export function mapStripeStatusToTier(status: string | null | undefined): 'free' | 'paid' {
  if (!status) return 'free';
  return status === 'active' || status === 'trialing' ? 'paid' : 'free';
}

export async function createStripeCustomer(
  secretKey: string,
  email: string,
  userId: string,
): Promise<StripeCustomer> {
  return stripeRequest<StripeCustomer>(secretKey, '/customers', {
    method: 'POST',
    body: toFormBody({
      email,
      'metadata[user_id]': userId,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function createCheckoutSession(
  secretKey: string,
  params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    userId: string;
  },
): Promise<StripeCheckoutSession> {
  return stripeRequest<StripeCheckoutSession>(secretKey, '/checkout/sessions', {
    method: 'POST',
    body: toFormBody({
      mode: 'subscription',
      customer: params.customerId,
      'line_items[0][price]': params.priceId,
      'line_items[0][quantity]': '1',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      'metadata[user_id]': params.userId,
      'subscription_data[metadata][user_id]': params.userId,
      allow_promotion_codes: 'true',
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

export async function getSubscription(
  secretKey: string,
  subscriptionId: string,
): Promise<StripeSubscription> {
  return stripeRequest<StripeSubscription>(secretKey, `/subscriptions/${subscriptionId}`);
}

export function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string,
  endpointSecret: string,
): boolean {
  const fields = signatureHeader.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k] = v;
    return acc;
  }, {});

  const timestamp = fields.t;
  const signature = fields.v1;

  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac('sha256', endpointSecret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  const left = Buffer.from(expected, 'utf8');
  const right = Buffer.from(signature, 'utf8');
  if (left.length !== right.length) return false;

  return crypto.timingSafeEqual(left, right);
}
