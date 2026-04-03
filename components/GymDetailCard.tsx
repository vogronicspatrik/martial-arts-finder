import { Gym, SPORT_BADGE, INTENSITY_CONFIG } from '../types/gym';

interface GymDetailCardProps {
  gym: Gym;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
  onClose: () => void;
}

export default function GymDetailCard({ gym, isBookmarked, onBookmarkToggle, onClose }: GymDetailCardProps) {
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
          ← Back
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
        <h2 className="font-display font-bold text-xl text-ink-100 uppercase tracking-wide leading-tight mb-3">
          {gym.name}
        </h2>

        {/* Sport + intensity */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {gym.sport.map((s) => (
            <span key={s} className={`text-sm px-3 py-1 rounded font-medium ${SPORT_BADGE[s] ?? 'bg-surface-3 text-ink-200 border border-surface-4'}`}>
              {s}
            </span>
          ))}
          {gym.intensityLevel && (
            <span className={`text-sm px-3 py-1 rounded font-medium ${INTENSITY_CONFIG[gym.intensityLevel].color}`}>
              {INTENSITY_CONFIG[gym.intensityLevel].label}
            </span>
          )}
        </div>

        {/* Address */}
        <p className="text-sm text-ink-400 mb-4">{gym.address}</p>

        {/* Description */}
        <p className="text-sm text-ink-200 leading-relaxed mb-4">{gym.description}</p>

        {/* Tags */}
        {gym.tags && gym.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {gym.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-surface-3 text-ink-400 border border-surface-4">
                {tag.replace(/-/g, ' ')}
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
              First training
            </p>
            <p className="text-sm text-ink-200">{gym.firstTrainingInfo}</p>
            {gym.equipmentNeeded && (
              <p className="text-sm text-ink-400 mt-2">
                <span className="text-ink-200 font-medium">Bring:</span> {gym.equipmentNeeded}
              </p>
            )}
          </div>
        )}

        {/* Schedule */}
        {gym.schedule && gym.schedule.length > 0 && (
          <div className="mb-5">
            <p className="font-display text-xs font-semibold text-ink-600 uppercase tracking-widest mb-2.5">
              Schedule
            </p>
            <div className="flex flex-wrap gap-2">
              {gym.schedule.map((s, i) => (
                <span
                  key={i}
                  className="text-sm px-3 py-1.5 rounded-lg text-ink-200"
                  style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
                >
                  <span className="font-semibold text-ink-100">{s.day.slice(0, 3)}</span>{' '}
                  <span className="text-ink-400">{s.time}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {gym.website && (
          <a
            href={gym.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center font-display font-semibold text-sm py-4 rounded-xl transition-all uppercase tracking-widest mb-2"
            style={{ background: '#C96A3D', color: '#0B0B0B' }}
          >
            Visit Website →
          </a>
        )}
      </div>
    </div>
  );
}
