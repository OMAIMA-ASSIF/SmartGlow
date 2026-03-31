-- ============================================================
-- SmartGlow Database Schema for Supabase
-- Run this in the Supabase SQL editor
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text,
  birth_date date,           -- date de naissance (remplace age calculé)
  age integer,               -- âge (calculé côté app, conservé pour compatibilité)
  skin_type text check (skin_type in ('dry', 'oily', 'combination', 'normal', 'sensitive')),
  skin_concerns text[] default '{}',
  avatar_url text,
  whatsapp_number text,
  whatsapp_active boolean default false,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SCANS (selfie analysis history)
-- ============================================================
create table if not exists public.scans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  image_url text,
  gemini_analysis jsonb default '{}',
  mistral_synthesis text,
  audio_url text,
  pore_score integer,
  inflammation_score integer,
  hydration_score integer,
  overall_score integer,
  created_at timestamptz default now()
);

-- ============================================================
-- ROUTINES (user's morning & evening routines)
-- ============================================================
create table if not exists public.routines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  morning_products jsonb default '[]',
  evening_products jsonb default '[]',
  active_ingredients text[] default '{}',
  updated_at timestamptz default now()
);

-- ============================================================
-- PRODUCTS (scanned products)
-- ============================================================
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  brand text,
  barcode text,
  inci_list text,
  safety_score integer,
  flagged_ingredients jsonb default '[]',
  safe_alternatives jsonb default '[]',
  mistral_analysis jsonb default '{}',
  is_in_routine boolean default false,
  added_at timestamptz default now()
);

-- ============================================================
-- CLIMATE LOGS (routine adjustments based on weather)
-- ============================================================
create table if not exists public.climate_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  latitude numeric(10, 6),
  longitude numeric(10, 6),
  city text,
  uv_index numeric(4, 2),
  pm25 numeric(7, 2),
  humidity integer,
  temperature numeric(5, 2),
  weather_description text,
  routine_adjustments jsonb default '[]',
  logged_at timestamptz default now()
);

-- ============================================================
-- PROGRESS REPORTS
-- ============================================================
create table if not exists public.progress_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  start_scan_id uuid references public.scans(id),
  end_scan_id uuid references public.scans(id),
  pore_improvement integer,
  inflammation_improvement integer,
  hydration_improvement integer,
  overall_improvement integer,
  gemini_comparison text,
  motivational_message text,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.scans enable row level security;
alter table public.routines enable row level security;
alter table public.products enable row level security;
alter table public.climate_logs enable row level security;
alter table public.progress_reports enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);

-- Scans policies
create policy "Users can view own scans" on public.scans for select using (auth.uid() = user_id);
create policy "Users can insert own scans" on public.scans for insert with check (auth.uid() = user_id);

-- Routines policies
create policy "Users can view own routine" on public.routines for select using (auth.uid() = user_id);
create policy "Users can upsert own routine" on public.routines for all using (auth.uid() = user_id);

-- Products policies
create policy "Users can view own products" on public.products for select using (auth.uid() = user_id);
create policy "Users can manage own products" on public.products for all using (auth.uid() = user_id);

-- Climate logs policies
create policy "Users can view own climate logs" on public.climate_logs for select using (auth.uid() = user_id);
create policy "Users can insert own climate logs" on public.climate_logs for insert with check (auth.uid() = user_id);

-- Progress reports policies
create policy "Users can view own reports" on public.progress_reports for select using (auth.uid() = user_id);
create policy "Users can insert own reports" on public.progress_reports for insert with check (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name, avatar_url, birth_date)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    (new.raw_user_meta_data->>'birth_date')::date
  );
  
  insert into public.routines (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Storage Buckets (run via Supabase dashboard or here)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('scan-images', 'scan-images', false);
-- insert into storage.buckets (id, name, public) values ('audio-diagnostics', 'audio-diagnostics', false);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
