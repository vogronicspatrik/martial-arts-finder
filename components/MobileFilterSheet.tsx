import { useState } from 'react';
import { ALL_SPORTS, ALL_TAGS, DISTRICT_ROMAN, TimeOfDay } from '../types/gym';
import SearchBar from './SearchBar';
import TimeOfDayFilter from './TimeOfDayFilter';
import { useLanguage, TAG_LABEL } from '../lib/i18n';
import IntensityLegend from './IntensityLegend';

const SPORT_ACTIVE: Record<string, string> = {
  Karate:      'text-red-400',
  BJJ:         'text-blue-400',
  Boxing:      'text-orange-300',
  'Muay Thai': 'text-purple-400',
  MMA:         'text-green-400',
};

interface MobileFilterSheetProps {
  selectedSports: string[];
  onSportsChange: (s: string[]) => void;
  selectedTags: string[];
  onTagsChange: (t: string[]) => void;
  showTodayOnly: boolean;
  onTodayToggle: () => void;
  showSavedOnly: boolean;
  onSavedToggle: () => void;
  savedCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  allDistricts: number[];
  selectedDistricts: number[];
  onDistrictsChange: (d: number[]) => void;
  timeOfDay: TimeOfDay;
  onTimeOfDayChange: (t: TimeOfDay) => void;
  onClose: () => void;
}

export default function MobileFilterSheet({
  selectedSports,
  onSportsChange,
  selectedTags,
  onTagsChange,
  showTodayOnly,
  onTodayToggle,
  showSavedOnly,
  onSavedToggle,
  savedCount,
  searchQuery,
  onSearchChange,
  allDistricts,
  selectedDistricts,
  onDistrictsChange,
  timeOfDay,
  onTimeOfDayChange,
  onClose,
}: MobileFilterSheetProps) {
  const { t, lang } = useLanguage();
  const [sports, setSports] = useState<string[]>(selectedSports);
  const [tags, setTags] = useState<string[]>(selectedTags);
  const [today, setToday] = useState(showTodayOnly);
  const [saved, setSaved] = useState(showSavedOnly);
  const [search, setSearch] = useState(searchQuery);
  const [districts, setDistricts] = useState<number[]>(selectedDistricts);
  const [time, setTime] = useState<TimeOfDay>(timeOfDay);

  const toggleSport = (s: string) =>
    setSports((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const toggleDistrict = (d: number) =>
    setDistricts((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const activeCount =
    sports.length + tags.length + districts.length + (today ? 1 : 0) + (saved ? 1 : 0) +
    (time !== 'any' ? 1 : 0) + (search.trim() ? 1 : 0);

  const handleApply = () => {
    onSportsChange(sports);
    onTagsChange(tags);
    onDistrictsChange(districts);
    onTimeOfDayChange(time);
    onSearchChange(search);
    if (today !== showTodayOnly) onTodayToggle();
    if (saved !== showSavedOnly) onSavedToggle();
    onClose();
  };

  const handleClear = () => {
    setSports([]);
    setTags([]);
    setToday(false);
    setSaved(false);
    setSearch('');
    setDistricts([]);
    setTime('any');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div
        className="relative z-10 max-h-[88vh] flex flex-col"
        style={{
          background: '#141414',
          borderRadius: '20px 20px 0 0',
          borderTop: '1px solid #2A2A2A',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.9)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid #1E1E1E' }}>
          <h2 className="font-display font-semibold text-base text-ink-100 uppercase tracking-widest">
            {t.mobileSheet.filters}
          </h2>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button onClick={handleClear} className="text-sm text-ink-600 hover:text-ink-400 underline">
                {t.mobileSheet.clear}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full text-ink-400 hover:text-ink-200 transition-colors"
              style={{ background: '#1E1E1E' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-6">
          {/* Search */}
          <div>
            <p className="font-display text-xs font-semibold text-ink-600 uppercase tracking-widest mb-3">
              {t.mobileSheet.search}
            </p>
            <SearchBar value={search} onChange={setSearch} placeholder={t.mobileSheet.searchPlaceholder} />
          </div>

          {/* Today + Saved */}
          <div>
            <p className="font-display text-xs font-semibold text-ink-600 uppercase tracking-widest mb-3">
              {t.mobileSheet.availability}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setToday((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all min-h-[48px]"
                style={{
                  background: today ? 'rgba(39,174,96,0.12)' : '#1E1E1E',
                  border: today ? '1px solid rgba(39,174,96,0.4)' : '1px solid #2A2A2A',
                }}
              >
                <span className="text-sm font-medium text-ink-100">📅 {t.mobileSheet.trainingToday}</span>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: today ? '#27AE60' : '#2A2A2A',
                    background: today ? '#27AE60' : 'transparent',
                  }}
                >
                  {today && <span className="text-white text-xs">✓</span>}
                </div>
              </button>

              <button
                onClick={() => setSaved((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all min-h-[48px]"
                style={{
                  background: saved ? 'rgba(242,182,50,0.1)' : '#1E1E1E',
                  border: saved ? '1px solid rgba(242,182,50,0.4)' : '1px solid #2A2A2A',
                }}
              >
                <span className="text-sm font-medium text-ink-100">
                  ★ {t.mobileSheet.savedGymsOnly(savedCount)}
                </span>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: saved ? '#F2B632' : '#2A2A2A',
                    background: saved ? '#F2B632' : 'transparent',
                  }}
                >
                  {saved && <span className="text-surface text-xs">✓</span>}
                </div>
              </button>
            </div>
          </div>

          {/* Time of day */}
          <div>
            <p className="font-display text-xs font-semibold text-ink-600 uppercase tracking-widest mb-3">
              {t.mobileSheet.timeOfDay}
            </p>
            <TimeOfDayFilter value={time} onChange={setTime} variant="grid" />
          </div>

          {/* District */}
          <div>
            <p className="font-display text-xs font-semibold text-ink-600 uppercase tracking-widest mb-3">
              {t.mobileSheet.district}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {allDistricts.map((d) => {
                const active = districts.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDistrict(d)}
                    className="py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: active ? '#C96A3D' : '#1E1E1E',
                      border: active ? '1px solid #C96A3D' : '1px solid #2A2A2A',
                      color: active ? '#0B0B0B' : '#8A8480',
                    }}
                  >
                    {DISTRICT_ROMAN[d]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sports */}
          <div>
            <p className="font-display text-xs font-semibold text-ink-600 uppercase tracking-widest mb-1.5">
              {t.mobileSheet.sportType}
            </p>
            <IntensityLegend className="mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {ALL_SPORTS.map((sport) => {
                const active = sports.includes(sport);
                return (
                  <button
                    key={sport}
                    onClick={() => toggleSport(sport)}
                    className={`py-3.5 px-4 rounded-xl text-sm font-semibold text-left transition-all min-h-[48px] font-display uppercase tracking-wide ${active ? SPORT_ACTIVE[sport] : 'text-ink-400'}`}
                    style={{
                      background: active ? 'rgba(201,106,61,0.1)' : '#1E1E1E',
                      border: active ? '1px solid rgba(201,106,61,0.35)' : '1px solid #2A2A2A',
                    }}
                  >
                    {sport}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="font-display text-xs font-semibold text-ink-600 uppercase tracking-widest mb-3">
              {t.mobileSheet.gymType}
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="py-2 px-4 rounded-full text-sm font-medium transition-all min-h-[40px]"
                    style={{
                      background: active ? '#C96A3D' : '#1E1E1E',
                      border: active ? '1px solid #C96A3D' : '1px solid #2A2A2A',
                      color: active ? '#0B0B0B' : '#8A8480',
                    }}
                  >
                    {tag === 'beginner-friendly' && '⭐ '}
                    {TAG_LABEL[lang][tag]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Apply */}
        <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid #1E1E1E' }}>
          <button
            onClick={handleApply}
            className="w-full font-display font-semibold text-sm py-4 rounded-xl transition-all uppercase tracking-widest"
            style={{ background: '#C96A3D', color: '#0B0B0B' }}
          >
            {t.mobileSheet.showGyms(activeCount)}
          </button>
        </div>
      </div>
    </div>
  );
}
