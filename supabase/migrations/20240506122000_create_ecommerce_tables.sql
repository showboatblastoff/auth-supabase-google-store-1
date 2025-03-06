-- Migration: Create e-commerce tables
-- Description: Sets up the basic schema for an e-commerce platform
-- Tables: products, categories, orders, order_items

-- Create categories table
create table public.categories (
  id uuid not null default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint categories_pkey primary key (id)
);

-- Enable Row Level Security
alter table public.categories enable row level security;

-- Create RLS policies for categories
-- Policy for anonymous users to view categories
create policy "Allow anonymous users to view categories"
  on public.categories
  for select
  to anon
  using (true);

-- Policy for authenticated users to view categories
create policy "Allow authenticated users to view categories"
  on public.categories
  for select
  to authenticated
  using (true);

-- Policy for authenticated users to insert categories (admin functionality to be added later)
create policy "Allow authenticated users to insert categories"
  on public.categories
  for insert
  to authenticated
  with check (true);

-- Policy for authenticated users to update categories (admin functionality to be added later)
create policy "Allow authenticated users to update categories"
  on public.categories
  for update
  to authenticated
  using (true);

-- Create products table
create table public.products (
  id uuid not null default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price decimal(10,2) not null,
  image_url text,
  inventory_count integer not null default 0,
  category_id uuid references public.categories(id),
  is_featured boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint products_pkey primary key (id)
);

-- Enable Row Level Security
alter table public.products enable row level security;

-- Create RLS policies for products
-- Policy for anonymous users to view products
create policy "Allow anonymous users to view products"
  on public.products
  for select
  to anon
  using (true);

-- Policy for authenticated users to view products
create policy "Allow authenticated users to view products"
  on public.products
  for select
  to authenticated
  using (true);

-- Policy for authenticated users to insert products (admin functionality to be added later)
create policy "Allow authenticated users to insert products"
  on public.products
  for insert
  to authenticated
  with check (true);

-- Policy for authenticated users to update products (admin functionality to be added later)
create policy "Allow authenticated users to update products"
  on public.products
  for update
  to authenticated
  using (true);

-- Create orders table
create table public.orders (
  id uuid not null default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  status text not null check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10,2) not null,
  shipping_address json,
  billing_address json,
  payment_intent_id text,
  payment_status text check (payment_status in ('pending', 'paid', 'failed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint orders_pkey primary key (id)
);

-- Enable Row Level Security
alter table public.orders enable row level security;

-- Create RLS policies for orders
-- Policy for authenticated users to view their own orders
create policy "Allow users to view their own orders"
  on public.orders
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Policy for authenticated users to create their own orders
create policy "Allow users to create their own orders"
  on public.orders
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own orders
create policy "Allow users to update their own orders"
  on public.orders
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Create order_items table
create table public.order_items (
  id uuid not null default gen_random_uuid(),
  order_id uuid references public.orders(id) not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null,
  price_at_purchase decimal(10,2) not null,
  created_at timestamp with time zone default now(),
  constraint order_items_pkey primary key (id)
);

-- Enable Row Level Security
alter table public.order_items enable row level security;

-- Create RLS policies for order_items
-- Policy for authenticated users to view their own order items
create policy "Allow users to view their own order items"
  on public.order_items
  for select
  to authenticated
  using (
    order_id in (
      select id from public.orders where user_id = auth.uid()
    )
  );

-- Policy for authenticated users to insert their own order items
create policy "Allow users to insert their own order items"
  on public.order_items
  for insert
  to authenticated
  with check (
    order_id in (
      select id from public.orders where user_id = auth.uid()
    )
  );

-- Create cart table for shopping cart functionality
create table public.cart_items (
  id uuid not null default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint cart_items_pkey primary key (id),
  constraint cart_items_user_product_unique unique (user_id, product_id)
);

-- Enable Row Level Security
alter table public.cart_items enable row level security;

-- Create RLS policies for cart_items
-- Policy for authenticated users to view their own cart items
create policy "Allow users to view their own cart items"
  on public.cart_items
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own cart items
create policy "Allow users to insert their own cart items"
  on public.cart_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own cart items
create policy "Allow users to update their own cart items"
  on public.cart_items
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Policy for authenticated users to delete their own cart items
create policy "Allow users to delete their own cart items"
  on public.cart_items
  for delete
  to authenticated
  using (auth.uid() = user_id); 