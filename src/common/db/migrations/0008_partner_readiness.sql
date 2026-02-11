-- Partner-readiness: analytics + saved venues + offer metadata

CREATE TABLE IF NOT EXISTS `analytics_events` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text REFERENCES `users`(`id`),
  `session_id` text NOT NULL,
  `event_name` text NOT NULL,
  `properties_json` text NOT NULL DEFAULT '{}',
  `path` text,
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS `idx_analytics_event_name_date` ON `analytics_events` (`event_name`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_analytics_user_date` ON `analytics_events` (`user_id`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_analytics_path_date` ON `analytics_events` (`path`, `created_at`);

CREATE TABLE IF NOT EXISTS `saved_venues` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `restaurant_id` text NOT NULL REFERENCES `corkage_restaurants`(`id`),
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS `idx_saved_venues_user_restaurant` ON `saved_venues` (`user_id`, `restaurant_id`);
CREATE INDEX IF NOT EXISTS `idx_saved_venues_user` ON `saved_venues` (`user_id`, `created_at`);

ALTER TABLE `corkage_restaurants` ADD COLUMN `offer_title` text;
ALTER TABLE `corkage_restaurants` ADD COLUMN `offer_description` text;
ALTER TABLE `corkage_restaurants` ADD COLUMN `offer_code` text;
ALTER TABLE `corkage_restaurants` ADD COLUMN `offer_expires_at` text;

-- Seed a few launch offers for partner-readiness demos
UPDATE `corkage_restaurants`
SET
  `offer_title` = 'Weeknight BYOB Special',
  `offer_description` = 'Reduced corkage Monday to Wednesday with code DECANTD',
  `offer_code` = 'DECANTD',
  `offer_expires_at` = '2026-06-30'
WHERE `id` IN ('cr-003', 'cr-009', 'cr-015');
