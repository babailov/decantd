-- Tiered access system: subscription tiers, plan caching, generation logging

ALTER TABLE users ADD COLUMN subscription_tier text NOT NULL DEFAULT 'free';

CREATE TABLE cached_plans (
  id text PRIMARY KEY NOT NULL,
  input_hash text NOT NULL UNIQUE,
  occasion text NOT NULL,
  food_pairing text NOT NULL,
  region_preferences text NOT NULL DEFAULT '[]',
  budget_min real NOT NULL,
  budget_max real NOT NULL,
  wine_count integer NOT NULL,
  plan_id text NOT NULL REFERENCES tasting_plans(id),
  expires_at text,
  created_at text NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_cached_plans_hash ON cached_plans(input_hash);

CREATE TABLE generation_logs (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL REFERENCES users(id),
  input_hash text NOT NULL,
  plan_id text REFERENCES tasting_plans(id),
  was_cache_hit integer NOT NULL DEFAULT 0,
  created_at text NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_gen_logs_user_date ON generation_logs(user_id, created_at);
