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

-- Table orders. Safe to run again: it only adds what is missing.
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  day TEXT NOT NULL,                        -- YYYY-MM-DD, Gwalior time
  table_no TEXT NOT NULL,                   -- '1'..'12'
  name TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'qr',
  status TEXT NOT NULL DEFAULT 'new',       -- new | preparing | served | paid | cancelled
  total INTEGER NOT NULL,                   -- rupees
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS orders_by_day ON orders (day, status);
CREATE TABLE IF NOT EXISTS order_items (
  order_id INTEGER NOT NULL REFERENCES orders (id),
  item_id TEXT NOT NULL,
  name TEXT NOT NULL,                       -- copied so old orders keep their names and prices
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS order_items_by_order ON order_items (order_id);
CREATE TABLE IF NOT EXISTS sold_out (item_id TEXT PRIMARY KEY);
