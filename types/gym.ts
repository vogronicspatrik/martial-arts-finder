export interface ScheduleEntry {
  day: string;
  time: string;
}

export interface Gym {
  id: string;
  name: string;
  sport: string[];
  address: string;
  lat: number;
  lng: number;
  description: string;
  website: string;
  tags?: string[];
  firstTrainingInfo?: string;
  equipmentNeeded?: string;
  intensityLevel?: 'low' | 'medium' | 'high';
  schedule?: ScheduleEntry[];
}

export const ALL_SPORTS = ['Karate', 'BJJ', 'Boxing', 'Muay Thai', 'MMA'] as const;
export type SportType = (typeof ALL_SPORTS)[number];

export const ALL_TAGS = [
  'beginner-friendly',
  'hard-training',
  'friendly-community',
  'women-friendly',
  'kids-classes',
  'competition-team',
  'open-mat',
  'professional-coaches',
] as const;
export type TagType = (typeof ALL_TAGS)[number];

export const SPORT_BADGE: Record<string, string> = {
  Karate:      'bg-red-950/70 text-red-400 border border-red-900/50',
  BJJ:         'bg-blue-950/70 text-blue-400 border border-blue-900/50',
  Boxing:      'bg-orange-950/70 text-orange-300 border border-orange-900/50',
  'Muay Thai': 'bg-purple-950/70 text-purple-400 border border-purple-900/50',
  MMA:         'bg-green-950/70 text-green-400 border border-green-900/50',
};

export const SPORT_MARKER_COLOR: Record<string, string> = {
  Karate:      '#C96A3D',
  BJJ:         '#3D7EC9',
  Boxing:      '#C96A3D',
  'Muay Thai': '#9B59B6',
  MMA:         '#27AE60',
};

export const INTENSITY_CONFIG = {
  low:    { label: 'Low intensity',    color: 'bg-green-950/70 text-green-400 border border-green-900/50' },
  medium: { label: 'Medium intensity', color: 'bg-yellow-950/70 text-yellow-400 border border-yellow-900/50' },
  high:   { label: 'High intensity',   color: 'bg-red-950/70 text-red-400 border border-red-900/50' },
};
