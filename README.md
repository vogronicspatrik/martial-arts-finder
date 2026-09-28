# Martial Arts Finder

A minimal web application to discover martial arts gyms in Budapest. Browse gyms on an interactive map, filter by sport type, and click for details.

## Features

- **Interactive map** centered on Budapest with markers for all gyms
- **Multi-select sport filter** (Karate, BJJ, Boxing, Muay Thai, MMA)
- **Tag filters** (beginner-friendly, women-friendly, kids-classes, competition-team, etc.)
- **District filter** — filter by Budapest kerület (I–XXIII)
- **Time-of-day filter** — morning / afternoon / evening classes, plus "today only"
- **Free-text search** across gym name, address, description and tags (accent-insensitive)
- **"Near me"** — geolocates you, pans the map, and sorts the gym list by distance
- **Scrollable gym list** synchronized with the map, showing price and distance
- **Marker popups & detail card** with sports, address, price, description, contact links
  (phone, email, Facebook, Instagram) and website link
- **Bookmarks** ("saved gyms") stored in `localStorage`, with a "saved only" filter
- **"Find my style" quiz** that recommends sport types based on a short questionnaire
- **Separate mobile layout** (full-screen map + bottom sheet) and desktop layout
  (sidebar + filter bar), auto-switching by viewport width
- **English / Hungarian language toggle** (🌐 button, top-right on desktop,
  top-left FAB on mobile) — translates all UI chrome, filters, and gym
  content (description, first-training info, equipment, price note);
  preference is remembered in `localStorage`
- **Reviews** — star rating + comment per gym, visible to every visitor
  (Supabase-backed; see [Setting up Supabase](#setting-up-supabase-reviews--trial-requests) below)
- **"Request a trial class"** — a lightweight lead-capture form (name +
  phone/email + preferred day) that gets stored for the site owner to
  follow up on; this is what you'd hand to a gym as proof the listing
  drives real interest. Only shows once a gym is both claimed and has
  opted in (see below) — off by default.
- **"Is this your gym? Claim it"** — a visitor can flag that they run a
  listing. This never emails the gym directly — it only records the request
  (`claim_requests` table) for the site owner to review. The actual
  verification email (a Supabase Auth magic link to the email on file, which
  the owner clicks to prove control and link their account) only goes out
  when the site owner deliberately runs `node scripts/invite-gym.js <gymId>`
  for that specific listing — no visitor click can trigger it, which is what
  keeps this safe once there are dozens of unclaimed real gyms.

## Tech Stack

- [Next.js 14](https://nextjs.org/) (React, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) via `@react-google-maps/api`
- Static JSON data for gyms (no backend for the core listings)
- [Supabase](https://supabase.com/) (Postgres) for the two pieces of data
  that must be shared across every visitor: reviews and trial-class requests

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd martial-arts-finder
npm install
```

### 2. Set up the Google Maps API key

Create a `.env.local` file at the project root:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and replace the placeholder with your actual key:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**How to get a Google Maps API key:**

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Enable the **Maps JavaScript API**.
4. Go to **APIs & Services → Credentials** and create an **API Key**.
5. (Optional but recommended) Restrict the key to your domain.

### 3. Set up Supabase (reviews & trial requests)

Optional but recommended — without it, the app still runs fine, but the
review/request modals just show a "not set up yet" message instead of crashing.

1. Create a free project at [supabase.com](https://supabase.com/) (no credit card needed).
2. In the dashboard, go to **SQL Editor → New query** and run these **three
   files, in order** (paste each one's contents, run, then move to the next):
   1. [`supabase/schema.sql`](supabase/schema.sql) — `reviews` and
      `trial_requests` (reviews are publicly readable; trial requests are
      insert-only — nobody but you can read the phone numbers/emails people submit).
   2. [`supabase/002_gyms_and_accounts.sql`](supabase/002_gyms_and_accounts.sql) —
      the `gyms` table (gym data now lives here, not just in `data/gyms.json`),
      plus `gym_translations`, and scaffolding for later phases
      (`gym_owners`, `admins`, `gym_events`, `claim_requests` — no UI uses
      those yet).
   3. [`supabase/seed_gyms.sql`](supabase/seed_gyms.sql) — inserts the 27 demo
      gyms plus 7 real, researched Budapest karate clubs (see the README
      "Real gym data" section below). Regenerate this file with
      `node scripts/generate-seed-sql.js` if `data/gyms.json` changes.
   4. [`supabase/003_fix_real_gym_districts.sql`](supabase/003_fix_real_gym_districts.sql) —
      one-off fix for a bug in the first seed run (district was left null on
      the 7 real gyms). Not needed for a fresh setup done after this was fixed.
   5. [`supabase/004_gym_trial_toggle.sql`](supabase/004_gym_trial_toggle.sql) —
      adds `accepts_trial_requests` (default `false`) to `gyms`.
   6. [`supabase/005_claim_flow.sql`](supabase/005_claim_flow.sql) — RLS
      policies that let a gym owner claim (and later edit) their own listing.
3. Go to **Project Settings → API**, copy the **Project URL** and the
   **anon public** key, and add them to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

4. To view submitted trial-class requests, go to **Table Editor → trial_requests**
   in the Supabase dashboard — that's your lead list. Same for `claim_requests` —
   that's where "Is this your gym?" submissions land.
5. **For `node scripts/invite-gym.js` (the actual claim-invite email) to work**,
   go to **Authentication → URL Configuration** in the Supabase dashboard and
   add your site's `/claim` URL to **Redirect URLs** — e.g.
   `https://your-app.vercel.app/claim` (and `http://localhost:3000/claim` for
   local testing). Without this, Supabase rejects the magic-link redirect.

> Without step 2, the app still works — it silently falls back to the
> static `data/gyms.json` (27 demo gyms only, no real ones) so local dev
> never breaks. Once the `gyms` table has rows, the live app prefers those.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── components/
│   ├── Filters.tsx           # Desktop filter bar (sport, tags, district, time, search, near me)
│   ├── MobileFilterSheet.tsx # Mobile filter bottom sheet (same filters, apply-on-confirm)
│   ├── DistrictFilter.tsx    # Reusable district multi-select dropdown
│   ├── TimeOfDayFilter.tsx   # Reusable morning/afternoon/evening control
│   ├── SearchBar.tsx         # Reusable text search input
│   ├── GymList.tsx           # Scrollable list (price, distance, expandable details)
│   ├── GymDetailCard.tsx     # Mobile full gym detail sheet (price, contact, schedule)
│   ├── BottomSheet.tsx       # Draggable mobile bottom sheet container
│   ├── Map.tsx                # Google Map with markers, InfoWindow & near-me button
│   ├── Quiz.tsx               # "Find my style" recommendation quiz
│   ├── IntensityLegend.tsx    # low/medium/high color-key shown near the filters
│   ├── ReviewStars.tsx        # Star rating, read-only or interactive input
│   ├── ReviewBadge.tsx        # Compact "★ 4.5 (12)" button that opens the reviews modal
│   ├── ReviewsModal.tsx       # Review list + write-a-review form (Supabase-backed)
│   ├── TrialRequestModal.tsx  # "Request a trial class" lead-capture form (Supabase-backed)
│   └── ClaimGymModal.tsx      # "Is this your gym?" — records interest in
│                              #   claim_requests; never emails the gym itself
├── data/
│   ├── gyms.json              # Original static gym dataset (27 demo gyms), English canonical —
│   │                          #   now used as (a) the source for generating the Supabase seed
│   │                          #   and (b) a fallback when Supabase isn't configured
│   └── gyms.hu.json           # Hungarian overlay: description/firstTrainingInfo/
│                              #   equipmentNeeded/priceNote per gym id, merged in when
│                              #   the Hungarian UI is active
├── hooks/
│   ├── useBookmarks.ts        # Saved-gyms state, persisted to localStorage
│   ├── useIsMobile.ts         # Viewport-based mobile/desktop switch
│   ├── useUserLocation.ts     # Single geolocation entry point ("near me")
│   ├── useReviews.ts          # Loads all reviews once, per-gym aggregates, submit
│   ├── useTrialRequest.ts     # Submits a trial-class request lead
│   ├── useGyms.ts             # Gym data: Supabase when configured, static JSON fallback
│   ├── useAuth.ts             # Tracks the current Supabase Auth session
│   ├── useClaimGym.ts         # completeClaim() — used by pages/claim.tsx only;
│   │                          #   the actual invite send lives in scripts/invite-gym.js
│   └── useClaimRequest.ts     # Public "Is this your gym?" — records interest only
├── lib/
│   ├── utils.ts                # Distance, search-matching, price/district formatting, maskEmail
│   ├── i18n.tsx                # EN/HU dictionary, LanguageProvider/useLanguage context
│   └── supabase.ts             # Supabase client (null if env vars aren't set)
├── supabase/
│   ├── schema.sql                     # reviews, trial_requests — run 1st
│   ├── 002_gyms_and_accounts.sql      # gyms, gym_translations + phase 2-4 scaffolding — run 2nd
│   ├── seed_gyms.sql                  # generated data (27 demo + 7 real gyms) — run 3rd
│   ├── 003_fix_real_gym_districts.sql # one-off fix — run 4th
│   ├── 004_gym_trial_toggle.sql       # gyms.accepts_trial_requests — run 5th
│   └── 005_claim_flow.sql             # claim-flow RLS policies — run 6th
├── scripts/
│   ├── enrich-gyms.js         # One-off script that added district/contact/price fields
│   ├── real-gyms.js           # Verified-facts-only data for real, researched gyms
│   ├── generate-seed-sql.js   # (Re)generates supabase/seed_gyms.sql from the data files
│   └── invite-gym.js          # Admin-only: node scripts/invite-gym.js <gymId>
│                              #   sends the real claim-verification email — nothing else does
├── pages/
│   ├── _app.tsx
│   ├── index.tsx              # Main page — layout, filtering & state
│   └── claim.tsx              # Magic-link landing page — completes the claim, then back to "/"
├── styles/
│   └── globals.css
├── types/
│   └── gym.ts                 # Gym interface, sport/tag/district constants
├── .env.local.example
└── README.md
```

## Roadmap — once real gyms are onboarded

The live site now shows only real gyms (`is_demo = false` — see "Real gym data"
below); the 27 fictional showcase gyms with synthetic prices/contact info are
excluded from the live query and only appear in the local static fallback
(`data/gyms.json`, used when Supabase isn't configured).

**Phase 2 (claim flow) is built, deliberately split in two:**

1. **Public side — safe at any scale.** "Is this your gym? Claim it" only
   ever writes a row to `claim_requests`. It never emails anyone. This is
   what makes it fine to have dozens/hundreds of unclaimed real gyms live —
   no visitor click can ever cause an email to go out to a real business
   that has no idea this site exists.
2. **Owner-triggered invite — only the site owner can fire this.** Once
   you've decided a specific gym is ready (after outreach, or after
   reviewing a `claim_requests` row you trust), run
   `node scripts/invite-gym.js <gymId>`. *That's* what sends the actual
   Supabase Auth magic link to the email on file. The owner clicking it
   lands on `/claim`, which marks the gym `claimed` and links their account
   via `gym_owners`.

(An earlier version of this let any visitor trigger the magic-link email
directly — that doesn't scale safely once there are many unclaimed listings,
so it was split like this instead.)

**"Request a trial class" only shows once a gym is both `claimed` and has
`accepts_trial_requests = true`** — an opt-in the gym flips themselves, but
only once their **dashboard exists (phase 3, not built yet)**; until then the
only way to flip it is directly in Supabase Table Editor → gyms. Submissions
from gyms that *have* opted in only land in the `trial_requests` Supabase
table — they are **not emailed to the gym**, because there's no email-sending
step yet.

Next up:

1. **Email the gym when a trial request comes in.** Add an email-sending service
   (e.g. [Resend](https://resend.com/) — has a free tier) and call it from
   `hooks/useTrialRequest.ts` (or a Supabase Edge Function triggered on insert),
   sending to the gym's real `email` field instead of just writing to the table.
2. **Notify yourself of new leads too** (quick win, do this first) — a Postgres
   trigger + webhook (or the same Resend call) that pings you the moment someone
   submits a request, so you don't have to keep checking the Supabase Table
   Editor by hand.
3. **A dashboard toggle for `accepts_trial_requests`** (phase 3) — right now the
   only way to flip it is directly in Supabase Table Editor → gyms.

Until then: submissions are visible only via **Supabase dashboard → Table Editor
→ trial_requests**.

## Real gym data

7 of the listings are **real Budapest karate clubs**, researched from each
club's own public website (`is_demo = false` in the `gyms` table). Only
verified facts are included — no invented description, schedule, price, or
tags, unlike the 27 fictional demo gyms. Until a club claims its listing
(`claimed = true`), the app shows a small "not yet confirmed by the gym"
notice on it. Source for each:

- [Budapesti Honvéd SE – Karate](https://honved.hu/karate/)
- [Rákosmenti Karate SE (RKSE)](https://karateoktatas.eu/)
- [Gastroyal Karate SE](https://gastroyal.tagdij.com/contactus)
- [Tűzmadár Sportegyesület](https://www.tuzmadarse.hu/node/1604)
- [OSU Kyokushin Karate](https://osu.hu/)
- [Budai XI Karate SE](https://buxikarate.hu/budapest/) (no public email found — `scripts/invite-gym.js` can't send them an invite until an email is added to their row)
- [Seishin Sportegyesület (WKB)](https://www.seishindojo.hu/) (same — no public email found)

To research and add more, extend `scripts/real-gyms.js` with the same
verified-facts-only fields, then re-run `node scripts/generate-seed-sql.js`
and paste the new inserts from `supabase/seed_gyms.sql` into the SQL editor
(the `on conflict do nothing` guard means re-running the whole file is safe
and won't duplicate or overwrite existing rows).

## Deploying to Vercel

1. Push the project to a GitHub repository.
2. Import the repo in [Vercel](https://vercel.com/).
3. In **Project Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL` (optional — see [Setting up Supabase](#3-set-up-supabase-reviews--trial-requests))
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional)
4. Deploy. Vercel handles the Next.js build automatically.

> **Note:** Restrict your production API key to your Vercel domain to prevent unauthorized usage.

## Adding or Editing Gyms

**Live data now lives in Supabase's `gyms` table**, not just the JSON file —
the quickest way to add or fix one gym is the Supabase dashboard's **Table
Editor → gyms** (and `gym_translations` for the Hungarian text), directly.

`data/gyms.json` / `data/gyms.hu.json` remain the source of truth for the
27 fictional demo gyms and for regenerating the seed file (see
`scripts/generate-seed-sql.js`) — edit them if you want to change a *demo*
gym, or add a *new* real gym to `scripts/real-gyms.js` instead (see "Real gym
data" above). Each gym entry follows this shape:

```json
{
  "id": "unique-string",
  "name": "Gym Name",
  "sport": ["Karate", "BJJ"],
  "address": "Street, City, Postcode",
  "lat": 47.4979,
  "lng": 19.0402,
  "description": "Short description of the gym.",
  "website": "https://example.com",
  "district": 6,
  "phone": "+36 30 000 0000",
  "email": "info@example.com",
  "facebook": "https://facebook.com/handle",
  "instagram": "https://instagram.com/handle",
  "priceFrom": 15000,
  "priceNote": "Monthly pass",
  "tags": ["beginner-friendly", "kids-classes"],
  "firstTrainingInfo": "What a first-timer should expect.",
  "equipmentNeeded": "What to bring.",
  "intensityLevel": "medium",
  "schedule": [{ "day": "Monday", "time": "18:00" }]
}
```

Valid sport values: `Karate`, `BJJ`, `Boxing`, `Muay Thai`, `MMA`.
`district` is the Budapest kerület number (1–23); it can be derived from the
postcode (`1XXY` → district `XX`) — see `scripts/enrich-gyms.js`.

To add a Hungarian translation for a new gym's free-text fields, add a
matching entry (by `id`) to `data/gyms.hu.json` with `description`,
`firstTrainingInfo`, `equipmentNeeded` and `priceNote`. If omitted, the
Hungarian UI silently falls back to the English text for that gym.

> ⚠️ **Placeholder data.** The `phone`, `email`, `facebook`, `instagram`,
> `priceFrom` and `priceNote` fields in the current dataset are **synthetic
> placeholders**, generated to exercise the UI — same convention as the
> pre-existing `example.com` website links. They are not real contact
> details or prices. Replace them with real, verified data (ideally
> gathered through a self-service "claim your listing" flow) before this
> goes live to real users.
