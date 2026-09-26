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
  district?: number;
  phone?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  priceFrom?: number;
  priceNote?: string;
  /** True for the original fictional showcase gyms — false/undefined for real, researched or claimed listings. */
  isDemo?: boolean;
  /** True once a real owner has verified control of this listing (see the claim flow in the README roadmap). */
  claimed?: boolean;
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

// Colors only — labels are language-dependent, see lib/i18n.tsx (INTENSITY_LABEL).
export const INTENSITY_COLOR: Record<'low' | 'medium' | 'high', string> = {
  low:    'bg-green-950/70 text-green-400 border border-green-900/50',
  medium: 'bg-yellow-950/70 text-yellow-400 border border-yellow-900/50',
  high:   'bg-red-950/70 text-red-400 border border-red-900/50',
};

// Budapest district numbers (1–23) as Roman numerals, the way locals refer to them.
export const DISTRICT_ROMAN: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII',
  9: 'IX', 10: 'X', 11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV',
  16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX', 21: 'XXI',
  22: 'XXII', 23: 'XXIII',
};

export type TimeOfDay = 'any' | 'morning' | 'afternoon' | 'evening';

// Test functions only — labels are language-dependent, see lib/i18n.tsx (TIME_OF_DAY_LABEL).
export const TIME_OF_DAY_TEST: Record<Exclude<TimeOfDay, 'any'>, (hour: number) => boolean> = {
  morning:   (h) => h < 12,
  afternoon: (h) => h >= 12 && h < 18,
  evening:   (h) => h >= 18,
};
