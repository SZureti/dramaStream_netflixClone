-- Phase-3 additions (applied as migration phase3_profiles_reminders_availability).

-- Per-profile extras: an optional 4-digit PIN (stored as a SHA-256 hash; a
-- household lock, not real security) and subtitle appearance.
alter table public.profiles
  add column pin_hash text check (pin_hash is null or pin_hash ~ '^[0-9a-f]{64}$'),
  add column subtitle_size text not null default 'medium' check (subtitle_size in ('small', 'medium', 'large')),
  add column subtitle_style text not null default 'white' check (subtitle_style in ('white', 'yellow', 'boxed'));

-- Coming Soon: a title with a future available_from is listed in New & Popular
-- but not playable or shown in rows until that date. Null = available now.
alter table public.titles add column available_from date;
create index titles_available_from_idx on public.titles (available_from) where available_from is not null;

-- Remind Me on a Coming Soon title, per profile.
create table public.reminders (
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  title_id    text not null references public.titles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (profile_id, title_id)
);
create index reminders_title_id_idx on public.reminders (title_id);

alter table public.reminders enable row level security;
create policy reminders_own on public.reminders for all to authenticated
  using ((select public.owns_profile(profile_id))) with check ((select public.owns_profile(profile_id)));
revoke all on public.reminders from anon;
grant select, insert, delete on public.reminders to authenticated;
