import { useState } from 'react';
import { Gym } from '../types/gym';
import { useLanguage } from '../lib/i18n';
import { useClaimRequest } from '../hooks/useClaimRequest';

interface ClaimGymModalProps {
  gym: Gym;
  onClose: () => void;
}

/**
 * Public-facing claim entry point. This deliberately NEVER emails the gym
 * directly — it only records interest in claim_requests, for the site owner
 * to review and act on manually (see scripts/invite-gym.js). The actual
 * verification email only goes out once the owner runs that script for a
 * specific gym; no visitor click can trigger it. See README → Roadmap.
 */
export default function ClaimGymModal({ gym, onClose }: ClaimGymModalProps) {
  const { t } = useLanguage();
  const claimRequest = useClaimRequest(gym.id);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    claimRequest.submit({ gymId: gym.id, gymName: gym.name, name, email, phone, message, website });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div
        className="w-full max-w-md flex flex-col overflow-hidden"
        style={{
          background: '#141414',
          border: '1px solid #2A2A2A',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.9)',
          maxHeight: '90vh',
        }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0" style={{ borderBottom: '1px solid #1E1E1E' }}>
          <div>
            <h2 className="font-display font-bold text-lg text-ink-100 uppercase tracking-widest">{t.claim.title}</h2>
            <p className="text-xs text-ink-600 mt-0.5">{gym.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-ink-400 hover:text-ink-200 transition-colors"
            style={{ background: '#1E1E1E' }}
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {!claimRequest.configured ? (
            <p className="text-sm text-ink-600">{t.claim.notConfigured}</p>
          ) : claimRequest.success ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-sm text-ink-200">
                {claimRequest.onCooldown ? t.claim.alreadySubmitted(claimRequest.cooldownHoursLeft) : t.trial.success}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <p className="text-sm text-ink-400 mb-1">{t.claim.intro}</p>

              <div>
                <label className="block text-xs text-ink-400 mb-1.5">{t.trial.name}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.trial.namePlaceholder}
                  maxLength={80}
                  className="w-full text-sm rounded-lg px-3 py-2.5 bg-transparent outline-none text-ink-100 placeholder:text-ink-600"
                  style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
                />
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1.5">{t.trial.email}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.trial.emailPlaceholder}
                  maxLength={200}
                  className="w-full text-sm rounded-lg px-3 py-2.5 bg-transparent outline-none text-ink-100 placeholder:text-ink-600"
                  style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
                />
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1.5">{t.trial.phone}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.trial.phonePlaceholder}
                  maxLength={30}
                  className="w-full text-sm rounded-lg px-3 py-2.5 bg-transparent outline-none text-ink-100 placeholder:text-ink-600"
                  style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
                />
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1.5">{t.trial.message}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.trial.messagePlaceholder}
                  maxLength={500}
                  rows={2}
                  className="w-full text-sm rounded-lg px-3 py-2.5 bg-transparent outline-none text-ink-100 placeholder:text-ink-600 resize-none"
                  style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
                />
              </div>

              {/* Honeypot */}
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="absolute opacity-0 pointer-events-none"
                style={{ left: '-9999px' }}
                aria-hidden="true"
              />

              {claimRequest.error && <p className="text-xs" style={{ color: '#F87171' }}>{t.trial.error}</p>}

              <button
                type="submit"
                disabled={claimRequest.submitting}
                className="w-full font-display font-semibold text-sm py-3.5 rounded-xl transition-all uppercase tracking-widest disabled:opacity-50"
                style={{ background: '#C96A3D', color: '#0B0B0B' }}
              >
                {claimRequest.submitting ? t.trial.submitting : t.trial.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
