import { useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// TODO(real gym data): this only writes to Supabase — it does not email the
// gym. Gym.email is currently synthetic placeholder data, so there's no real
// inbox to send to yet. Once gyms claim real listings, wire in an email
// service (e.g. Resend) here, or a Supabase Edge Function triggered on
// insert. See README → "Roadmap — once real gyms are onboarded".

export interface TrialRequestInput {
  gymId: string;
  gymName: string;
  name: string;
  phone: string;
  email: string;
  preferredDay: string;
  message: string;
  /** Honeypot — real users never fill this in; bots often do. */
  website?: string;
}

export function useTrialRequest() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (input: TrialRequestInput) => {
    setError(null);
    if (!supabase) {
      setError('not-configured');
      return;
    }
    if (input.website) {
      // Honeypot tripped: pretend it worked so a bot doesn't learn anything.
      setSuccess(true);
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.from('trial_requests').insert({
      gym_id: input.gymId,
      gym_name: input.gymName,
      name: input.name.trim().slice(0, 80),
      phone: input.phone.trim().slice(0, 30) || null,
      email: input.email.trim().slice(0, 200) || null,
      preferred_day: input.preferredDay || null,
      message: input.message.trim().slice(0, 500) || null,
    });
    setSubmitting(false);
    if (err) setError(err.message);
    else setSuccess(true);
  }, []);

  const reset = useCallback(() => {
    setSuccess(false);
    setError(null);
  }, []);

  return { submit, submitting, error, success, reset, configured: isSupabaseConfigured };
}
