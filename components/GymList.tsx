import { Gym } from '../types/gym';

const SPORT_BADGE: Record<string, string> = {
  Karate: 'bg-red-100 text-red-700',
  BJJ: 'bg-blue-100 text-blue-700',
  Boxing: 'bg-orange-100 text-orange-700',
  'Muay Thai': 'bg-purple-100 text-purple-700',
  MMA: 'bg-green-100 text-green-700',
};

interface GymListProps {
  gyms: Gym[];
  selectedGym: Gym | null;
  onGymSelect: (gym: Gym) => void;
}

export default function GymList({ gyms, selectedGym, onGymSelect }: GymListProps) {
  if (gyms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm px-4 text-center">
        <span className="text-3xl mb-2">🥋</span>
        No gyms match the current filters.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {gyms.map((gym) => {
        const isSelected = selectedGym?.id === gym.id;
        return (
          <li
            key={gym.id}
            onClick={() => onGymSelect(gym)}
            className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
              isSelected
                ? 'bg-blue-50 border-l-4 border-l-blue-500 pl-3'
                : 'border-l-4 border-l-transparent'
            }`}
          >
            <p className="font-semibold text-sm text-gray-900 leading-snug">
              {gym.name}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {gym.sport.map((s) => (
                <span
                  key={s}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    SPORT_BADGE[s] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-snug">{gym.address}</p>
          </li>
        );
      })}
    </ul>
  );
}
