import { ALL_SPORTS, ALL_TAGS } from '../types/gym';

const SPORT_ACTIVE: Record<string, string> = {
  Karate:      'bg-red-950/70 text-red-400 border-red-800/60',
  BJJ:         'bg-blue-950/70 text-blue-400 border-blue-800/60',
  Boxing:      'bg-orange-950/70 text-orange-300 border-orange-800/60',
  'Muay Thai': 'bg-purple-950/70 text-purple-400 border-purple-800/60',
  MMA:         'bg-green-950/70 text-green-400 border-green-800/60',
};

interface FiltersProps {
  selectedSports: string[];
  onSportsChange: (sports: string[]) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  showTodayOnly: boolean;
  onTodayToggle: () => void;
  showSavedOnly: boolean;
  onSavedToggle: () => void;
  savedCount: number;
  onOpenQuiz: () => void;
}

export default function Filters({
  selectedSports,
  onSportsChange,
  selectedTags,
  onTagsChange,
  showTodayOnly,
  onTodayToggle,
  showSavedOnly,
  onSavedToggle,
  savedCount,
  onOpenQuiz,
}: FiltersProps) {
  const toggleSport = (sport: string) =>
    onSportsChange(
      selectedSports.includes(sport)
        ? selectedSports.filter((s) => s !== sport)
        : [...selectedSports, sport]
    );

  const toggleTag = (tag: string) =>
    onTagsChange(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
    );

  const toggleBeginner = () => {
    const tag = 'beginner-friendly';
    onTagsChange(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
    );
  };

  const hasActiveFilters =
    selectedSports.length > 0 || selectedTags.length > 0 || showTodayOnly || showSavedOnly;

  const clearAll = () => {
    onSportsChange([]);
    onTagsChange([]);
    if (showTodayOnly) onTodayToggle();
    if (showSavedOnly) onSavedToggle();
  };

  return (
    <div className="shrink-0" style={{ background: '#141414', borderBottom: '1px solid #2A2A2A' }}>
      {/* Row 1: Sports */}
      <div className="flex items-center gap-3 px-4 py-2 flex-wrap">
        <span className="font-display text-xs font-semibold text-ink-400 uppercase tracking-widest whitespace-nowrap">
          Style
        </span>

        {ALL_SPORTS.map((sport) => {
          const active = selectedSports.includes(sport);
          return (
            <button
              key={sport}
              onClick={() => toggleSport(sport)}
              className={`text-xs px-3 py-1.5 rounded border font-medium transition-all ${
                active
                  ? `${SPORT_ACTIVE[sport]} shadow-glow-accent`
                  : 'border-[#2A2A2A] text-ink-400 hover:border-accent/50 hover:text-ink-200'
              }`}
            >
              {sport}
            </button>
          );
        })}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onTodayToggle}
            className={`text-xs font-semibold px-3 py-1.5 rounded border transition-all ${
              showTodayOnly
                ? 'bg-green-900/60 text-green-400 border-green-800/60'
                : 'border-[#2A2A2A] text-ink-400 hover:border-green-800/60 hover:text-green-500'
            }`}
          >
            📅 Today
          </button>

          <button
            onClick={onSavedToggle}
            className={`text-xs font-semibold px-3 py-1.5 rounded border transition-all ${
              showSavedOnly
                ? 'bg-[#1A1500] text-gold border-gold/40'
                : 'border-[#2A2A2A] text-ink-400 hover:border-gold/40 hover:text-gold'
            }`}
          >
            ★{savedCount > 0 ? ` ${savedCount}` : ''}
          </button>

          <button
            onClick={onOpenQuiz}
            className="text-xs font-semibold px-3 py-1.5 rounded transition-all"
            style={{ background: '#C96A3D', color: '#0B0B0B' }}
          >
            🥋 Find my style
          </button>
        </div>
      </div>

      {/* Row 2: Tags */}
      <div className="flex items-center gap-2 px-4 pb-2 flex-wrap">
        <span className="font-display text-xs font-semibold text-ink-400 uppercase tracking-widest whitespace-nowrap">
          Tags
        </span>

        <button
          onClick={toggleBeginner}
          className={`text-xs px-2.5 py-1 rounded border font-medium transition-all ${
            selectedTags.includes('beginner-friendly')
              ? 'bg-[#1A1200] text-gold border-gold/50'
              : 'border-[#2A2A2A] text-ink-400 hover:border-gold/40 hover:text-gold'
          }`}
        >
          ⭐ Beginners
        </button>

        {ALL_TAGS.filter((t) => t !== 'beginner-friendly').map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`text-xs px-2.5 py-1 rounded border transition-all ${
              selectedTags.includes(tag)
                ? 'bg-surface-3 text-ink-100 border-ink-600'
                : 'border-[#2A2A2A] text-ink-400 hover:border-ink-600 hover:text-ink-200'
            }`}
          >
            {tag.replace(/-/g, ' ')}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="ml-auto text-xs text-ink-600 hover:text-ink-400 underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
