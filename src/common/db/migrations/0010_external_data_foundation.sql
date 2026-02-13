-- External data foundation: source registry, canonical wine entities, market/venue listings, pairing knowledge, and curation

CREATE TABLE IF NOT EXISTS `source_registry` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `source_type` text NOT NULL,
  `license_type` text NOT NULL,
  `trust_tier` text NOT NULL DEFAULT 'C',
  `update_cadence` text,
  `access_notes` text,
  `is_active` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS `wine_canonical` (
  `id` text PRIMARY KEY NOT NULL,
  `producer_name` text NOT NULL,
  `wine_name` text NOT NULL,
  `vintage` integer,
  `varietal` text,
  `region` text,
  `sub_region` text,
  `country` text,
  `style_description` text,
  `acidity` real,
  `tannin` real,
  `sweetness` real,
  `alcohol` real,
  `body` real,
  `serving_temp_c_min` real,
  `serving_temp_c_max` real,
  `decant_minutes` integer,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS `wine_aliases` (
  `id` text PRIMARY KEY NOT NULL,
  `wine_canonical_id` text NOT NULL REFERENCES `wine_canonical`(`id`),
  `alias` text NOT NULL,
  `alias_type` text NOT NULL DEFAULT 'label',
  `source_id` text REFERENCES `source_registry`(`id`),
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS `partner_submissions` (
  `id` text PRIMARY KEY NOT NULL,
  `source_id` text NOT NULL REFERENCES `source_registry`(`id`),
  `submitted_by_user_id` text REFERENCES `users`(`id`),
  `submitted_by_label` text,
  `submission_type` text NOT NULL,
  `status` text NOT NULL DEFAULT 'accepted',
  `parser_version` text NOT NULL DEFAULT 'v1',
  `record_count` integer NOT NULL DEFAULT 0,
  `validation_errors` text NOT NULL DEFAULT '[]',
  `raw_payload` text NOT NULL,
  `received_at` text NOT NULL DEFAULT (datetime('now')),
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS `market_listings` (
  `id` text PRIMARY KEY NOT NULL,
  `source_id` text NOT NULL REFERENCES `source_registry`(`id`),
  `wine_canonical_id` text REFERENCES `wine_canonical`(`id`),
  `merchant_name` text NOT NULL,
  `location_text` text,
  `channel` text NOT NULL,
  `currency` text NOT NULL DEFAULT 'USD',
  `price` real NOT NULL,
  `in_stock` integer NOT NULL DEFAULT 1,
  `stock_window_start` text,
  `stock_window_end` text,
  `listing_url` text,
  `effective_from` text,
  `effective_to` text,
  `confidence_score` real NOT NULL DEFAULT 0.5,
  `raw_wine_name` text NOT NULL,
  `raw_producer_name` text,
  `raw_vintage` integer,
  `captured_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS `venue_wine_lists` (
  `id` text PRIMARY KEY NOT NULL,
  `source_id` text NOT NULL REFERENCES `source_registry`(`id`),
  `wine_canonical_id` text REFERENCES `wine_canonical`(`id`),
  `venue_name` text NOT NULL,
  `city` text NOT NULL,
  `neighborhood` text,
  `serving_format` text NOT NULL,
  `currency` text NOT NULL DEFAULT 'USD',
  `price` real NOT NULL,
  `available` integer NOT NULL DEFAULT 1,
  `effective_from` text,
  `effective_to` text,
  `raw_wine_name` text NOT NULL,
  `raw_producer_name` text,
  `raw_vintage` integer,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS `pairing_knowledge` (
  `id` text PRIMARY KEY NOT NULL,
  `source_id` text NOT NULL REFERENCES `source_registry`(`id`),
  `wine_canonical_id` text REFERENCES `wine_canonical`(`id`),
  `dish_name` text NOT NULL,
  `cuisine_type` text,
  `dish_attributes` text NOT NULL DEFAULT '[]',
  `rationale` text NOT NULL,
  `evidence_level` text NOT NULL DEFAULT 'practitioner',
  `author_label` text,
  `effective_from` text,
  `effective_to` text,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS `data_conflicts` (
  `id` text PRIMARY KEY NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text NOT NULL,
  `field_name` text NOT NULL,
  `left_value` text NOT NULL,
  `right_value` text NOT NULL,
  `left_source_id` text REFERENCES `source_registry`(`id`),
  `right_source_id` text REFERENCES `source_registry`(`id`),
  `status` text NOT NULL DEFAULT 'open',
  `detected_at` text NOT NULL DEFAULT (datetime('now')),
  `resolved_at` text,
  `resolved_by_user_id` text REFERENCES `users`(`id`)
);

CREATE TABLE IF NOT EXISTS `curation_actions` (
  `id` text PRIMARY KEY NOT NULL,
  `conflict_id` text REFERENCES `data_conflicts`(`id`),
  `entity_type` text NOT NULL,
  `entity_id` text NOT NULL,
  `action_type` text NOT NULL,
  `before_value` text,
  `after_value` text,
  `notes` text,
  `acted_by_user_id` text REFERENCES `users`(`id`),
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS `idx_source_registry_name` ON `source_registry` (`name`);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_wine_canonical_identity` ON `wine_canonical` (`producer_name`, `wine_name`, `vintage`);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_wine_aliases_unique` ON `wine_aliases` (`wine_canonical_id`, `alias`);

CREATE INDEX IF NOT EXISTS `idx_partner_submissions_source_date` ON `partner_submissions` (`source_id`, `received_at`);
CREATE INDEX IF NOT EXISTS `idx_partner_submissions_status` ON `partner_submissions` (`status`, `received_at`);

CREATE INDEX IF NOT EXISTS `idx_market_listings_wine` ON `market_listings` (`wine_canonical_id`, `captured_at`);
CREATE INDEX IF NOT EXISTS `idx_market_listings_source` ON `market_listings` (`source_id`, `captured_at`);
CREATE INDEX IF NOT EXISTS `idx_market_listings_freshness` ON `market_listings` (`effective_to`, `captured_at`);

CREATE INDEX IF NOT EXISTS `idx_venue_wine_lists_venue` ON `venue_wine_lists` (`city`, `venue_name`, `effective_to`);
CREATE INDEX IF NOT EXISTS `idx_venue_wine_lists_wine` ON `venue_wine_lists` (`wine_canonical_id`, `effective_to`);
CREATE INDEX IF NOT EXISTS `idx_venue_wine_lists_source` ON `venue_wine_lists` (`source_id`, `updated_at`);

CREATE INDEX IF NOT EXISTS `idx_pairing_knowledge_dish` ON `pairing_knowledge` (`dish_name`, `cuisine_type`);
CREATE INDEX IF NOT EXISTS `idx_pairing_knowledge_wine` ON `pairing_knowledge` (`wine_canonical_id`, `effective_to`);

CREATE INDEX IF NOT EXISTS `idx_data_conflicts_status` ON `data_conflicts` (`status`, `detected_at`);
CREATE INDEX IF NOT EXISTS `idx_data_conflicts_entity` ON `data_conflicts` (`entity_type`, `entity_id`);
CREATE INDEX IF NOT EXISTS `idx_curation_actions_entity` ON `curation_actions` (`entity_type`, `entity_id`, `created_at`);
