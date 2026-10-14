-- VELMORA demo orders schema
-- Run this in Supabase SQL Editor for the VELMORA project.
create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_first_name text not null,
  customer_last_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  postal_code text not null,
  shipping_method text not null check (shipping_method in ('standard','pickup')),
  payment_method text not null check (payment_method in ('card','cod')),
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  shipping_cost numeric(10,2) not null check (shipping_cost >= 0),
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'new' check (status in ('new','processing','completed','cancelled')),
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_email_idx on public.orders (email);
alter table public.orders enable row level security;

-- All reads/writes go through Vercel serverless functions using a server-only secret.
-- Do not create public/anon policies for this table.
revoke all on table public.orders from anon, authenticated;
grant all on table public.orders to service_role;
