-- =====================================================================
-- Shuketter - database schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- =====================================================================

create type public.plan_type as enum ('free', 'pro');
create type public.job_kind as enum ('pdf', 'ocr', 'csv');
create type public.job_status as enum ('succeeded', 'failed');

-- ---------------------------------------------------------------------
-- profiles: one row per auth user
-- ---------------------------------------------------------------------
create table public.profiles (
  id                     uuid primary key references auth.users on delete cascade,
  email                  text,
  plan                   public.plan_type not null default 'free',
  stripe_customer_id     text unique,
  stripe_subscription_id text,
  subscription_status    text,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id);

alter table public.profiles enable row level security;

create policy "profiles are readable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

-- Writes happen through the service role only (Stripe webhook, server code).

-- ---------------------------------------------------------------------
-- usage_logs: one row per processing job
-- Never store file contents here - only metadata shown in the history UI.
-- ---------------------------------------------------------------------
create table public.usage_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  kind       public.job_kind not null,
  file_name  text not null,
  file_size  integer not null default 0,
  status     public.job_status not null default 'succeeded',
  summary    text,
  created_at timestamptz not null default now()
);

create index usage_logs_user_created_idx
  on public.usage_logs (user_id, created_at desc);

create index usage_logs_user_status_created_idx
  on public.usage_logs (user_id, status, created_at desc);

alter table public.usage_logs enable row level security;

create policy "usage logs are readable by their owner"
  on public.usage_logs for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- keep updated_at fresh
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- create a profile automatically for every new auth user
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
