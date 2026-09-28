import { useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// A real inbox (a real gym's) receives these emails, so repeat clicks — from
// the same visitor re-opening the modal, or just mashing the button — must
// not each fire a new one. This is a per-browser guard against that; it does
// NOT stop different visitors/devices from each sending one (Supabase Auth's
// own per-address email rate limit is the backstop for that — check
// Authentication → Rate Limits in the Supabase dashboard).
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h
const storageKey = (gymId: string) => `maf_claim_sent_${gymId}`;

function lastSentAt(gymId: string): number | null {
  try {
    const raw = localStorage.getItem(storageKey(gymId));
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

function markSent(gymId: string) {
  try {
    localStorage.setItem(storageKey(gymId), String(Date.now()));
  } catch {
    // ignore
  }
}

/**
 * The two halves of the claim flow:
 * - requestClaimLink: sends a magic link to the gym's email ON FILE
 *   (not a typed-in address), from the "Is this your gym?" button.
 * - completeClaim: runs on /claim after the user follows that link and is
 *   authenticated — links the account to the gym and marks it claimed. RLS
 *   (see supabase/005_claim_flow.sql) rejects this unless the signed-in
 *   email actually matches the gym's email, so this can't be spoofed by
 *   calling it directly.
 */
export function useClaimGym(gymId: string) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previouslySentAt = lastSentAt(gymId);
  const onCooldown = previouslySentAt !== null && Date.now() - previouslySentAt < COOLDOWN_MS;
  const cooldownHoursLeft = onCooldown
    ? Math.ceil((COOLDOWN_MS - (Date.now() - previouslySentAt!)) / (60 * 60 * 1000))
    : 0;

  const requestClaimLink = useCallback(
    async (gymEmail: string) => {
      setError(null);
      if (!supabase) {
        setError('not-configured');
        return;
      }
      if (onCooldown) {
        // Already sent recently from this browser — don't fire another one.
        setSent(true);
        return;
      }
      setSending(true);
      const { error: err } = await supabase.auth.signInWithOtp({
        email: gymEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/claim?gym=${encodeURIComponent(gymId)}`,
        },
      });
      setSending(false);
      if (err) setError(err.message);
      else {
        markSent(gymId);
        setSent(true);
      }
    },
    [gymId, onCooldown]
  );

  const reset = useCallback(() => {
    setSent(false);
    setError(null);
  }, []);

  return {
    requestClaimLink,
    sending,
    sent: sent || onCooldown,
    error,
    reset,
    configured: isSupabaseConfigured,
    onCooldown,
    cooldownHoursLeft,
  };
}

export interface CompleteClaimResult {
  status: 'success' | 'error' | 'not-signed-in';
  message?: string;
}

/** Called once on the /claim landing page after the magic-link redirect. */
export async function completeClaim(gymId: string, userId: string): Promise<CompleteClaimResult> {
  if (!supabase) return { status: 'error', message: 'not-configured' };

  const { error: gymErr } = await supabase.from('gyms').update({ claimed: true }).eq('id', gymId);
  if (gymErr) return { status: 'error', message: gymErr.message };

  const { error: ownerErr } = await supabase
    .from('gym_owners')
    .upsert({ gym_id: gymId, user_id: userId }, { onConflict: 'gym_id,user_id' });
  if (ownerErr) return { status: 'error', message: ownerErr.message };

  return { status: 'success' };
}
