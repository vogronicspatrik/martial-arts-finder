import { ALL_SPORTS } from '../types/gym';

const SPORT_COLORS: Record<string, string> = {
  Karate: 'text-red-700',
  BJJ: 'text-blue-700',
  Boxing: 'text-orange-700',
  'Muay Thai': 'text-purple-700',
  MMA: 'text-green-700',
};

interface FiltersProps {
  selectedSports: string[];
  onChange: (sports: string[]) => void;
}

export default function Filters({ selectedSports, onChange }: FiltersProps) {
  const toggleSport = (sport: string) => {
    if (selectedSports.includes(sport)) {
      onChange(selectedSports.filter((s) => s !== sport));
    } else {
      onChange([...selectedSports, sport]);
    }
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-white border-b shadow-sm flex-wrap">
      <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
        Filter by sport:
      </span>
      <div className="flex flex-wrap gap-4">
        {ALL_SPORTS.map((sport) => {
          const checked = selectedSports.includes(sport);
          return (
            <label
              key={sport}
              className="flex items-center gap-1.5 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleSport(sport)}
                className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
              />
              <span
                className={`text-sm font-medium ${checked ? SPORT_COLORS[sport] : 'text-gray-700'}`}
              >
                {sport}
              </span>
            </label>
          );
        })}
      </div>
      {selectedSports.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline whitespace-nowrap"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
