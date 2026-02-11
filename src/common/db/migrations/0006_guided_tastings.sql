-- Guided Tastings (standalone tasting notes, no FK to plan wines)
CREATE TABLE IF NOT EXISTS guided_tastings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),

  -- Wine identity (all optional)
  wine_name TEXT,
  varietal TEXT,
  year INTEGER,

  -- Look
  wine_type TEXT NOT NULL,
  color_depth TEXT,
  clarity TEXT,
  viscosity_noted INTEGER NOT NULL DEFAULT 0,

  -- Smell
  selected_aromas TEXT NOT NULL DEFAULT '[]',

  -- Taste (0-5 scale)
  acidity REAL NOT NULL DEFAULT 3,
  tannin REAL NOT NULL DEFAULT 3,
  sweetness REAL NOT NULL DEFAULT 1,
  alcohol REAL NOT NULL DEFAULT 3,
  body REAL NOT NULL DEFAULT 3,

  -- Think
  balance INTEGER NOT NULL DEFAULT 0,
  complexity INTEGER NOT NULL DEFAULT 0,
  finish_length TEXT,
  would_drink_again INTEGER,
  notes TEXT NOT NULL DEFAULT '',

  -- Meta
  is_complete INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_guided_tastings_user ON guided_tastings(user_id);
