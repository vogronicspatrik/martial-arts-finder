-- One-off fix: the first seed_gyms.sql run left district = null on the 7 real
-- gyms (scripts/real-gyms.js didn't set it yet at that point). Run this once
-- in the Supabase SQL editor. Safe to re-run — it's just a plain UPDATE, not
-- an insert, so there's no conflict to worry about.

update gyms set district = 13 where id = 'r1'; -- Budapesti Honvéd SE
update gyms set district = 17 where id = 'r2'; -- Rákosmenti Karate SE
update gyms set district = 14 where id = 'r3'; -- Gastroyal Karate SE
update gyms set district = 18 where id = 'r4'; -- Tűzmadár Sportegyesület
update gyms set district = 13 where id = 'r5'; -- OSU Kyokushin Karate
update gyms set district = 11 where id = 'r6'; -- Budai XI Karate SE
update gyms set district = 20 where id = 'r7'; -- Seishin Sportegyesület
