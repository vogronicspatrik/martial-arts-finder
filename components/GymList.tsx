import { useState } from 'react';
import { Gym, SPORT_BADGE, INTENSITY_CONFIG } from '../types/gym';

interface GymListProps {
  gyms: Gym[];
  selectedGym: Gym | null;
  onGymSelect: (gym: Gym) => void;
  onGymHover: (gymId: string | null) => void;
  bookmarks: string[];
  onBookmarkToggle: (gymId: string) => void;
}

export default function GymList({
  gyms,
  selectedGym,
  onGymSelect,
  onGymHover,
  bookmarks,
  onBookmarkToggle,
}: GymListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (gyms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 px-4 text-center">
        <div className="text-3xl mb-3 opacity-40">🥋</div>
        <p className="text-sm text-ink-400">No gyms match the current filters.</p>
      </div>
    );
  }

  return (
    <ul className="p-2 space-y-1.5">
      {gyms.map((gym) => {
        const isSelected = selectedGym?.id === gym.id;
        const isExpanded = expandedId === gym.id;
        const isBookmarked = bookmarks.includes(gym.id);

        return (
          <li
            key={gym.id}
            onMouseEnter={() => onGymHover(gym.id)}
            onMouseLeave={() => onGymHover(null)}
            className="rounded-xl overflow-hidden cursor-pointer transition-all"
            style={{
              background: isSelected ? 'rgba(201,106,61,0.12)' : '#141414',
              border: isSelected ? '1px solid rgba(201,106,61,0.4)' : '1px solid #2A2A2A',
              boxShadow: isSelected ? '0 0 16px rgba(201,106,61,0.15)' : 'none',
            }}
          >
            {/* Main content */}
            <div className="p-3" onClick={() => onGymSelect(gym)}>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-display font-semibold text-sm text-ink-100 leading-snug uppercase tracking-wide flex-1">
                  {gym.name}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  {gym.intensityLevel && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${INTENSITY_CONFIG[gym.intensityLevel].color}`}>
                      {gym.intensityLevel}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onBookmarkToggle(gym.id); }}
                    className="min-w-[28px] min-h-[28px] flex items-center justify-center text-lg transition-colors"
                    style={{ color: isBookmarked ? '#F2B632' : '#4A4744' }}
                    title={isBookmarked ? 'Remove' : 'Save'}
                  >
                    ★
                  </button>
                </div>
              </div>

              {/* Sport badges */}
              <div className="flex flex-wrap gap-1 mb-1.5">
                {gym.sport.map((s) => (
                  <span key={s} className={`text-xs px-2 py-0.5 rounded font-medium ${SPORT_BADGE[s] ?? 'bg-surface-3 text-ink-200 border border-surface-4'}`}>
                    {s}
                  </span>
                ))}
              </div>

              {/* Address */}
              <p className="text-xs text-ink-400 mb-1.5 leading-snug">{gym.address}</p>

              {/* Tags */}
              {gym.tags && gym.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {gym.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-surface-3 text-ink-600 border border-surface-4">
                      {tag.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Expand toggle */}
            {gym.firstTrainingInfo && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : gym.id); }}
                className="w-full px-3 py-2 text-xs font-medium text-left transition-colors flex items-center gap-1.5"
                style={{
                  borderTop: '1px solid #2A2A2A',
                  color: isExpanded ? '#C96A3D' : '#4A4744',
                }}
              >
                <span>{isExpanded ? '▲' : '▼'}</span>
                {isExpanded ? 'Hide details' : 'What to expect'}
              </button>
            )}

            {/* Expanded section */}
            {isExpanded && gym.firstTrainingInfo && (
              <div
                className="px-3 pb-3 space-y-2"
                style={{ borderTop: '1px solid #1E1E1E' }}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs text-ink-200 pt-2">{gym.firstTrainingInfo}</p>
                {gym.equipmentNeeded && (
                  <p className="text-xs text-ink-400">
                    <span className="text-ink-200 font-medium">Bring:</span> {gym.equipmentNeeded}
                  </p>
                )}
                {gym.schedule && gym.schedule.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-ink-400 mb-1.5 uppercase tracking-wide">Schedule</p>
                    <div className="flex flex-wrap gap-1">
                      {gym.schedule.map((s, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded text-ink-200 font-medium" style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}>
                          {s.day.slice(0, 3)} {s.time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
