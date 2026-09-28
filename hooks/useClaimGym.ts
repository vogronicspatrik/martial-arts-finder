import { supabase } from '../lib/supabase';

/**
 * Only completeClaim lives here now — the magic-link *send* is deliberately
 * NOT triggered from the browser/UI anymore (see ClaimGymModal.tsx and its
 * comment for why: a public button that emails a real gym doesn't scale
 * safely once there are dozens of unclaimed listings). The site owner sends
 * that invite themselves, via `node scripts/invite-gym.js <gymId>`.
 *
 * completeClaim still runs client-side, on the /claim page, once the owner
 * has followed that link and is authenticated — it links their account to
 * the gym and marks it claimed. RLS (supabase/005_claim_flow.sql) rejects
 * this unless the signed-in email actually matches the gym's, so it can't
 * be spoofed by calling it directly with an arbitrary gymId/userId.
 */
export interface CompleteClaimResult {
  status: 'success' | 'error' | 'not-signed-in';
  message?: string;
}

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
