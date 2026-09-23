import { Gym, ScheduleEntry } from '../types/gym';

/** Canonical English day key for "today" (e.g. "Monday"), matching schedule.day values. */
export function getTodayName(): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date().getDay()
  ];
}

/** This gym's schedule entries that fall on the given day (usually 0 or 1). */
export function todaysSchedule(gym: Gym, today: string): ScheduleEntry[] {
  return gym.schedule?.filter((s) => s.day === today) ?? [];
}

/** Strip accents and lowercase, so Hungarian search works without exact diacritics. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function matchesSearch(gym: Gym, query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  const haystack = normalize(
    [gym.name, gym.address, gym.description, ...(gym.tags ?? [])].join(' ')
  );
  return haystack.includes(q);
}

/** Great-circle distance in kilometers (haversine). */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function formatPrice(huf: number): string {
  return `${huf.toLocaleString('hu-HU')} Ft`;
}

/** Parses "17:30" -> 17. Returns NaN for unparseable input. */
export function hourOf(time: string): number {
  return parseInt(time.split(':')[0], 10);
}
