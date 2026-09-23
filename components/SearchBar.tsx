import { useLanguage } from '../lib/i18n';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ value, onChange, placeholder, className }: SearchBarProps) {
  const { t } = useLanguage();

  return (
    <div className={`relative flex items-center ${className ?? ''}`}>
      <span className="absolute left-3 text-sm pointer-events-none" style={{ color: '#4A4744' }}>
        🔎
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t.common.searchPlaceholder}
        className="w-full text-sm rounded-full pl-9 pr-8 py-2 bg-transparent outline-none placeholder:text-ink-600 text-ink-100"
        style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 w-5 h-5 flex items-center justify-center rounded-full text-xs text-ink-600 hover:text-ink-200"
          title={t.common.clearSearch}
        >
          ✕
        </button>
      )}
    </div>
  );
}
