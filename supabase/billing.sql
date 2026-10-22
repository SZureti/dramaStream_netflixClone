-- Stripe Billing state, one row per account. Written only by the Edge Functions
-- (service role); viewers can read their own row.

create table public.subscriptions (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id     text not null unique,
  stripe_subscription_id text unique,
  plan                   text check (plan in ('basic', 'standard', 'premium')),
  status                 text,
  cancel_at_period_end   boolean not null default false,
  current_period_end     timestamptz,
  updated_at             timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
create policy subscriptions_select_own on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);
