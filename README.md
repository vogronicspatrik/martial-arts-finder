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
  drives real interest

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
2. In the dashboard, go to **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `reviews` and `trial_requests` tables with the right row-level-security
   policies (reviews are publicly readable; trial requests are insert-only —
   nobody but you can read the phone numbers/emails people submit).
3. Go to **Project Settings → API**, copy the **Project URL** and the
   **anon public** key, and add them to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

4. To view submitted trial-class requests, go to **Table Editor → trial_requests**
   in the Supabase dashboard — that's your lead list.

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
│   └── TrialRequestModal.tsx  # "Request a trial class" lead-capture form (Supabase-backed)
├── data/
│   ├── gyms.json              # Static gym dataset (27 Budapest gyms), English canonical
│   └── gyms.hu.json           # Hungarian overlay: description/firstTrainingInfo/
│                              #   equipmentNeeded/priceNote per gym id, merged in when
│                              #   the Hungarian UI is active (see pages/index.tsx)
├── hooks/
│   ├── useBookmarks.ts        # Saved-gyms state, persisted to localStorage
│   ├── useIsMobile.ts         # Viewport-based mobile/desktop switch
│   ├── useUserLocation.ts     # Single geolocation entry point ("near me")
│   ├── useReviews.ts          # Loads all reviews once, per-gym aggregates, submit
│   └── useTrialRequest.ts     # Submits a trial-class request lead
├── lib/
│   ├── utils.ts                # Distance, search-matching, price/district formatting
│   ├── i18n.tsx                # EN/HU dictionary, LanguageProvider/useLanguage context
│   └── supabase.ts             # Supabase client (null if env vars aren't set)
├── supabase/
│   └── schema.sql             # Run once in the Supabase SQL editor — see setup steps above
├── scripts/
│   └── enrich-gyms.js         # One-off script that added district/contact/price fields
├── pages/
│   ├── _app.tsx
│   └── index.tsx              # Main page — layout, filtering & state
├── styles/
│   └── globals.css
├── types/
│   └── gym.ts                 # Gym interface, sport/tag/district constants
├── .env.local.example
└── README.md
```

## Roadmap — once real gyms are onboarded

Right now every gym's `email`/`phone`/`facebook`/`instagram` is **synthetic placeholder
data** (see the demo-data notice in the app itself), and a "Request a trial class"
submission only lands in the `trial_requests` Supabase table — it is **not emailed
to anyone**, because there is no real gym inbox to send it to yet.

Once gyms start claiming real listings with real contact details, build this:

1. **Email the gym when a trial request comes in.** Add an email-sending service
   (e.g. [Resend](https://resend.com/) — has a free tier) and call it from
   `hooks/useTrialRequest.ts` (or a Supabase Edge Function triggered on insert),
   sending to the gym's real `email` field instead of just writing to the table.
2. **Notify yourself of new leads too** (quick win, do this first) — a Postgres
   trigger + webhook (or the same Resend call) that pings you the moment someone
   submits a request, so you don't have to keep checking the Supabase Table
   Editor by hand.

Until then: submissions are visible only via **Supabase dashboard → Table Editor
→ trial_requests**.

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

Edit [`data/gyms.json`](data/gyms.json). Each gym entry follows this shape:

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
