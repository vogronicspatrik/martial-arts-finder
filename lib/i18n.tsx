import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { TagType, TimeOfDay } from '../types/gym';

export type Lang = 'en' | 'hu';

const STORAGE_KEY = 'maf_lang';

// ─────────────────────────── Day names ───────────────────────────
// Schedule data always uses the canonical English day key (e.g. "Monday")
// so filtering logic (today, day matching) never has to care about
// language. These maps are for *display* only.
export const DAY_LABEL: Record<Lang, Record<string, string>> = {
  en: {
    Monday: 'Monday', Tuesday: 'Tuesday', Wednesday: 'Wednesday', Thursday: 'Thursday',
    Friday: 'Friday', Saturday: 'Saturday', Sunday: 'Sunday',
  },
  hu: {
    Monday: 'Hétfő', Tuesday: 'Kedd', Wednesday: 'Szerda', Thursday: 'Csütörtök',
    Friday: 'Péntek', Saturday: 'Szombat', Sunday: 'Vasárnap',
  },
};

export const DAY_SHORT: Record<Lang, Record<string, string>> = {
  en: {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
    Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
  },
  hu: {
    Monday: 'Hét', Tuesday: 'Ked', Wednesday: 'Sze', Thursday: 'Csü',
    Friday: 'Pén', Saturday: 'Szo', Sunday: 'Vas',
  },
};

// ─────────────────────────── Tag labels ───────────────────────────
export const TAG_LABEL: Record<Lang, Record<TagType, string>> = {
  en: {
    'beginner-friendly': 'beginner friendly',
    'hard-training': 'hard training',
    'friendly-community': 'friendly community',
    'women-friendly': 'women friendly',
    'kids-classes': 'kids classes',
    'competition-team': 'competition team',
    'open-mat': 'open mat',
    'professional-coaches': 'professional coaches',
  },
  hu: {
    'beginner-friendly': 'kezdőbarát',
    'hard-training': 'kemény edzés',
    'friendly-community': 'baráti közösség',
    'women-friendly': 'nőbarát',
    'kids-classes': 'gyerekfoglalkozás',
    'competition-team': 'versenycsapat',
    'open-mat': 'szabad gyakorlás',
    'professional-coaches': 'profi edzők',
  },
};

// ─────────────────────────── Intensity labels ───────────────────────────
export const INTENSITY_LABEL: Record<Lang, Record<'low' | 'medium' | 'high', string>> = {
  en: { low: 'Low intensity', medium: 'Medium intensity', high: 'High intensity' },
  hu: { low: 'Alacsony intenzitás', medium: 'Közepes intenzitás', high: 'Magas intenzitás' },
};

// Short, single-word form for space-constrained badges.
export const INTENSITY_SHORT: Record<Lang, Record<'low' | 'medium' | 'high', string>> = {
  en: { low: 'low', medium: 'medium', high: 'high' },
  hu: { low: 'alacsony', medium: 'közepes', high: 'magas' },
};

// ─────────────────────────── Time-of-day labels ───────────────────────────
export const TIME_OF_DAY_LABEL: Record<Lang, Record<Exclude<TimeOfDay, 'any'>, string>> = {
  en: {
    morning: 'Morning (before 12)',
    afternoon: 'Afternoon (12–18)',
    evening: 'Evening (18+)',
  },
  hu: {
    morning: 'Reggel (12 óra előtt)',
    afternoon: 'Délután (12–18)',
    evening: 'Este (18 óra után)',
  },
};

const TIME_OF_DAY_SHORT: Record<Lang, Record<TimeOfDay, string>> = {
  en: { any: 'Any time', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' },
  hu: { any: 'Bármikor', morning: 'Reggel', afternoon: 'Délután', evening: 'Este' },
};

export function timeOfDayShort(lang: Lang, t: TimeOfDay): string {
  return TIME_OF_DAY_SHORT[lang][t];
}

export function timeOfDayLabel(lang: Lang, t: Exclude<TimeOfDay, 'any'>): string {
  return TIME_OF_DAY_LABEL[lang][t];
}

// ─────────────────────────── UI dictionary ───────────────────────────
interface Dictionary {
  meta: { title: string; description: string };
  header: { title: string; tagline: (count: number) => string; recommended: string };
  common: {
    gymsCount: (n: number) => string;
    gymsCountOf: (n: number, total: number) => string;
    district: (roman: string) => string;
    districtShort: (roman: string) => string;
    from: string;
    perMonth: string;
    perMonthFull: string;
    call: string;
    email: string;
    facebook: string;
    instagram: string;
    visitWebsite: string;
    demoDataNotice: string;
    firstTraining: string;
    bring: string;
    schedule: string;
    todayAt: (times: string) => string;
    noSessionToday: string;
    save: string;
    remove: string;
    back: string;
    noResults: string;
    myLocation: string;
    nearMe: string;
    sortedByDistance: string;
    sortByDistanceFromMe: string;
    fromYou: string;
    mapLoadError: string;
    mapLoading: string;
    clearSearch: string;
    intensity: string;
    searchPlaceholder: string;
  };
  filters: {
    style: string;
    tags: string;
    today: string;
    beginners: string;
    findMyStyle: string;
    clearAll: string;
    district: string;
    districtCount: (n: number) => string;
  };
  mobileSheet: {
    filters: string;
    clear: string;
    search: string;
    searchPlaceholder: string;
    availability: string;
    trainingToday: string;
    savedGymsOnly: (count: number) => string;
    timeOfDay: string;
    district: string;
    sportType: string;
    gymType: string;
    showGyms: (count: number) => string;
  };
  gymList: { whatToExpect: string; hideDetails: string };
  quiz: {
    title: string;
    subtitle: string;
    questionOf: (step: number, total: number) => string;
    back: string;
    recommendedForYou: string;
    showMatchingGyms: string;
    closeWithoutFiltering: string;
  };
}

const en: Dictionary = {
  meta: {
    title: 'Martial Arts Finder Budapest',
    description: 'Find martial arts gyms in Budapest — Karate, BJJ, Boxing, Muay Thai, MMA',
  },
  header: {
    title: 'Martial Arts Finder',
    tagline: (count: number) => `Budapest · ${count} gyms`,
    recommended: 'Recommended:',
  },
  common: {
    gymsCount: (n: number) => `${n} gyms`,
    gymsCountOf: (n: number, total: number) => `${n} / ${total} gyms`,
    district: (roman: string) => `${roman}. district`,
    districtShort: (roman: string) => `${roman}. dist.`,
    from: 'From',
    perMonth: '/mo',
    perMonthFull: '/month',
    call: 'Call',
    email: 'Email',
    facebook: 'Facebook',
    instagram: 'Instagram',
    visitWebsite: 'Visit Website →',
    demoDataNotice: '🧪 Demo data — price and contact details are placeholders, not real.',
    firstTraining: 'First training',
    bring: 'Bring:',
    schedule: 'Schedule',
    todayAt: (times: string) => `Today at ${times}`,
    noSessionToday: 'No session today',
    save: 'Save',
    remove: 'Remove',
    back: '← Back',
    noResults: 'No gyms match the current filters.',
    myLocation: 'My location',
    nearMe: 'Near me',
    sortedByDistance: 'Sorted by distance',
    sortByDistanceFromMe: 'Sort by distance from me',
    fromYou: 'from you',
    mapLoadError: 'Failed to load Google Maps. Check your API key.',
    mapLoading: 'Loading map…',
    clearSearch: 'Clear search',
    intensity: 'Intensity',
    searchPlaceholder: 'Search gyms…',
  },
  filters: {
    style: 'Style',
    tags: 'Tags',
    today: 'Today',
    beginners: 'Beginners',
    findMyStyle: 'Find my style',
    clearAll: 'Clear all',
    district: 'District',
    districtCount: (n: number) => `${n} districts`,
  },
  mobileSheet: {
    filters: 'Filters',
    clear: 'Clear',
    search: 'Search',
    searchPlaceholder: 'Name, address…',
    availability: 'Availability',
    trainingToday: 'Training available today',
    savedGymsOnly: (count: number) => `Saved gyms only${count > 0 ? ` (${count})` : ''}`,
    timeOfDay: 'Time of day',
    district: 'District',
    sportType: 'Sport type',
    gymType: 'Gym type',
    showGyms: (count: number) => `Show gyms${count > 0 ? ` · ${count} active` : ''}`,
  },
  gymList: {
    whatToExpect: 'What to expect',
    hideDetails: 'Hide details',
  },
  quiz: {
    title: 'Find Your Style',
    subtitle: 'Discover your ideal martial art',
    questionOf: (step: number, total: number) => `Question ${step} of ${total}`,
    back: '← Back',
    recommendedForYou: 'Recommended for you',
    showMatchingGyms: 'Show me matching gyms →',
    closeWithoutFiltering: 'Close without filtering',
  },
};

const hu: Dictionary = {
  meta: {
    title: 'Harcművészeti Klubkereső Budapest',
    description: 'Harcművészeti termek Budapesten — Karate, BJJ, Boksz, Thai boksz, MMA',
  },
  header: {
    title: 'Harcművészeti Klubkereső',
    tagline: (count: number) => `Budapest · ${count} terem`,
    recommended: 'Ajánlott:',
  },
  common: {
    gymsCount: (n: number) => `${n} terem`,
    gymsCountOf: (n: number, total: number) => `${n} / ${total} terem`,
    district: (roman: string) => `${roman}. kerület`,
    districtShort: (roman: string) => `${roman}. ker.`,
    from: 'Mininum',
    perMonth: '/hó',
    perMonthFull: '/hónap',
    call: 'Hívás',
    email: 'Email',
    facebook: 'Facebook',
    instagram: 'Instagram',
    visitWebsite: 'Weboldal megnyitása →',
    demoDataNotice: '🧪 Demo adat — az ár és az elérhetőségek nem valódiak, csak helykitöltők.',
    firstTraining: 'Első edzés',
    bring: 'Hozz magaddal:',
    schedule: 'Edzésrend',
    todayAt: (times: string) => `Ma: ${times}`,
    noSessionToday: 'Ma nincs edzés',
    save: 'Mentés',
    remove: 'Eltávolítás',
    back: '← Vissza',
    noResults: 'Nincs a szűrésnek megfelelő terem.',
    myLocation: 'Saját helyzetem',
    nearMe: 'A közelemben',
    sortedByDistance: 'Távolság szerint rendezve',
    sortByDistanceFromMe: 'Rendezés távolság szerint',
    fromYou: 'tőled',
    mapLoadError: 'A Google Térkép betöltése sikertelen. Ellenőrizd az API kulcsot.',
    mapLoading: 'Térkép betöltése…',
    clearSearch: 'Keresés törlése',
    intensity: 'Intenzitás',
    searchPlaceholder: 'Terem keresése…',
  },
  filters: {
    style: 'Stílus',
    tags: 'Címkék',
    today: 'Ma',
    beginners: 'Kezdőknek',
    findMyStyle: 'Milyen stílus illik hozzám?',
    clearAll: 'Szűrők törlése',
    district: 'Kerület',
    districtCount: (n: number) => `${n} kerület`,
  },
  mobileSheet: {
    filters: 'Szűrők',
    clear: 'Törlés',
    search: 'Keresés',
    searchPlaceholder: 'Név, cím…',
    availability: 'Elérhetőség',
    trainingToday: 'Ma van edzés',
    savedGymsOnly: (count: number) => `Csak mentett termek${count > 0 ? ` (${count})` : ''}`,
    timeOfDay: 'Napszak',
    district: 'Kerület',
    sportType: 'Sportág',
    gymType: 'Terem jellege',
    showGyms: (count: number) => `Termek mutatása${count > 0 ? ` · ${count} aktív` : ''}`,
  },
  gymList: {
    whatToExpect: 'Mire számíts',
    hideDetails: 'Részletek elrejtése',
  },
  quiz: {
    title: 'Találd Meg a Stílusod',
    subtitle: 'Fedezd fel, melyik harcművészet illik hozzád',
    questionOf: (step: number, total: number) => `${step}. kérdés / ${total}`,
    back: '← Vissza',
    recommendedForYou: 'Neked ezt ajánljuk',
    showMatchingGyms: 'Mutasd a hozzáillő termeket →',
    closeWithoutFiltering: 'Bezárás szűrés nélkül',
  },
};

export const dict: Record<Lang, Dictionary> = { en, hu };

// ─────────────────────────── Context ───────────────────────────
interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: typeof en;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'hu') setLangState(stored);
    } catch {
      // localStorage not available
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'hu' : 'en');
  }, [lang, setLang]);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, toggleLang, t: dict[lang] }),
    [lang, setLang, toggleLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
