export interface Gym {
  id: string;
  name: string;
  sport: string[];
  address: string;
  lat: number;
  lng: number;
  description: string;
  website: string;
}

export const ALL_SPORTS = ['Karate', 'BJJ', 'Boxing', 'Muay Thai', 'MMA'] as const;
export type SportType = (typeof ALL_SPORTS)[number];
