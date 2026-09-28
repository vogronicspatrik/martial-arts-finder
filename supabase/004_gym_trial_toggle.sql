-- Gyms opt in to trial-class requests themselves (from their future
-- dashboard — phase 3, not built yet). Off by default: a listing only
-- accepts requests once its real owner has claimed it AND turned this on.
-- Run once in the Supabase SQL editor.

alter table gyms
  add column if not exists accepts_trial_requests boolean not null default false;
