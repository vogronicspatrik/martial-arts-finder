-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query)
-- to set up the two tables the app needs: reviews and trial_requests.

-- ─────────────────────────── Reviews ───────────────────────────
-- Public: readable by everyone, insertable by everyone (this is a
-- friends-test app with no auth — accept that anyone can post a review,
-- same trust level as a Google review without sign-in).

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  gym_id text not null,
  author_name text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists reviews_gym_id_idx on reviews (gym_id);

alter table reviews enable row level security;

create policy "reviews are publicly readable"
  on reviews for select
  using (true);

create policy "anyone can submit a review"
  on reviews for insert
  with check (
    char_length(author_name) between 1 and 60
    and char_length(coalesce(comment, '')) <= 1000
    and rating between 1 and 5
  );

-- ─────────────────────────── Trial requests (leads) ───────────────────────────
-- Public: insert-only. No select policy for the anon key on purpose — these
-- contain phone/email, so only the project owner (Supabase dashboard, or the
-- service-role key) can read them. View them under Table Editor → trial_requests.

create table if not exists trial_requests (
  id uuid primary key default gen_random_uuid(),
  gym_id text not null,
  gym_name text not null,
  name text not null,
  phone text,
  email text,
  preferred_day text,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists trial_requests_gym_id_idx on trial_requests (gym_id);

alter table trial_requests enable row level security;

create policy "anyone can submit a trial request"
  on trial_requests for insert
  with check (
    char_length(name) between 1 and 80
    and (phone is null or char_length(phone) <= 30)
    and (email is null or char_length(email) <= 200)
    and char_length(coalesce(message, '')) <= 500
  );
