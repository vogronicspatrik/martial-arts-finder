import { useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
export function useClaimGym() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestClaimLink = useCallback(async (gymId: string, gymEmail: string) => {
    setError(null);
    if (!supabase) {
      setError('not-configured');
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
    else setSent(true);
  }, []);

  const reset = useCallback(() => {
    setSent(false);
    setError(null);
  }, []);

  return { requestClaimLink, sending, sent, error, reset, configured: isSupabaseConfigured };
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
