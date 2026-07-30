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

-- Self-service customer orders (no login needed for customers)
CREATE TABLE IF NOT EXISTS self_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  table_number INTEGER,
  customer_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS self_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  self_order_id UUID NOT NULL REFERENCES self_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_self_orders_shop ON self_orders(shop_user_id);
CREATE INDEX IF NOT EXISTS idx_self_orders_status ON self_orders(shop_user_id, status);

-- Migration if tables already exist:
-- (run the CREATE TABLE blocks above in Supabase SQL Editor)

-- Storage buckets (Supabase Dashboard → Storage → New bucket)
-- 1. Name: avatars  → Public bucket: ON
-- 2. Name: items    → Public bucket: ON

-- Storage policies (run in SQL Editor if needed):
-- CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Public read items" ON storage.objects FOR SELECT USING (bucket_id = 'items');
