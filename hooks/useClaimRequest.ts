import { useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * The manual fallback: for a gym with no email on file, the magic-link claim
 * (hooks/useClaimGym.ts) can't work. This just records a request for the
 * site owner to verify by hand — same insert-only pattern as trial_requests,
 * no anon select policy, so only the owner (Supabase dashboard) sees these.
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

export function useClaimRequest() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (input: ClaimRequestInput) => {
    setError(null);
    if (!supabase) {
      setError('not-configured');
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
    else setSuccess(true);
  }, []);

  return { submit, submitting, error, success, configured: isSupabaseConfigured };
}
