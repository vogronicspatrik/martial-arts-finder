# Martial Arts Finder

A minimal web application to discover martial arts gyms in Budapest. Browse gyms on an interactive map, filter by sport type, and click for details.

## Features

- **Interactive map** centered on Budapest with markers for all gyms
- **Multi-select sport filter** (Karate, BJJ, Boxing, Muay Thai, MMA)
- **Scrollable gym list** synchronized with the map
- **Marker popups** with name, sports, address, description, and website link
- **"Use my location"** button via browser geolocation

## Tech Stack

- [Next.js 14](https://nextjs.org/) (React, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) via `@react-google-maps/api`
- Static JSON data (no backend)

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

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── components/
│   ├── Filters.tsx       # Sport type checkboxes
│   ├── GymList.tsx       # Scrollable sidebar list
│   └── Map.tsx           # Google Map with markers & InfoWindow
├── data/
│   └── gyms.json         # Static gym dataset (27 Budapest gyms)
├── pages/
│   ├── _app.tsx
│   └── index.tsx         # Main page — layout & state
├── styles/
│   └── globals.css
├── types/
│   └── gym.ts            # Gym interface & sport constants
├── .env.local.example
└── README.md
```

## Deploying to Vercel

1. Push the project to a GitHub repository.
2. Import the repo in [Vercel](https://vercel.com/).
3. In **Project Settings → Environment Variables**, add:
   - **Name:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Value:** your API key
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
  "website": "https://example.com"
}
```

Valid sport values: `Karate`, `BJJ`, `Boxing`, `Muay Thai`, `MMA`.
