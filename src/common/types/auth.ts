import { BillingStatus, SubscriptionTier } from './tier';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  authProvider?: 'google' | null;
  subscriptionTier: SubscriptionTier;
  billingStatus?: BillingStatus;
  subscriptionCurrentPeriodEnd?: string | null;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
