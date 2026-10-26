-- Run once: npx wrangler d1 execute tokus-bookings --remote --file=worker/schema.sql
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date TEXT NOT NULL,              -- YYYY-MM-DD, Gwalior time
  slot TEXT NOT NULL,              -- HH:MM, 24h
  guests INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'web',      -- web | staff
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed | arrived | no_show | cancelled
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS bookings_by_slot ON bookings (date, slot, status);
CREATE INDEX IF NOT EXISTS bookings_by_phone ON bookings (phone, date);
