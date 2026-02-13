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

// ── External Data Sources & Curation ─────────────────

export const sourceRegistry = sqliteTable('source_registry', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sourceType: text('source_type').notNull(), // license | partner | public
  licenseType: text('license_type').notNull(), // paid | permissioned | public_domain
  trustTier: text('trust_tier').notNull().default('C'), // A | B | C
  updateCadence: text('update_cadence'), // daily | weekly | monthly | ad_hoc
  accessNotes: text('access_notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const wineCanonical = sqliteTable('wine_canonical', {
  id: text('id').primaryKey(),
  producerName: text('producer_name').notNull(),
  wineName: text('wine_name').notNull(),
  vintage: integer('vintage'),
  varietal: text('varietal'),
  region: text('region'),
  subRegion: text('sub_region'),
  country: text('country'),
  styleDescription: text('style_description'),
  acidity: real('acidity'),
  tannin: real('tannin'),
  sweetness: real('sweetness'),
  alcohol: real('alcohol'),
  body: real('body'),
  servingTempCMin: real('serving_temp_c_min'),
  servingTempCMax: real('serving_temp_c_max'),
  decantMinutes: integer('decant_minutes'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const wineAliases = sqliteTable('wine_aliases', {
  id: text('id').primaryKey(),
  wineCanonicalId: text('wine_canonical_id')
    .notNull()
    .references(() => wineCanonical.id),
  alias: text('alias').notNull(),
  aliasType: text('alias_type').notNull().default('label'), // label | spelling | merchant_title
  sourceId: text('source_id').references(() => sourceRegistry.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const partnerSubmissions = sqliteTable('partner_submissions', {
  id: text('id').primaryKey(),
  sourceId: text('source_id')
    .notNull()
    .references(() => sourceRegistry.id),
  submittedByUserId: text('submitted_by_user_id').references(() => users.id),
  submittedByLabel: text('submitted_by_label'),
  submissionType: text('submission_type').notNull(), // venue_wine_list | market_listing | pairing_note
  status: text('status').notNull().default('accepted'),
  parserVersion: text('parser_version').notNull().default('v1'),
  recordCount: integer('record_count').notNull().default(0),
  validationErrors: text('validation_errors', { mode: 'json' })
    .notNull()
    .$type<string[]>()
    .default(sql`'[]'`),
  rawPayload: text('raw_payload', { mode: 'json' })
    .notNull()
    .$type<Record<string, unknown>>(),
  receivedAt: text('received_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const marketListings = sqliteTable('market_listings', {
  id: text('id').primaryKey(),
  sourceId: text('source_id')
    .notNull()
    .references(() => sourceRegistry.id),
  wineCanonicalId: text('wine_canonical_id').references(() => wineCanonical.id),
  merchantName: text('merchant_name').notNull(),
  locationText: text('location_text'),
  channel: text('channel').notNull(), // retail | restaurant | distributor | agent
  currency: text('currency').notNull().default('USD'),
  price: real('price').notNull(),
  inStock: integer('in_stock', { mode: 'boolean' }).notNull().default(true),
  stockWindowStart: text('stock_window_start'),
  stockWindowEnd: text('stock_window_end'),
  listingUrl: text('listing_url'),
  effectiveFrom: text('effective_from'),
  effectiveTo: text('effective_to'),
  confidenceScore: real('confidence_score').notNull().default(0.5),
  rawWineName: text('raw_wine_name').notNull(),
  rawProducerName: text('raw_producer_name'),
  rawVintage: integer('raw_vintage'),
  capturedAt: text('captured_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const venueWineLists = sqliteTable('venue_wine_lists', {
  id: text('id').primaryKey(),
  sourceId: text('source_id')
    .notNull()
    .references(() => sourceRegistry.id),
  wineCanonicalId: text('wine_canonical_id').references(() => wineCanonical.id),
  venueName: text('venue_name').notNull(),
  city: text('city').notNull(),
  neighborhood: text('neighborhood'),
  servingFormat: text('serving_format').notNull(), // glass | bottle
  currency: text('currency').notNull().default('USD'),
  price: real('price').notNull(),
  available: integer('available', { mode: 'boolean' }).notNull().default(true),
  effectiveFrom: text('effective_from'),
  effectiveTo: text('effective_to'),
  rawWineName: text('raw_wine_name').notNull(),
  rawProducerName: text('raw_producer_name'),
  rawVintage: integer('raw_vintage'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const pairingKnowledge = sqliteTable('pairing_knowledge', {
  id: text('id').primaryKey(),
  sourceId: text('source_id')
    .notNull()
    .references(() => sourceRegistry.id),
  wineCanonicalId: text('wine_canonical_id').references(() => wineCanonical.id),
  dishName: text('dish_name').notNull(),
  cuisineType: text('cuisine_type'),
  dishAttributes: text('dish_attributes', { mode: 'json' })
    .notNull()
    .$type<string[]>()
    .default(sql`'[]'`),
  rationale: text('rationale').notNull(),
  evidenceLevel: text('evidence_level').notNull().default('practitioner'),
  authorLabel: text('author_label'),
  effectiveFrom: text('effective_from'),
  effectiveTo: text('effective_to'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const dataConflicts = sqliteTable('data_conflicts', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  fieldName: text('field_name').notNull(),
  leftValue: text('left_value', { mode: 'json' })
    .notNull()
    .$type<unknown>(),
  rightValue: text('right_value', { mode: 'json' })
    .notNull()
    .$type<unknown>(),
  leftSourceId: text('left_source_id').references(() => sourceRegistry.id),
  rightSourceId: text('right_source_id').references(() => sourceRegistry.id),
  status: text('status').notNull().default('open'),
  detectedAt: text('detected_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  resolvedAt: text('resolved_at'),
  resolvedByUserId: text('resolved_by_user_id').references(() => users.id),
});

export const curationActions = sqliteTable('curation_actions', {
  id: text('id').primaryKey(),
  conflictId: text('conflict_id').references(() => dataConflicts.id),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  actionType: text('action_type').notNull(), // merge | split | override | reject
  beforeValue: text('before_value', { mode: 'json' }).$type<unknown>(),
  afterValue: text('after_value', { mode: 'json' }).$type<unknown>(),
  notes: text('notes'),
  actedByUserId: text('acted_by_user_id').references(() => users.id),
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
