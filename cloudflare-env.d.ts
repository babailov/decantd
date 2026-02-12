declare global {
  interface CloudflareEnv {
    DB: D1Database;
    ANTHROPIC_API_KEY: string;
    NEXT_PUBLIC_ENV: string;
    RESEND_API_KEY: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    STRIPE_PRICE_ID_MONTHLY: string;
    BILLING_RETURN_URL: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
  }
}

export {};
