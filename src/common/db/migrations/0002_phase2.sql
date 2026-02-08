-- Phase 2: Auth, Tasting Journal, Corkage Directory

-- Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL UNIQUE,
  `password_hash` text NOT NULL,
  `display_name` text NOT NULL,
  `avatar_url` text,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

-- Sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `token` text NOT NULL UNIQUE,
  `expires_at` text NOT NULL,
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);

-- Add user_id to tasting_plans (nullable for backwards compat)
ALTER TABLE `tasting_plans` ADD COLUMN `user_id` text REFERENCES `users`(`id`);

-- Wine Ratings (Tasting Journal)
CREATE TABLE IF NOT EXISTS `wine_ratings` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `plan_wine_id` text NOT NULL REFERENCES `tasting_plan_wines`(`id`),
  `plan_id` text NOT NULL REFERENCES `tasting_plans`(`id`),
  `rating` integer NOT NULL,
  `tasting_notes` text,
  `tried` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

-- Corkage Directory
CREATE TABLE IF NOT EXISTS `corkage_restaurants` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `address` text NOT NULL,
  `city` text NOT NULL,
  `neighborhood` text,
  `cuisine_type` text NOT NULL,
  `corkage_fee` real,
  `corkage_notes` text,
  `phone` text,
  `website` text,
  `latitude` real,
  `longitude` real,
  `is_verified` integer NOT NULL DEFAULT 0,
  `verified_at` text,
  `submitted_by` text,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS `idx_sessions_token` ON `sessions` (`token`);
CREATE INDEX IF NOT EXISTS `idx_sessions_user_id` ON `sessions` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_tasting_plans_user_id` ON `tasting_plans` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_wine_ratings_user_id` ON `wine_ratings` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_wine_ratings_plan_id` ON `wine_ratings` (`plan_id`);
CREATE INDEX IF NOT EXISTS `idx_corkage_city` ON `corkage_restaurants` (`city`);
CREATE INDEX IF NOT EXISTS `idx_corkage_neighborhood` ON `corkage_restaurants` (`neighborhood`);
