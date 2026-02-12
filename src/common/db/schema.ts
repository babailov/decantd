import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ── Auth ──────────────────────────────────────────────

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  oauthProvider: text('oauth_provider'),
  oauthId: text('oauth_id'),
  subscriptionTier: text('subscription_tier').notNull().default('free'),
  subscriptionStatus: text('subscription_status').notNull().default('inactive'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionCurrentPeriodEnd: text('subscription_current_period_end'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  tokenHash: text('token_hash').notNull(),
  expiresAt: text('expires_at').notNull(),
  usedAt: text('used_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── Tasting Plans ─────────────────────────────────────

export const tastingPlans = sqliteTable('tasting_plans', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  occasion: text('occasion').notNull(),
  foodPairing: text('food_pairing').notNull(),
  regionPreferences: text('region_preferences', { mode: 'json' })
    .notNull()
    .$type<string[]>(),
  budgetMin: real('budget_min').notNull(),
  budgetMax: real('budget_max').notNull(),
  budgetCurrency: text('budget_currency').notNull().default('USD'),
  wineCount: integer('wine_count').notNull(),
  generatedPlan: text('generated_plan', { mode: 'json' }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const tastingPlanWines = sqliteTable('tasting_plan_wines', {
  id: text('id').primaryKey(),
  planId: text('plan_id')
    .notNull()
    .references(() => tastingPlans.id),
  varietal: text('varietal').notNull(),
  region: text('region').notNull(),
  subRegion: text('sub_region'),
  yearRange: text('year_range'),
  acidity: real('acidity').notNull(),
  tannin: real('tannin').notNull(),
  sweetness: real('sweetness').notNull(),
  alcohol: real('alcohol').notNull(),
  body: real('body').notNull(),
  description: text('description').notNull(),
  pairingRationale: text('pairing_rationale').notNull(),
  flavorNotes: text('flavor_notes', { mode: 'json' })
    .notNull()
    .$type<string[]>(),
  tastingOrder: integer('tasting_order').notNull(),
  estimatedPriceMin: real('estimated_price_min').notNull(),
  estimatedPriceMax: real('estimated_price_max').notNull(),
  wineType: text('wine_type').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── Wine Ratings (Tasting Journal) ────────────────────

export const wineRatings = sqliteTable('wine_ratings', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  planWineId: text('plan_wine_id')
    .notNull()
    .references(() => tastingPlanWines.id),
  planId: text('plan_id')
    .notNull()
    .references(() => tastingPlans.id),
  rating: integer('rating').notNull(), // 1-5
  tastingNotes: text('tasting_notes'),
  tried: integer('tried', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── Plan Cache ────────────────────────────────────────

export const cachedPlans = sqliteTable('cached_plans', {
  id: text('id').primaryKey(),
  inputHash: text('input_hash').notNull().unique(),
  occasion: text('occasion').notNull(),
  foodPairing: text('food_pairing').notNull(),
  regionPreferences: text('region_preferences', { mode: 'json' })
    .notNull()
    .$type<string[]>()
    .default([]),
  budgetMin: real('budget_min').notNull(),
  budgetMax: real('budget_max').notNull(),
  wineCount: integer('wine_count').notNull(),
  planId: text('plan_id')
    .notNull()
    .references(() => tastingPlans.id),
  expiresAt: text('expires_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── Generation Logs ───────────────────────────────────

export const generationLogs = sqliteTable('generation_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  inputHash: text('input_hash').notNull(),
  planId: text('plan_id').references(() => tastingPlans.id),
  wasCacheHit: integer('was_cache_hit', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── Guided Tastings ─────────────────────────────────

export const guidedTastings = sqliteTable('guided_tastings', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),

  // Wine identity (all optional)
  wineName: text('wine_name'),
  varietal: text('varietal'),
  year: integer('year'),

  // Look
  wineType: text('wine_type').notNull(),
  colorDepth: text('color_depth'),
  clarity: text('clarity'),
  viscosityNoted: integer('viscosity_noted', { mode: 'boolean' })
    .notNull()
    .default(false),

  // Smell
  selectedAromas: text('selected_aromas', { mode: 'json' })
    .notNull()
    .$type<string[]>()
    .default([]),

  // Taste (0-5)
  acidity: real('acidity').notNull().default(3),
  tannin: real('tannin').notNull().default(3),
  sweetness: real('sweetness').notNull().default(1),
  alcohol: real('alcohol').notNull().default(3),
  body: real('body').notNull().default(3),

  // Think
  balance: integer('balance').notNull().default(0),
  complexity: integer('complexity').notNull().default(0),
  finishLength: text('finish_length'),
  wouldDrinkAgain: integer('would_drink_again', { mode: 'boolean' }),
  notes: text('notes').notNull().default(''),

  // Meta
  isComplete: integer('is_complete', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── Corkage Directory ─────────────────────────────────

export const corkageRestaurants = sqliteTable('corkage_restaurants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  neighborhood: text('neighborhood'),
  cuisineType: text('cuisine_type').notNull(),
  corkageFee: real('corkage_fee'),
  corkageNotes: text('corkage_notes'),
  phone: text('phone'),
  website: text('website'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  verifiedAt: text('verified_at'),
  offerTitle: text('offer_title'),
  offerDescription: text('offer_description'),
  offerCode: text('offer_code'),
  offerExpiresAt: text('offer_expires_at'),
  submittedBy: text('submitted_by'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const savedVenues = sqliteTable('saved_venues', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  restaurantId: text('restaurant_id')
    .notNull()
    .references(() => corkageRestaurants.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const analyticsEvents = sqliteTable('analytics_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  sessionId: text('session_id').notNull(),
  eventName: text('event_name').notNull(),
  propertiesJson: text('properties_json', { mode: 'json' })
    .notNull()
    .$type<Record<string, unknown>>()
    .default(sql`'{}'`),
  path: text('path'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});
