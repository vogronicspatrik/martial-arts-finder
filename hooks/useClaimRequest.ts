import { useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * The public "Is this your gym?" entry point (ClaimGymModal). This never
 * emails the gym itself — it only records the request for the site owner to
 * review, same insert-only pattern as trial_requests (no anon select
 * policy, so only the owner sees these via the Supabase dashboard). The
 * actual verification email only goes out when the owner decides to run
 * `node scripts/invite-gym.js <gymId>` for a specific listing.
 *
 * Note: a fake submission here can't itself produce a false claim — that
 * still requires the magic link to actually be clicked from the gym's real
 * inbox (see hooks/useClaimGym.ts's completeClaim + its RLS policy). This
 * is purely about keeping the admin's review queue from filling up with
 * repeat noise, not a security boundary.
 */
export interface ClaimRequestInput {
  gymId: string;
  gymName: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  website?: string; // honeypot
}

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h
const storageKey = (gymId: string) => `maf_claim_request_sent_${gymId}`;

function lastSubmittedAt(gymId: string): number | null {
  try {
    const raw = localStorage.getItem(storageKey(gymId));
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

function markSubmitted(gymId: string) {
  try {
    localStorage.setItem(storageKey(gymId), String(Date.now()));
  } catch {
    // ignore
  }
}

export function useClaimRequest(gymId: string) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const previouslySubmittedAt = lastSubmittedAt(gymId);
  const onCooldown = previouslySubmittedAt !== null && Date.now() - previouslySubmittedAt < COOLDOWN_MS;
  const cooldownHoursLeft = onCooldown
    ? Math.ceil((COOLDOWN_MS - (Date.now() - previouslySubmittedAt!)) / (60 * 60 * 1000))
    : 0;

  const submit = useCallback(
    async (input: ClaimRequestInput) => {
      setError(null);
      if (!supabase) {
        setError('not-configured');
        return;
      }
      if (onCooldown) {
        // Already asked recently from this browser — don't add another row.
        setSuccess(true);
        return;
      }
      if (input.website) {
        setSuccess(true); // honeypot tripped — pretend it worked
        return;
      }
      setSubmitting(true);
      const { error: err } = await supabase.from('claim_requests').insert({
        gym_id: input.gymId,
        gym_name: input.gymName,
        requester_name: input.name.trim().slice(0, 80),
        requester_email: input.email.trim().slice(0, 200),
        requester_phone: input.phone.trim().slice(0, 30) || null,
        message: input.message.trim().slice(0, 500) || null,
      });
      setSubmitting(false);
      if (err) setError(err.message);
      else {
        markSubmitted(input.gymId);
        setSuccess(true);
      }
    },
    [onCooldown]
  );

  return {
    submit,
    submitting,
    error,
    success: success || onCooldown,
    configured: isSupabaseConfigured,
    onCooldown,
    cooldownHoursLeft,
  };
}
