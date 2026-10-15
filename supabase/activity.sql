-- Anonymous daily counts per title, for the Top 10 and Trending Now rows
-- (applied as migration create_title_activity). Filled by triggers on
-- viewing_progress (a first play) and my_list (an add). No user or profile ids
-- are stored, so it is public read-only.
create table public.title_activity (
  title_id  text not null references public.titles (id) on delete cascade,
  day       date not null default current_date,
  plays     integer not null default 0 check (plays >= 0),
  adds      integer not null default 0 check (adds >= 0),
  primary key (title_id, day)
);
create index title_activity_day_idx on public.title_activity (day);

alter table public.title_activity enable row level security;
create policy title_activity_read on public.title_activity for select to anon, authenticated using (true);
grant select on public.title_activity to anon, authenticated;

-- Trigger functions run as their owner so viewers can't write counts directly.
create function public.count_title_play() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.title_activity (title_id, plays) values (new.title_id, 1)
  on conflict (title_id, day) do update set plays = public.title_activity.plays + 1;
  return new;
end;
$$;

create function public.count_title_add() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.title_activity (title_id, adds) values (new.title_id, 1)
  on conflict (title_id, day) do update set adds = public.title_activity.adds + 1;
  return new;
end;
$$;

revoke execute on function public.count_title_play() from public, anon, authenticated;
revoke execute on function public.count_title_add() from public, anon, authenticated;

create trigger viewing_progress_count_play after insert on public.viewing_progress
  for each row execute function public.count_title_play();
create trigger my_list_count_add after insert on public.my_list
  for each row execute function public.count_title_add();
