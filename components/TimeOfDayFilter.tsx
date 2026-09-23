import { TimeOfDay } from '../types/gym';
import { useLanguage, timeOfDayShort, timeOfDayLabel } from '../lib/i18n';

const ICONS: Record<TimeOfDay, string> = {
  any: '🕐',
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌙',
};

const OPTIONS: TimeOfDay[] = ['any', 'morning', 'afternoon', 'evening'];

interface TimeOfDayFilterProps {
  value: TimeOfDay;
  onChange: (v: TimeOfDay) => void;
  variant?: 'compact' | 'grid';
}

export default function TimeOfDayFilter({ value, onChange, variant = 'compact' }: TimeOfDayFilterProps) {
  const { lang } = useLanguage();

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className="py-3.5 px-4 rounded-xl text-sm font-semibold text-left transition-all min-h-[48px]"
              style={{
                background: active ? 'rgba(201,106,61,0.1)' : '#1E1E1E',
                border: active ? '1px solid rgba(201,106,61,0.35)' : '1px solid #2A2A2A',
                color: active ? '#C96A3D' : '#8A8480',
              }}
            >
              {ICONS[opt]} {timeOfDayShort(lang, opt)}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded p-0.5" style={{ border: '1px solid #2A2A2A' }}>
      {OPTIONS.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            title={opt === 'any' ? timeOfDayShort(lang, 'any') : timeOfDayLabel(lang, opt)}
            className={`text-xs px-2.5 py-1 rounded font-medium transition-all ${
              active ? 'bg-accent text-surface' : 'text-ink-400 hover:text-ink-200'
            }`}
          >
            {ICONS[opt]}
          </button>
        );
      })}
    </div>
  );
}
