import { useLanguage, INTENSITY_SHORT } from '../lib/i18n';

const DOT_COLOR: Record<'low' | 'medium' | 'high', string> = {
  low: '#4ADE80',
  medium: '#FACC15',
  high: '#F87171',
};

const LEVELS: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

export default function IntensityLegend({ className }: { className?: string }) {
  const { t, lang } = useLanguage();

  return (
    <div className={`flex items-center flex-wrap gap-x-2.5 gap-y-1 text-xs text-ink-600 ${className ?? ''}`}>
      <span className="whitespace-nowrap">{t.common.intensity}:</span>
      {LEVELS.map((level) => (
        <span key={level} className="flex items-center gap-1 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DOT_COLOR[level] }} />
          {INTENSITY_SHORT[lang][level]}
        </span>
      ))}
    </div>
  );
}
