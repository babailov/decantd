CREATE TABLE IF NOT EXISTS `tasting_plans` (
  `id` text PRIMARY KEY NOT NULL,
  `occasion` text NOT NULL,
  `food_pairing` text NOT NULL,
  `region_preferences` text NOT NULL DEFAULT '[]',
  `budget_min` real NOT NULL,
  `budget_max` real NOT NULL,
  `budget_currency` text NOT NULL DEFAULT 'USD',
  `wine_count` integer NOT NULL,
  `generated_plan` text NOT NULL,
  `title` text NOT NULL,
  `description` text NOT NULL,
  `is_public` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS `tasting_plan_wines` (
  `id` text PRIMARY KEY NOT NULL,
  `plan_id` text NOT NULL REFERENCES `tasting_plans`(`id`),
  `varietal` text NOT NULL,
  `region` text NOT NULL,
  `sub_region` text,
  `year_range` text,
  `acidity` real NOT NULL,
  `tannin` real NOT NULL,
  `sweetness` real NOT NULL,
  `alcohol` real NOT NULL,
  `body` real NOT NULL,
  `description` text NOT NULL,
  `pairing_rationale` text NOT NULL,
  `flavor_notes` text NOT NULL DEFAULT '[]',
  `tasting_order` integer NOT NULL,
  `estimated_price_min` real NOT NULL,
  `estimated_price_max` real NOT NULL,
  `wine_type` text NOT NULL,
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);
