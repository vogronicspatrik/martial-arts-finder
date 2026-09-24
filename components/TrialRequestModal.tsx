import { useState } from 'react';
import { Gym } from '../types/gym';
import { useLanguage, DAY_LABEL } from '../lib/i18n';
import { useTrialRequest } from '../hooks/useTrialRequest';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface TrialRequestModalProps {
  gym: Gym;
  onClose: () => void;
}

export default function TrialRequestModal({ gym, onClose }: TrialRequestModalProps) {
  const { t, lang } = useLanguage();
  const { submit, submitting, error, success, configured } = useTrialRequest();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDay, setPreferredDay] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

  const hasContact = phone.trim() || email.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hasContact) return;
    submit({ gymId: gym.id, gymName: gym.name, name, phone, email, preferredDay, message, website });
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
            <h2 className="font-display font-bold text-lg text-ink-100 uppercase tracking-widest">{t.trial.title}</h2>
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
          {!configured ? (
            <p className="text-sm text-ink-600">{t.trial.notConfigured}</p>
          ) : success ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-sm text-ink-200">{t.trial.success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <p className="text-sm text-ink-400 mb-1">{t.trial.intro}</p>

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

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-xs text-ink-400 mb-1.5">{t.trial.email}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.trial.emailPlaceholder}
                    maxLength={200}
                    className="w-full text-sm rounded-lg px-3 py-2.5 bg-transparent outline-none text-ink-100 placeholder:text-ink-600"
                    style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
                  />
                </div>
              </div>
              {!hasContact && <p className="text-xs text-ink-600">{t.trial.contactHint}</p>}

              <div>
                <label className="block text-xs text-ink-400 mb-1.5">{t.trial.preferredDay}</label>
                <select
                  value={preferredDay}
                  onChange={(e) => setPreferredDay(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2.5 bg-transparent outline-none text-ink-100"
                  style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
                >
                  <option value="">{t.trial.anyDay}</option>
                  {ALL_DAYS.map((d) => (
                    <option key={d} value={d}>
                      {DAY_LABEL[lang][d]}
                    </option>
                  ))}
                </select>
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

              {error && <p className="text-xs" style={{ color: '#F87171' }}>{t.trial.error}</p>}

              <button
                type="submit"
                disabled={submitting || !hasContact}
                className="w-full font-display font-semibold text-sm py-3.5 rounded-xl transition-all uppercase tracking-widest disabled:opacity-50"
                style={{ background: '#C96A3D', color: '#0B0B0B' }}
              >
                {submitting ? t.trial.submitting : t.trial.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
