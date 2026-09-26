-- Phase 1 migration: moves gym data out of the static data/gyms.json file
-- and into Supabase, plus scaffolds the tables later phases will need
-- (gym_owners, admins, gym_events, claim_requests). Run this once in the
-- Supabase SQL editor, AFTER supabase/schema.sql.
--
-- Only the `gyms` and `gym_translations` tables are actually read by the app
-- right now (hooks/useGyms.ts). The rest (gym_owners, admins, gym_events,
-- claim_requests) are structure only — no UI reads/writes them yet. That's
-- intentional: they're for the claim flow / owner dashboard / admin panel /
-- analytics, which come in later phases (see README → Roadmap).

-- ─────────────────────────── Gyms (core data) ───────────────────────────

create table if not exists gyms (
  id text primary key,
  name text not null,
  sport text[] not null default '{}',
  address text not null,
  lat double precision not null,
  lng double precision not null,
  description text not null default '',
  website text not null default '',
  tags text[],
  first_training_info text,
  equipment_needed text,
  intensity_level text check (intensity_level in ('low', 'medium', 'high')),
  schedule jsonb, -- array of { "day": "Monday", "time": "18:00" }
  district smallint,
  phone text,
  email text,
  facebook text,
  instagram text,
  price_from integer,
  price_note text,
  -- true for the original fictional showcase listings; false/null for real
  -- gyms found by research or added by an owner.
  is_demo boolean not null default false,
  -- true once a real owner has verified control of this listing.
  claimed boolean not null default false,
  -- where this listing's data came from, for real (non-demo) entries.
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table gyms enable row level security;

create policy "gyms are publicly readable"
  on gyms for select
  using (true);

-- No public insert/update/delete policy yet — writes are admin/SQL-editor
-- only until the claim flow (phase 2) and owner dashboard (phase 3) exist.

-- ─────────────────────────── Gym translations ───────────────────────────
-- One row per (gym, language) for the free-text fields that get translated.
-- Mirrors data/gyms.hu.json today; designed to hold more languages later.

create table if not exists gym_translations (
  gym_id text not null references gyms (id) on delete cascade,
  lang text not null check (lang in ('hu')),
  description text,
  first_training_info text,
  equipment_needed text,
  price_note text,
  primary key (gym_id, lang)
);

alter table gym_translations enable row level security;

create policy "gym translations are publicly readable"
  on gym_translations for select
  using (true);

-- ─────────────────────────── Gym owners (phase 2/3 scaffolding) ───────────────────────────
-- Which Supabase Auth user(s) can manage which gym(s). Many-to-many on
-- purpose, so one account can hold several gyms (e.g. a club with two
-- locations). Populated by the claim-verification step (not built yet) or
-- manually by an admin — never by a public insert policy.

create table if not exists gym_owners (
  gym_id text not null references gyms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (gym_id, user_id)
);

alter table gym_owners enable row level security;

create policy "a user can see which gyms they own"
  on gym_owners for select
  using (auth.uid() = user_id);

-- ─────────────────────────── Admins (phase 4 scaffolding) ───────────────────────────
-- Site-owner-level access (full analytics, add gyms, approve claims). No
-- public policies at all — managed via the Supabase dashboard/SQL editor.

create table if not exists admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

-- ─────────────────────────── Gym events (phase 4 scaffolding) ───────────────────────────
-- Lightweight analytics: one row per profile view. Insert-only for anon (no
-- one can read raw events except an admin/service role), so this can't be
-- scraped as a public "who's popular" leaderboard.

create table if not exists gym_events (
  id bigint generated always as identity primary key,
  gym_id text not null references gyms (id) on delete cascade,
  event_type text not null check (event_type in ('view')),
  created_at timestamptz not null default now()
);

create index if not exists gym_events_gym_id_idx on gym_events (gym_id);

alter table gym_events enable row level security;

create policy "anyone can log a view event"
  on gym_events for insert
  with check (event_type = 'view');

-- ─────────────────────────── Claim requests (phase 2 scaffolding) ───────────────────────────
-- Covers the rare case: a gym with no email on file (so the automatic
-- magic-link claim can't work), or a brand-new gym not in `gyms` yet.
-- Insert-only for anon, same pattern as trial_requests — only the admin
-- reviews these, via the dashboard for now.

create table if not exists claim_requests (
  id uuid primary key default gen_random_uuid(),
  gym_id text references gyms (id) on delete cascade, -- null = brand-new gym submission
  gym_name text not null,
  requester_name text not null,
  requester_email text not null,
  requester_phone text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table claim_requests enable row level security;

create policy "anyone can submit a claim request"
  on claim_requests for insert
  with check (
    char_length(requester_name) between 1 and 80
    and char_length(requester_email) between 3 and 200
    and char_length(gym_name) between 1 and 120
  );
