-- Libreta Database Schema & Row-Level Security (RLS)
-- Supabase PostgreSQL

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles / Users (synced with auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  phone text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Businesses
create table if not exists public.businesses (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  business_type text,
  currency text default 'NGN' not null,
  mode text default 'full' check (mode in ('full', 'debt_only')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Customers
create table if not exists public.customers (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  phone text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Products (P1 Scaffold)
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  selling_price numeric(12, 2) not null default 0.00,
  cost_price numeric(12, 2) default 0.00,
  quantity numeric(10, 2) default 0.00,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Sales
create table if not exists public.sales (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete set null,
  total_amount numeric(12, 2) not null,
  amount_paid numeric(12, 2) not null default 0.00,
  status text not null check (status in ('paid', 'part_paid', 'unpaid')),
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Sale Items
create table if not exists public.sale_items (
  id uuid default uuid_generate_v4() primary key,
  sale_id uuid references public.sales(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  quantity numeric(10, 2) not null default 1.00,
  unit_price numeric(12, 2) not null,
  cost_price_snapshot numeric(12, 2) default 0.00,
  total numeric(12, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Payments
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete cascade not null,
  sale_id uuid references public.sales(id) on delete set null,
  amount numeric(12, 2) not null,
  method text not null check (method in ('cash', 'transfer', 'pos', 'other')),
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Expenses
create table if not exists public.expenses (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  category text not null,
  spend_type text not null check (spend_type in ('stock', 'running_cost')),
  amount numeric(12, 2) not null,
  method text not null check (method in ('cash', 'transfer', 'pos', 'other')),
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_businesses_owner on public.businesses(owner_id);
create index if not exists idx_customers_business on public.customers(business_id);
create index if not exists idx_sales_business_date on public.sales(business_id, date desc);
create index if not exists idx_sales_customer on public.sales(customer_id);
create index if not exists idx_payments_business on public.payments(business_id);
create index if not exists idx_payments_customer on public.payments(customer_id);
create index if not exists idx_expenses_business_date on public.expenses(business_id, date desc);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;

-- Profiles: Users can view and update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Helper function: verify business ownership
create or replace function public.user_owns_business(target_business_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.businesses
    where id = target_business_id and owner_id = auth.uid()
  );
$$;

-- Businesses: Owners can manage their businesses
create policy "Owners manage businesses" on public.businesses
  for all using (owner_id = auth.uid());

-- Customers: Accessible only by the business owner
create policy "Business owners manage customers" on public.customers
  for all using (public.user_owns_business(business_id));

-- Products: Accessible only by the business owner
create policy "Business owners manage products" on public.products
  for all using (public.user_owns_business(business_id));

-- Sales: Accessible only by the business owner
create policy "Business owners manage sales" on public.sales
  for all using (public.user_owns_business(business_id));

-- Sale items: Accessible only through sale's business
create policy "Business owners manage sale items" on public.sale_items
  for all using (
    exists (
      select 1 from public.sales s
      where s.id = sale_items.sale_id and public.user_owns_business(s.business_id)
    )
  );

-- Payments: Accessible only by the business owner
create policy "Business owners manage payments" on public.payments
  for all using (public.user_owns_business(business_id));

-- Expenses: Accessible only by the business owner
create policy "Business owners manage expenses" on public.expenses
  for all using (public.user_owns_business(business_id));
