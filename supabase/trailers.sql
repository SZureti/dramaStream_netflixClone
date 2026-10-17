-- Trailers: each title's official YouTube trailer (the 11-character video key).
-- The site embeds it from youtube-nocookie.com; no video is stored here.
-- Keys come from TMDB (supabase/seed/trailers-research.json). Null = no
-- official trailer, so the site hides the Trailer button.
-- titles stays read-only for the publishable key: this adds no policies.
-- Run once in the SQL Editor (safe to run again).

alter table public.titles
  add column if not exists trailer_youtube_key text
  check (trailer_youtube_key ~ '^[A-Za-z0-9_-]{11}$');

update public.titles t set trailer_youtube_key = v.key
from (values
  ('shawshank-redemption', 'PLl99DlL6b4'),
  ('whiplash', 'Q7kZy3T6vRM'),
  ('moonlight', '9NJj12tJzqc'),
  ('past-lives', 'kA244xewjcI'),
  ('succession', 'ZO-XX1UpsqY'),
  ('the-crown', 'JWtnJjn6ng0'),
  ('normal-people', 'x1JQuWxt3cE'),
  ('free-solo', 'urRVZ4SW7WU'),
  ('my-octopus-teacher', '3s0LTDhqe5A'),
  ('wont-you-be-my-neighbor', 'EAwR54HrVW8'),
  ('the-godfather', 'Ew9ngL1GZvs'),
  ('schindlers-list', 'v0RB-3sWbBA'),
  ('manchester-by-the-sea', 'obdKk_sYQNI'),
  ('marriage-story', 'BHi-a1n8t7M'),
  ('nomadland', 'BZ4o4jwSaHk'),
  ('oppenheimer', 'bK6ldnjE3Y0'),
  ('better-call-saul', 'l1xIGfVFb-U'),
  ('chernobyl', 's9APLXM9Ei8'),
  ('mare-of-easttown', 'a-RkBkz45gs'),
  ('the-queens-gambit', 'FU854_5itOk'),
  ('man-on-wire', 'YW1b3G2MN3Q'),
  ('searching-for-sugar-man', 'tDw7OqVBT-w'),
  ('jiro-dreams-of-sushi', '0VB_DrsHDQ0'),
  ('icarus', 'qXoRdSTrR-4'),
  ('american-factory', 'm36QeKOJ2Fc'),
  ('12-angry-men', 'TEN-2uTi2c0'),
  ('parasite', 'isOGD_7hNIY'),
  ('the-pianist', 'og9hFxxdSOg'),
  ('room', 'yfBdUPAjiVQ'),
  ('lady-bird', 'cNi_HC839Wo'),
  ('the-social-network', 'lB95KLmpLR4'),
  ('spotlight', 'yXymzwz0V2g'),
  ('roma', '6BS27ngZtxg'),
  ('aftersun', '4A34B1DIGl8'),
  ('boyhood', 'Y0oX0xiwOv8'),
  ('the-wire', 'uDcQbk78CSw'),
  ('six-feet-under', 'E3gYi-KvKug'),
  ('the-leftovers', 'rKtgMEKMoiU'),
  ('band-of-brothers', 'aH06LWZs-Ys'),
  ('the-americans', 'wt7NPuabEgQ'),
  ('halt-and-catch-fire', 'pWrioRji60A'),
  ('shogun', 'yAN5uspO_hk'),
  ('the-night-of', '556N5vojtp0'),
  ('amy', '_2yCIwmNuLE'),
  ('three-identical-strangers', 'uM5TQ4f7ycw'),
  ('blackfish', 'w2vG_Ifu4zg'),
  ('citizenfour', 'PX2uyP9QGjs'),
  ('i-am-not-your-negro', 'rNUYdgIyaPM'),
  ('minding-the-gap', 'n5Vm_Awe3bw'),
  ('honeyland', 'B27ORUHlp6E'),
  ('the-act-of-killing', 'cTozJLf-Px0'),
  ('anatomy-of-a-fall', '_MdTMA0PetA'),
  ('the-zone-of-interest', 'GFNtVaAuVYY'),
  ('slow-horses', 'O9ZJChzPn0U'),
  ('the-pitt', 'ufR_08V38sQ'),
  ('fire-of-love', '-_7XADmKVL0'),
  ('summer-of-soul', 'slFiJpAxZyQ')
) as v(id, key)
where t.id = v.id;
