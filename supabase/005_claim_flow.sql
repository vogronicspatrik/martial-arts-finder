-- Phase 2: lets a real gym owner actually claim their listing.
--
-- Mechanism: the "claim" button sends a Supabase Auth magic link to the
-- EMAIL ALREADY ON FILE for that gym (not one the claimant types in) — if
-- they can click it, they control that inbox, which is proof enough at this
-- scale (same idea as Google Business Profile's email-match verification).
-- No admin approval needed for this common case.
--
-- Run once in the Supabase SQL editor, after 002_gyms_and_accounts.sql.

-- A signed-in user may update a gym's `claimed` flag (and, going forward,
-- its other fields — this doubles as the foundation for the phase-3 owner
-- dashboard) only if their authenticated email matches the gym's own email
-- on file. Case-insensitive compare, since email casing isn't meaningful.
create policy "owner can claim/edit a gym whose email matches their login"
  on gyms for update
  using (
    email is not null
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (
    email is not null
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Once claimed, record the (gym, account) link — this is what makes the
-- "several gyms under one account" case work later (see gym_owners' shape).
create policy "user can link themselves as an owner once their email matches"
  on gym_owners for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from gyms g
      where g.id = gym_id
      and g.email is not null
      and lower(g.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );
