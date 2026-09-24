import { Gym, SPORT_BADGE, INTENSITY_COLOR, DISTRICT_ROMAN, TagType } from '../types/gym';
import { formatPrice, distanceKm, formatDistance, getTodayName, todaysSchedule } from '../lib/utils';
import { LatLng } from '../hooks/useUserLocation';
import { useLanguage, TAG_LABEL, INTENSITY_LABEL, DAY_SHORT } from '../lib/i18n';
import { GymRatingStats } from '../hooks/useReviews';
import ReviewBadge from './ReviewBadge';

interface GymDetailCardProps {
  gym: Gym;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
  onClose: () => void;
  userLocation?: LatLng | null;
  stats?: GymRatingStats;
  onOpenReviews?: () => void;
  onRequestTrial?: () => void;
}

export default function GymDetailCard({
  gym,
  isBookmarked,
  onBookmarkToggle,
  onClose,
  userLocation,
  stats,
  onOpenReviews,
  onRequestTrial,
}: GymDetailCardProps) {
  const { t, lang } = useLanguage();
  const distance = userLocation ? distanceKm(userLocation, { lat: gym.lat, lng: gym.lng }) : null;
  const today = getTodayName();
  const todaySessions = todaysSchedule(gym, today);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 max-h-[82vh] flex flex-col"
      style={{
        background: '#141414',
        borderRadius: '20px 20px 0 0',
        borderTop: '1px solid #2A2A2A',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.9)',
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid #1E1E1E' }}>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-400 hover:text-ink-200 min-h-[44px] transition-colors"
        >
          {t.common.back}
        </button>
        <button
          onClick={() => onBookmarkToggle(gym.id)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-2xl transition-colors"
          style={{ color: isBookmarked ? '#F2B632' : '#2A2A2A' }}
        >
          ★
        </button>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 px-5 py-4">
        {/* Name */}
        <h2 className="font-display font-bold text-xl text-ink-100 uppercase tracking-wide leading-tight mb-1.5">
          {gym.name}
        </h2>

        {onOpenReviews && (
          <ReviewBadge stats={stats} onClick={onOpenReviews} className="mb-3 inline-block" />
        )}

        {/* Sport + intensity */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {gym.sport.map((s) => (
            <span key={s} className={`text-sm px-3 py-1 rounded font-medium ${SPORT_BADGE[s] ?? 'bg-surface-3 text-ink-200 border border-surface-4'}`}>
              {s}
            </span>
          ))}
          {gym.intensityLevel && (
            <span className={`text-sm px-3 py-1 rounded font-medium ${INTENSITY_COLOR[gym.intensityLevel]}`}>
              {INTENSITY_LABEL[lang][gym.intensityLevel]}
            </span>
          )}
        </div>

        {/* Address */}
        <p className="text-sm text-ink-400 mb-1">
          {gym.address}
          {gym.district && DISTRICT_ROMAN[gym.district] && (
            <span> · {t.common.district(DISTRICT_ROMAN[gym.district])}</span>
          )}
        </p>
        {distance !== null && (
          <p className="text-sm mb-1" style={{ color: '#C96A3D' }}>📍 {formatDistance(distance)} {t.common.fromYou}</p>
        )}

        {todaySessions.length > 0 && (
          <p className="text-sm font-semibold mb-3" style={{ color: '#27AE60' }}>
            📅 {t.common.todayAt(todaySessions.map((s) => s.time).join(', '))}
          </p>
        )}

        {/* Price */}
        {gym.priceFrom && (
          <p className="text-sm text-ink-200 mb-1">
            <span className="text-ink-400">{t.common.from}</span>{' '}
            <span className="font-display font-semibold" style={{ color: '#F2B632' }}>{formatPrice(gym.priceFrom)}{t.common.perMonthFull}</span>
            {gym.priceNote && <span className="text-ink-400"> · {gym.priceNote}</span>}
          </p>
        )}
        {(gym.priceFrom || gym.phone || gym.facebook || gym.instagram) && (
          <p className="text-xs text-ink-600 mb-4">{t.common.demoDataNotice}</p>
        )}

        {/* Description */}
        <p className="text-sm text-ink-200 leading-relaxed mb-4">{gym.description}</p>

        {/* Tags */}
        {gym.tags && gym.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {gym.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-surface-3 text-ink-400 border border-surface-4">
                {TAG_LABEL[lang][tag as TagType]}
              </span>
            ))}
          </div>
        )}

        {/* First training */}
        {gym.firstTrainingInfo && (
          <div
            className="rounded-xl px-4 py-3 mb-4"
            style={{ background: 'rgba(201,106,61,0.1)', border: '1px solid rgba(201,106,61,0.25)' }}
          >
            <p className="font-display text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#C96A3D' }}>
              {t.common.firstTraining}
            </p>
            <p className="text-sm text-ink-200">{gym.firstTrainingInfo}</p>
            {gym.equipmentNeeded && (
              <p className="text-sm text-ink-400 mt-2">
                <span className="text-ink-200 font-medium">{t.common.bring}</span> {gym.equipmentNeeded}
              </p>
            )}
          </div>
        )}

        {/* Schedule */}
        {gym.schedule && gym.schedule.length > 0 && (
          <div className="mb-5">
            <p className="font-display text-xs font-semibold text-ink-600 uppercase tracking-widest mb-2.5">
              {t.common.schedule}
            </p>
            <div className="flex flex-wrap gap-2">
              {[...gym.schedule]
                .sort((a, b) => (a.day === today ? -1 : b.day === today ? 1 : 0))
                .map((s, i) => {
                  const isToday = s.day === today;
                  return (
                    <span
                      key={i}
                      className="text-sm px-3 py-1.5 rounded-lg"
                      style={{
                        background: isToday ? 'rgba(39,174,96,0.12)' : '#1E1E1E',
                        border: isToday ? '1px solid rgba(39,174,96,0.5)' : '1px solid #2A2A2A',
                        color: isToday ? '#4ADE80' : '#8A8480',
                      }}
                    >
                      <span className="font-semibold" style={{ color: isToday ? '#4ADE80' : '#F0EDE8' }}>
                        {DAY_SHORT[lang][s.day]}
                      </span>{' '}
                      <span>{s.time}</span>
                    </span>
                  );
                })}
            </div>
          </div>
        )}

        {/* Contact */}
        {(gym.phone || gym.email || gym.facebook || gym.instagram) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {gym.phone && (
              <a
                href={`tel:${gym.phone.replace(/\s/g, '')}`}
                className="flex-1 min-w-[45%] text-center text-sm font-medium py-2.5 rounded-lg text-ink-200 transition-colors hover:text-ink-100"
                style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
              >
                📞 {t.common.call}
              </a>
            )}
            {gym.email && (
              <a
                href={`mailto:${gym.email}`}
                className="flex-1 min-w-[45%] text-center text-sm font-medium py-2.5 rounded-lg text-ink-200 transition-colors hover:text-ink-100"
                style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
              >
                ✉️ {t.common.email}
              </a>
            )}
            {gym.facebook && (
              <a
                href={gym.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[45%] text-center text-sm font-medium py-2.5 rounded-lg text-ink-200 transition-colors hover:text-ink-100"
                style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
              >
                {t.common.facebook}
              </a>
            )}
            {gym.instagram && (
              <a
                href={gym.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[45%] text-center text-sm font-medium py-2.5 rounded-lg text-ink-200 transition-colors hover:text-ink-100"
                style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
              >
                {t.common.instagram}
              </a>
            )}
          </div>
        )}

        {/* CTA */}
        {onRequestTrial && (
          <button
            onClick={onRequestTrial}
            className="block w-full text-center font-display font-semibold text-sm py-4 rounded-xl transition-all uppercase tracking-widest mb-2"
            style={{ background: '#C96A3D', color: '#0B0B0B' }}
          >
            {t.trial.cta}
          </button>
        )}
        {gym.website && (
          <a
            href={gym.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center font-display font-semibold text-sm py-3.5 rounded-xl transition-all uppercase tracking-widest mb-2"
            style={{ background: '#1E1E1E', border: '1px solid #2A2A2A', color: '#F0EDE8' }}
          >
            {t.common.visitWebsite}
          </a>
        )}
      </div>
    </div>
  );
}
