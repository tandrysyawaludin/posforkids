-- POS for Kids - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Users table (kids just enter their name)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If you already created the table with password_hash, run this:
-- ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- Menu items
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, code)
);

-- Sales orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  table_number INTEGER,
  table_status TEXT CHECK (table_status IN ('eating', 'done')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'credit')),
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If orders table already exists, run this:
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_status TEXT CHECK (table_status IN ('eating', 'done'));

-- Order line items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_code ON items(user_id, code);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Storage buckets (Supabase Dashboard → Storage → New bucket)
-- 1. Name: avatars  → Public bucket: ON
-- 2. Name: items    → Public bucket: ON
