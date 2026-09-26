import { useEffect, useMemo, useState } from 'react';
import { Gym } from '../types/gym';
import { Lang } from '../lib/i18n';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import gymsData from '../data/gyms.json';
import gymsHuData from '../data/gyms.hu.json';

type GymHuOverlay = Partial<Pick<Gym, 'description' | 'firstTrainingInfo' | 'equipmentNeeded' | 'priceNote'>>;
const staticGymsHu = gymsHuData as Record<string, GymHuOverlay>;
const staticGyms = (gymsData as Gym[]).map((g) => ({ ...g, isDemo: true }));

function withHu(gyms: Gym[], huByGymId: Record<string, GymHuOverlay>, lang: Lang): Gym[] {
  if (lang !== 'hu') return gyms;
  return gyms.map((g) => ({ ...g, ...huByGymId[g.id] }));
}

// Postgres (snake_case) row → app-shaped Gym (camelCase). Keeps the rest of
// the app oblivious to where the data came from.
function rowToGym(row: Record<string, unknown>): Gym {
  return {
    id: row.id as string,
    name: row.name as string,
    sport: (row.sport as string[]) ?? [],
    address: row.address as string,
    lat: row.lat as number,
    lng: row.lng as number,
    description: (row.description as string) ?? '',
    website: (row.website as string) ?? '',
    tags: (row.tags as string[]) ?? undefined,
    firstTrainingInfo: (row.first_training_info as string) ?? undefined,
    equipmentNeeded: (row.equipment_needed as string) ?? undefined,
    intensityLevel: (row.intensity_level as Gym['intensityLevel']) ?? undefined,
    schedule: (row.schedule as Gym['schedule']) ?? undefined,
    district: (row.district as number) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    email: (row.email as string) ?? undefined,
    facebook: (row.facebook as string) ?? undefined,
    instagram: (row.instagram as string) ?? undefined,
    priceFrom: (row.price_from as number) ?? undefined,
    priceNote: (row.price_note as string) ?? undefined,
    isDemo: (row.is_demo as boolean) ?? false,
    claimed: (row.claimed as boolean) ?? false,
  };
}

/**
 * Gym data now lives in Supabase (see supabase/002_gyms_and_accounts.sql +
 * supabase/seed_gyms.sql) so gyms can eventually edit their own listing
 * without a code deploy. Falls back to the static data/gyms.json — instantly,
 * with no loading flash — when Supabase isn't configured, so local dev and
 * the original demo still work with zero setup.
 */
export function useGyms(lang: Lang) {
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [huRows, setHuRows] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const [gymsRes, trRes] = await Promise.all([
        supabase.from('gyms').select('*'),
        supabase.from('gym_translations').select('*').eq('lang', 'hu'),
      ]);
      if (cancelled) return;
      if (gymsRes.error) setError(gymsRes.error.message);
      else {
        setRows(gymsRes.data ?? []);
        setHuRows(trRes.data ?? []);
        setError(null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const gyms = useMemo(() => {
    if (rows) {
      const huByGymId: Record<string, GymHuOverlay> = {};
      for (const r of huRows ?? []) {
        huByGymId[r.gym_id as string] = {
          description: (r.description as string) ?? undefined,
          firstTrainingInfo: (r.first_training_info as string) ?? undefined,
          equipmentNeeded: (r.equipment_needed as string) ?? undefined,
          priceNote: (r.price_note as string) ?? undefined,
        };
      }
      return withHu(rows.map(rowToGym), huByGymId, lang);
    }
    // Supabase not configured yet, or still loading for the first time.
    return withHu(staticGyms, staticGymsHu, lang);
  }, [rows, huRows, lang]);

  return { gyms, loading, error, source: rows ? ('supabase' as const) : ('static' as const) };
}
