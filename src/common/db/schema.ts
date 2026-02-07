import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tastingPlans = sqliteTable('tasting_plans', {
  id: text('id').primaryKey(),
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
