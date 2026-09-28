import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { completeClaim } from '../hooks/useClaimGym';
import { useLanguage } from '../lib/i18n';

type Status = 'verifying' | 'not-signed-in' | 'success' | 'error';

export default function ClaimPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { email, isSignedIn, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<Status>('verifying');
  const [gymName, setGymName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const gymId = typeof router.query.gym === 'string' ? router.query.gym : null;

  useEffect(() => {
    if (!router.isReady || authLoading || !supabase || !gymId) return;

    if (!isSignedIn) {
      setStatus('not-signed-in');
      return;
    }

    (async () => {
      const { data: userData } = await supabase!.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setStatus('not-signed-in');
        return;
      }

      const { data: gymRow } = await supabase!.from('gyms').select('name').eq('id', gymId).single();
      setGymName(gymRow?.name ?? gymId);

      const result = await completeClaim(gymId, userId);
      if (result.status === 'success') setStatus('success');
      else {
        setStatus('error');
        setErrorMessage(result.message ?? null);
      }
    })();
  }, [router.isReady, authLoading, isSignedIn, gymId]);

  return (
    <>
      <Head>
        <title>{t.claim.title}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="flex items-center justify-center min-h-screen p-4" style={{ background: '#0B0B0B' }}>
        <div
          className="w-full max-w-md text-center px-6 py-10 rounded-2xl"
          style={{ background: '#141414', border: '1px solid #2A2A2A' }}
        >
          {!gymId ? (
            <p className="text-sm text-ink-400">{t.claim.pageErrorGeneric}</p>
          ) : status === 'verifying' ? (
            <>
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-sm text-ink-300">{t.claim.pageVerifying}</p>
            </>
          ) : status === 'not-signed-in' ? (
            <>
              <div className="text-4xl mb-4">📬</div>
              <p className="text-sm text-ink-300">{t.claim.pageNotSignedIn}</p>
            </>
          ) : status === 'success' ? (
            <>
              <div className="text-4xl mb-4">✅</div>
              <p className="text-sm text-ink-100 font-medium mb-1">{t.claim.pageSuccess(gymName ?? '')}</p>
              {email && <p className="text-xs text-ink-600">{email}</p>}
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">⚠️</div>
              <p className="font-display font-semibold text-base text-ink-100 uppercase tracking-widest mb-2">
                {t.claim.pageErrorTitle}
              </p>
              <p className="text-sm text-ink-400">{errorMessage ?? t.claim.pageErrorGeneric}</p>
            </>
          )}

          <a
            href="/"
            className="inline-block mt-6 text-sm font-semibold"
            style={{ color: '#C96A3D' }}
          >
            {t.claim.backHome}
          </a>
        </div>
      </div>
    </>
  );
}
