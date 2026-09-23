// One-off enrichment script: adds district, contact fields and price info
// to data/gyms.json. NOTE: facebook/instagram/phone/email/price values are
// synthetic placeholders (same convention as the existing example.com
// website links) — real clubs must supply their own once they claim a listing.
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'gyms.json');
const gyms = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function districtFromAddress(address) {
  const m = address.match(/\b1(\d{2})\d\b/);
  if (!m) return null;
  return parseInt(m[1], 10);
}

// simple deterministic pseudo-random in [0,1) seeded by a string
function seededRand(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h = (h ^ (h >>> 15)) >>> 0;
  return h / 4294967296;
}

const PRICE_BASE = { low: 12000, medium: 16000, high: 20000 };

const MOBILE_PREFIXES = ['20', '30', '70'];

function phoneFor(id) {
  const r1 = seededRand(id + 'phone1');
  const r2 = seededRand(id + 'phone2');
  const prefix = MOBILE_PREFIXES[Math.floor(r1 * MOBILE_PREFIXES.length)];
  const rest = String(Math.floor(r2 * 9000000) + 1000000);
  return `+36 ${prefix} ${rest.slice(0, 3)} ${rest.slice(3)}`;
}

const enriched = gyms.map((gym) => {
  const slug = slugify(gym.name);
  const district = districtFromAddress(gym.address);
  const intensity = gym.intensityLevel || 'medium';
  const base = PRICE_BASE[intensity] ?? PRICE_BASE.medium;
  const variance = Math.round(((seededRand(gym.id + 'price') - 0.5) * 4000) / 500) * 500;
  const priceFrom = Math.max(8000, base + variance);

  return {
    ...gym,
    district,
    phone: phoneFor(gym.id),
    email: `${slug}@example.com`,
    facebook: `https://facebook.com/${slug}`,
    instagram: `https://instagram.com/${slug}`,
    priceFrom,
    priceNote: 'Monthly pass, per-class options may be available — ask the gym.',
  };
});

fs.writeFileSync(filePath, JSON.stringify(enriched, null, 2) + '\n', 'utf8');
console.log(`Enriched ${enriched.length} gyms.`);
console.log(JSON.stringify(enriched[0], null, 2));
