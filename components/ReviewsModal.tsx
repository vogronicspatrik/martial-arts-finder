import { useState } from 'react';
import { Gym } from '../types/gym';
import { useLanguage } from '../lib/i18n';
import { Review, GymRatingStats } from '../hooks/useReviews';
import ReviewStars from './ReviewStars';

interface ReviewsModalProps {
  gym: Gym;
  reviews: Review[];
  stats?: GymRatingStats;
  configured: boolean;
  onSubmit: (input: { authorName: string; rating: number; comment: string; website?: string }) => Promise<void>;
  onClose: () => void;
}

function timeAgo(iso: string, lang: 'en' | 'hu'): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return lang === 'hu' ? 'ma' : 'today';
  if (days === 1) return lang === 'hu' ? 'tegnap' : 'yesterday';
  if (days < 30) return lang === 'hu' ? `${days} napja` : `${days}d ago`;
  const months = Math.floor(days / 30);
  return lang === 'hu' ? `${months} hónapja` : `${months}mo ago`;
}

export default function ReviewsModal({ gym, reviews, stats, configured, onSubmit, onClose }: ReviewsModalProps) {
  const { t, lang } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) return;
    setSubmitting(true);
    setError(false);
    try {
      await onSubmit({ authorName, rating, comment, website });
      setSuccess(true);
      setShowForm(false);
      setAuthorName('');
      setComment('');
      setRating(5);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div
        className="w-full max-w-lg flex flex-col overflow-hidden"
        style={{
          background: '#141414',
          border: '1px solid #2A2A2A',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.9)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0" style={{ borderBottom: '1px solid #1E1E1E' }}>
          <div>
            <h2 className="font-display font-bold text-lg text-ink-100 uppercase tracking-widest">{t.reviews.title}</h2>
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
            <p className="text-sm text-ink-600">{t.reviews.notConfigured}</p>
          ) : (
            <>
              {/* Summary */}
              <div className="flex items-center gap-3 mb-5">
                <ReviewStars value={stats?.average ?? 0} size="lg" />
                <span className="text-sm text-ink-400">
                  {stats ? t.reviews.ratingSummary(stats.average, stats.count) : t.reviews.noReviewsYet}
                </span>
              </div>

              {/* Write review CTA / form */}
              {success && <p className="text-sm mb-4" style={{ color: '#4ADE80' }}>{t.reviews.success}</p>}

              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full text-center font-display font-semibold text-sm py-3 rounded-xl transition-all uppercase tracking-widest mb-5"
                  style={{ background: '#1E1E1E', border: '1px solid #2A2A2A', color: '#F0EDE8' }}
                >
                  ✎ {t.reviews.writeReview}
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 mb-6 rounded-xl p-4" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                  <div>
                    <label className="block text-xs text-ink-400 mb-1.5">{t.reviews.yourName}</label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder={t.reviews.namePlaceholder}
                      maxLength={60}
                      className="w-full text-sm rounded-lg px-3 py-2 bg-transparent outline-none text-ink-100 placeholder:text-ink-600"
                      style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-ink-400 mb-1.5">{t.reviews.yourRating}</label>
                    <ReviewStars value={rating} size="lg" interactive onChange={setRating} />
                  </div>
                  <div>
                    <label className="block text-xs text-ink-400 mb-1.5">{t.reviews.yourReview}</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t.reviews.reviewPlaceholder}
                      maxLength={1000}
                      rows={3}
                      className="w-full text-sm rounded-lg px-3 py-2 bg-transparent outline-none text-ink-100 placeholder:text-ink-600 resize-none"
                      style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
                    />
                  </div>
                  {/* Honeypot — hidden from real users via CSS, bots often fill every field */}
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
                  {error && <p className="text-xs" style={{ color: '#F87171' }}>{t.reviews.error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full font-display font-semibold text-sm py-3 rounded-xl transition-all uppercase tracking-widest disabled:opacity-60"
                    style={{ background: '#C96A3D', color: '#0B0B0B' }}
                  >
                    {submitting ? t.reviews.submitting : t.reviews.submit}
                  </button>
                </form>
              )}

              {/* List */}
              {reviews.length === 0 ? (
                <p className="text-sm text-ink-600">{t.reviews.noReviewsYet}</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-xl px-4 py-3" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-ink-100">{r.author_name}</span>
                        <span className="text-xs text-ink-600">{timeAgo(r.created_at, lang)}</span>
                      </div>
                      <ReviewStars value={r.rating} size="sm" />
                      {r.comment && <p className="text-sm text-ink-400 mt-1.5 leading-relaxed">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
