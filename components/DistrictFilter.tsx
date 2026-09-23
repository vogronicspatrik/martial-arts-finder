import { useEffect, useRef, useState } from 'react';
import { DISTRICT_ROMAN } from '../types/gym';
import { useLanguage } from '../lib/i18n';

interface DistrictFilterProps {
  districts: number[]; // districts that actually have gyms, sorted ascending
  selected: number[];
  onChange: (districts: number[]) => void;
}

export default function DistrictFilter({ districts, selected, onChange }: DistrictFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const toggle = (d: number) =>
    onChange(selected.includes(d) ? selected.filter((x) => x !== d) : [...selected, d]);

  const label =
    selected.length === 0
      ? t.filters.district
      : selected.length === 1
      ? t.common.district(DISTRICT_ROMAN[selected[0]])
      : t.filters.districtCount(selected.length);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`text-xs px-3 py-1.5 rounded border font-medium transition-all whitespace-nowrap ${
          selected.length > 0
            ? 'bg-surface-3 text-ink-100 border-ink-600'
            : 'border-[#2A2A2A] text-ink-400 hover:border-accent/50 hover:text-ink-200'
        }`}
      >
        📍 {label}
      </button>

      {open && (
        <div
          className="absolute z-30 mt-1.5 p-2 rounded-lg grid grid-cols-4 gap-1 max-h-64 overflow-y-auto"
          style={{ background: '#1E1E1E', border: '1px solid #2A2A2A', width: '220px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
        >
          {districts.map((d) => {
            const active = selected.includes(d);
            return (
              <button
                key={d}
                onClick={() => toggle(d)}
                className={`text-xs px-2 py-1.5 rounded font-medium transition-all ${
                  active ? 'bg-accent text-surface' : 'text-ink-400 hover:text-ink-100'
                }`}
                style={{ border: active ? '1px solid #C96A3D' : '1px solid transparent' }}
              >
                {DISTRICT_ROMAN[d]}
              </button>
            );
          })}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="col-span-4 text-xs text-ink-600 hover:text-ink-400 underline mt-1 pt-1"
              style={{ borderTop: '1px solid #2A2A2A' }}
            >
              {t.mobileSheet.clear}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
