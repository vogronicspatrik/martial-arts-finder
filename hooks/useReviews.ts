import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Review {
  id: string;
  gym_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewInput {
  authorName: string;
  rating: number;
  comment: string;
  /** Honeypot — real users never fill this in; bots often do. */
  website?: string;
}

export interface GymRatingStats {
  average: number;
  count: number;
}

/**
 * Loads every review once (small table, cheap), so every gym card can show
 * a "★ 4.5 (12)" badge without a separate query per gym. The review modal
 * for a single gym just filters this in-memory list.
 */
export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else {
      setReviews(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const byGym = useMemo(() => {
    const map: Record<string, GymRatingStats> = {};
    const sums: Record<string, { total: number; count: number }> = {};
    for (const r of reviews) {
      const s = sums[r.gym_id] ?? { total: 0, count: 0 };
      s.total += r.rating;
      s.count += 1;
      sums[r.gym_id] = s;
    }
    for (const [gymId, s] of Object.entries(sums)) {
      map[gymId] = { average: s.total / s.count, count: s.count };
    }
    return map;
  }, [reviews]);

  const reviewsForGym = useCallback(
    (gymId: string) => reviews.filter((r) => r.gym_id === gymId),
    [reviews]
  );

  const submitReview = useCallback(
    async (gymId: string, input: ReviewInput) => {
      if (!supabase) throw new Error('Supabase is not configured');
      if (input.website) return; // honeypot tripped — silently drop
      const { error: err } = await supabase.from('reviews').insert({
        gym_id: gymId,
        author_name: input.authorName.trim().slice(0, 60),
        rating: input.rating,
        comment: input.comment.trim().slice(0, 1000) || null,
      });
      if (err) throw err;
      await refresh();
    },
    [refresh]
  );

  return {
    reviews,
    byGym,
    reviewsForGym,
    loading,
    error,
    submitReview,
    configured: isSupabaseConfigured,
  };
}
