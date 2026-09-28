// Admin-only: actually sends the claim magic-link email to a specific gym.
// This is the ONLY thing that triggers that email — no button on the public
// site can do it (see components/ClaimGymModal.tsx). Run this yourself, once
// you've decided a gym is ready to be invited (e.g. after reaching out to
// them, or after reviewing a legitimate row in the claim_requests table).
//
// Usage:
//   node scripts/invite-gym.js <gymId> [siteUrl]
//
// Examples:
//   node scripts/invite-gym.js r1
//   node scripts/invite-gym.js r1 https://hunwannabunyo.vercel.app
//
// Reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY from
// .env.local — the same anon key the site itself uses. No service-role key
// needed: signInWithOtp is designed to be safely callable with the anon key,
// which is exactly why it had to be kept off the public UI (anyone with the
// anon key — i.e. anyone who opened the site — could otherwise call it).

const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnvLocal();

const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const gymId = process.argv[2];
const siteUrl = (process.argv[3] || 'https://hunwannabunyo.vercel.app').replace(/\/$/, '');

if (!url || !anonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}
if (!gymId) {
  console.error('Usage: node scripts/invite-gym.js <gymId> [siteUrl]');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

(async () => {
  const { data: gym, error: fetchErr } = await supabase
    .from('gyms')
    .select('id,name,email,claimed')
    .eq('id', gymId)
    .single();

  if (fetchErr || !gym) {
    console.error(`Could not find gym "${gymId}":`, fetchErr?.message ?? 'not found');
    process.exit(1);
  }
  if (gym.claimed) {
    console.log(`"${gym.name}" is already claimed — nothing to do.`);
    process.exit(0);
  }
  if (!gym.email) {
    console.error(
      `"${gym.name}" has no email on file, so an automatic invite isn't possible. ` +
        `Get their email another way (phone/Facebook) first, add it via Table Editor, then re-run this.`
    );
    process.exit(1);
  }

  const { error: sendErr } = await supabase.auth.signInWithOtp({
    email: gym.email,
    options: { emailRedirectTo: `${siteUrl}/claim?gym=${encodeURIComponent(gym.id)}` },
  });

  if (sendErr) {
    console.error(`Failed to send invite to ${gym.email}:`, sendErr.message);
    process.exit(1);
  }

  console.log(`✅ Sent claim invite for "${gym.name}" to ${gym.email}`);
})();
