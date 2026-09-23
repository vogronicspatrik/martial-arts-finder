import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import gymsData from '../data/gyms.json';
import { Gym, TimeOfDay, TIME_OF_DAY_TEST } from '../types/gym';
import Filters from '../components/Filters';
import GymList from '../components/GymList';
import Quiz from '../components/Quiz';
import BottomSheet from '../components/BottomSheet';
import MobileFilterSheet from '../components/MobileFilterSheet';
import GymDetailCard from '../components/GymDetailCard';
import SearchBar from '../components/SearchBar';
import { useBookmarks } from '../hooks/useBookmarks';
import { useIsMobile } from '../hooks/useIsMobile';
import { useUserLocation } from '../hooks/useUserLocation';
import { matchesSearch, distanceKm, hourOf, getTodayName } from '../lib/utils';
import { useLanguage, DAY_LABEL } from '../lib/i18n';
import gymsHuData from '../data/gyms.hu.json';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

type GymHuOverlay = Partial<Pick<Gym, 'description' | 'firstTrainingInfo' | 'equipmentNeeded' | 'priceNote'>>;
const gymsHu = gymsHuData as Record<string, GymHuOverlay>;

export default function Home() {
  const isMobile = useIsMobile();
  const { t, lang, toggleLang } = useLanguage();

  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [hoveredGymId, setHoveredGymId] = useState<string | null>(null);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [quizRecommendation, setQuizRecommendation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState<number[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('any');

  const { bookmarks, toggle: toggleBookmark, isBookmarked } = useBookmarks();
  const { userLocation, locate } = useUserLocation();
  const baseGyms = gymsData as Gym[];
  const gyms = useMemo(
    () => (lang === 'hu' ? baseGyms.map((g) => ({ ...g, ...gymsHu[g.id] })) : baseGyms),
    [lang, baseGyms]
  );
  const today = getTodayName();
  const todayLabel = DAY_LABEL[lang][today];

  const allDistricts = useMemo(
    () => Array.from(new Set(gyms.map((g) => g.district).filter((d): d is number => !!d))).sort((a, b) => a - b),
    [gyms]
  );

  const filteredGyms = useMemo(() => {
    const filtered = gyms.filter((gym) => {
      if (selectedSports.length > 0 && !gym.sport.some((s) => selectedSports.includes(s))) return false;
      if (selectedTags.length > 0 && !selectedTags.every((t) => gym.tags?.includes(t))) return false;
      if (showTodayOnly && !gym.schedule?.some((s) => s.day === today)) return false;
      if (showSavedOnly && !bookmarks.includes(gym.id)) return false;
      if (selectedDistricts.length > 0 && (!gym.district || !selectedDistricts.includes(gym.district))) return false;
      if (timeOfDay !== 'any' && !gym.schedule?.some((s) => TIME_OF_DAY_TEST[timeOfDay](hourOf(s.time)))) return false;
      if (!matchesSearch(gym, searchQuery)) return false;
      return true;
    });

    if (userLocation) {
      return [...filtered].sort(
        (a, b) => distanceKm(userLocation, { lat: a.lat, lng: a.lng }) - distanceKm(userLocation, { lat: b.lat, lng: b.lng })
      );
    }
    return filtered;
  }, [gyms, selectedSports, selectedTags, showTodayOnly, showSavedOnly, bookmarks, today, selectedDistricts, timeOfDay, searchQuery, userLocation]);

  const handleSportsChange = (sports: string[]) => {
    setSelectedSports(sports);
    if (selectedGym && sports.length > 0 && !selectedGym.sport.some((s) => sports.includes(s)))
      setSelectedGym(null);
  };

  const handleQuizComplete = (sports: string[]) => {
    setSelectedSports(sports);
    setQuizRecommendation(sports.join(' + '));
    setShowQuiz(false);
  };

  const activeFilterCount =
    selectedSports.length +
    selectedTags.length +
    (showTodayOnly ? 1 : 0) +
    (showSavedOnly ? 1 : 0) +
    selectedDistricts.length +
    (timeOfDay !== 'any' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleNearMe = () => locate();

  return (
    <>
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

        {/* Link-preview tags for group chats (WhatsApp/Messenger/FB) */}
        <meta property="og:title" content={t.meta.title} />
        <meta property="og:description" content={t.meta.description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={t.meta.title} />
        <meta name="twitter:description" content={t.meta.description} />

        {/* Friends-test build: keep it out of search results for now. */}
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* ─────────────────────────── MOBILE ── */}
      {isMobile ? (
        <div className="relative h-screen w-screen overflow-hidden" style={{ background: '#0B0B0B' }}>
          {/* Full-screen map */}
          <div className="absolute inset-0">
            <Map
              gyms={filteredGyms}
              selectedGym={selectedGym}
              hoveredGymId={hoveredGymId}
              onGymSelect={setSelectedGym}
              userLocation={userLocation}
              onLocate={handleNearMe}
            />
          </div>

          {/* Mobile top bar */}
          <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-3 pb-2 flex items-center gap-2">
            {/* Search / logo pill */}
            <div
              className="flex items-center gap-2 flex-1 min-w-0 h-11 px-3 rounded-full"
              style={{ background: 'rgba(20,20,20,0.92)', border: '1px solid #2A2A2A', backdropFilter: 'blur(8px)' }}
            >
              <span className="text-base shrink-0">🔎</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.common.searchPlaceholder}
                className="flex-1 min-w-0 bg-transparent outline-none text-sm text-ink-100 placeholder:text-ink-600"
              />
              {quizRecommendation && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full truncate font-medium"
                  style={{ background: 'rgba(201,106,61,0.2)', color: '#C96A3D', border: '1px solid rgba(201,106,61,0.3)' }}
                >
                  {quizRecommendation}
                </span>
              )}
            </div>

            {/* Near me */}
            <button
              onClick={handleNearMe}
              title={userLocation ? t.common.sortedByDistance : t.common.sortByDistanceFromMe}
              className="h-11 w-11 flex items-center justify-center rounded-full text-lg"
              style={{
                background: userLocation ? '#C96A3D' : 'rgba(20,20,20,0.92)',
                border: userLocation ? '1px solid #C96A3D' : '1px solid #2A2A2A',
                backdropFilter: 'blur(8px)',
              }}
            >
              📍
            </button>

            {/* Filter */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="h-11 px-4 flex items-center gap-1.5 rounded-full font-display font-semibold text-sm uppercase tracking-wide"
              style={{
                background: activeFilterCount > 0 ? '#C96A3D' : 'rgba(20,20,20,0.92)',
                border: activeFilterCount > 0 ? '1px solid #C96A3D' : '1px solid #2A2A2A',
                color: activeFilterCount > 0 ? '#0B0B0B' : '#F0EDE8',
                backdropFilter: 'blur(8px)',
              }}
            >
              ⚙️{activeFilterCount > 0 ? ` ${activeFilterCount}` : ''}
            </button>
          </div>

          {/* Quiz FAB */}
          {!selectedGym && (
            <div className="absolute top-16 right-3 z-20 pt-1">
              <button
                onClick={() => setShowQuiz(true)}
                className="h-10 px-4 rounded-full font-display font-semibold text-xs uppercase tracking-widest"
                style={{ background: '#C96A3D', color: '#0B0B0B', boxShadow: '0 4px 16px rgba(201,106,61,0.4)' }}
              >
                {t.filters.findMyStyle}
              </button>
            </div>
          )}

          {/* Language toggle */}
          {!selectedGym && (
            <div className="absolute top-16 left-3 z-20 pt-1">
              <button
                onClick={toggleLang}
                className="h-10 px-3.5 rounded-full font-display font-semibold text-xs uppercase tracking-widest"
                style={{ background: 'rgba(20,20,20,0.92)', border: '1px solid #2A2A2A', backdropFilter: 'blur(8px)', color: '#F0EDE8' }}
              >
                🌐 {lang === 'en' ? 'HU' : 'EN'}
              </button>
            </div>
          )}

          {/* Gym detail or bottom sheet */}
          {selectedGym ? (
            <GymDetailCard
              gym={selectedGym}
              isBookmarked={isBookmarked(selectedGym.id)}
              onBookmarkToggle={toggleBookmark}
              onClose={() => setSelectedGym(null)}
              userLocation={userLocation}
            />
          ) : (
            <BottomSheet gymCount={filteredGyms.length} totalCount={gyms.length}>
              <GymList
                gyms={filteredGyms}
                selectedGym={selectedGym}
                onGymSelect={setSelectedGym}
                onGymHover={setHoveredGymId}
                bookmarks={bookmarks}
                onBookmarkToggle={toggleBookmark}
                userLocation={userLocation}
              />
            </BottomSheet>
          )}

          {showMobileFilters && (
            <MobileFilterSheet
              selectedSports={selectedSports}
              onSportsChange={handleSportsChange}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              showTodayOnly={showTodayOnly}
              onTodayToggle={() => setShowTodayOnly((v) => !v)}
              showSavedOnly={showSavedOnly}
              onSavedToggle={() => setShowSavedOnly((v) => !v)}
              savedCount={bookmarks.length}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              allDistricts={allDistricts}
              selectedDistricts={selectedDistricts}
              onDistrictsChange={setSelectedDistricts}
              timeOfDay={timeOfDay}
              onTimeOfDayChange={setTimeOfDay}
              onClose={() => setShowMobileFilters(false)}
            />
          )}
        </div>
      ) : (
        /* ──────────────────────── DESKTOP ── */
        <div className="flex flex-col h-screen" style={{ background: '#0B0B0B' }}>
          {/* Header */}
          <header
            className="px-6 py-3 flex items-center gap-4 shrink-0"
            style={{ background: '#0B0B0B', borderBottom: '1px solid #1E1E1E' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🥋</span>
              <div>
                <h1 className="font-display font-bold text-lg text-ink-100 uppercase tracking-widest leading-tight">
                  {t.header.title}
                </h1>
                <p className="text-xs text-ink-600 leading-tight">{t.header.tagline(gyms.length)}</p>
              </div>
            </div>

            {/* Quiz recommendation badge */}
            {quizRecommendation && (
              <div
                className="flex items-center gap-2 ml-4 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(201,106,61,0.15)', border: '1px solid rgba(201,106,61,0.3)' }}
              >
                <span className="text-xs text-ink-400">{t.header.recommended}</span>
                <span className="text-xs font-semibold" style={{ color: '#C96A3D' }}>{quizRecommendation}</span>
                <button
                  onClick={() => { setQuizRecommendation(null); setSelectedSports([]); }}
                  className="text-xs text-ink-600 hover:text-ink-400"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="ml-auto flex items-center gap-1.5 text-xs font-display font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide transition-all"
              style={{ background: '#1E1E1E', border: '1px solid #2A2A2A', color: '#C8C4BE' }}
            >
              🌐 {lang === 'en' ? 'HU' : 'EN'}
            </button>
          </header>

          {/* Filter bar */}
          <Filters
            selectedSports={selectedSports}
            onSportsChange={handleSportsChange}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            showTodayOnly={showTodayOnly}
            onTodayToggle={() => setShowTodayOnly((v) => !v)}
            showSavedOnly={showSavedOnly}
            onSavedToggle={() => setShowSavedOnly((v) => !v)}
            savedCount={bookmarks.length}
            onOpenQuiz={() => setShowQuiz(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            allDistricts={allDistricts}
            selectedDistricts={selectedDistricts}
            onDistrictsChange={setSelectedDistricts}
            timeOfDay={timeOfDay}
            onTimeOfDayChange={setTimeOfDay}
            onNearMe={handleNearMe}
            sortingByDistance={!!userLocation}
          />

          {/* Main */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <aside
              className="w-72 xl:w-80 flex flex-col overflow-hidden shrink-0"
              style={{ borderRight: '1px solid #1E1E1E' }}
            >
              <div
                className="px-4 py-2 flex items-center justify-between shrink-0"
                style={{ borderBottom: '1px solid #1E1E1E', background: '#0D0D0D' }}
              >
                <p className="font-display text-xs font-semibold text-ink-600 uppercase tracking-widest">
                  {filteredGyms.length === gyms.length
                    ? t.common.gymsCount(gyms.length)
                    : t.common.gymsCountOf(filteredGyms.length, gyms.length)}
                </p>
                {showTodayOnly && (
                  <span className="text-xs font-medium text-green-500">📅 {todayLabel}</span>
                )}
              </div>
              <div className="overflow-y-auto flex-1" style={{ background: '#0B0B0B' }}>
                <GymList
                  gyms={filteredGyms}
                  selectedGym={selectedGym}
                  onGymSelect={setSelectedGym}
                  onGymHover={setHoveredGymId}
                  bookmarks={bookmarks}
                  onBookmarkToggle={toggleBookmark}
                  userLocation={userLocation}
                />
              </div>
            </aside>

            {/* Map */}
            <main className="flex-1 overflow-hidden">
              <Map
                gyms={filteredGyms}
                selectedGym={selectedGym}
                userLocation={userLocation}
                onLocate={handleNearMe}
                hoveredGymId={hoveredGymId}
                onGymSelect={setSelectedGym}
              />
            </main>
          </div>
        </div>
      )}

      {showQuiz && (
        <Quiz onComplete={handleQuizComplete} onClose={() => setShowQuiz(false)} />
      )}
    </>
  );
}
