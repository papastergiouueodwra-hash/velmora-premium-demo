-- Run this in Neon SQL Editor for the VELMORA database.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  shipping_method TEXT NOT NULL CHECK (shipping_method IN ('standard', 'pickup')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cod')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost NUMERIC(10,2) NOT NULL CHECK (shipping_cost >= 0),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'processing', 'completed', 'cancelled')),
  is_demo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_email_idx ON orders (email);
