import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import gymsData from '../data/gyms.json';
import { Gym } from '../types/gym';
import Filters from '../components/Filters';
import GymList from '../components/GymList';

// Disable SSR for Map because Google Maps requires browser APIs
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

  const gyms = gymsData as Gym[];

  const filteredGyms = useMemo(
    () =>
      gyms.filter(
        (gym) =>
          selectedSports.length === 0 ||
          gym.sport.some((s) => selectedSports.includes(s))
      ),
    [gyms, selectedSports]
  );

  const handleGymSelect = (gym: Gym | null) => {
    setSelectedGym(gym);
  };

  const handleSportsChange = (sports: string[]) => {
    setSelectedSports(sports);
    // Deselect gym if it no longer matches new filters
    if (
      selectedGym &&
      sports.length > 0 &&
      !selectedGym.sport.some((s) => sports.includes(s))
    ) {
      setSelectedGym(null);
    }
  };

  return (
    <>
      <Head>
        <title>Martial Arts Finder Budapest</title>
        <meta
          name="description"
          content="Find martial arts gyms in Budapest — Karate, BJJ, Boxing, Muay Thai, MMA"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex flex-col h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-gray-900 text-white px-5 py-3 flex items-center gap-3 shadow-md shrink-0">
          <span className="text-2xl" role="img" aria-label="martial arts">
            🥋
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight">
              Martial Arts Finder
            </h1>
            <p className="text-xs text-gray-400 leading-tight">
              Discover gyms in Budapest
            </p>
          </div>
        </header>

        {/* Filter bar */}
        <Filters selectedSports={selectedSports} onChange={handleSportsChange} />

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-72 xl:w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 shrink-0">
              <p className="text-xs text-gray-500">
                {filteredGyms.length === gyms.length
                  ? `${gyms.length} gyms in Budapest`
                  : `${filteredGyms.length} of ${gyms.length} gyms`}
              </p>
            </div>
            <div className="overflow-y-auto flex-1">
              <GymList
                gyms={filteredGyms}
                selectedGym={selectedGym}
                onGymSelect={handleGymSelect}
              />
            </div>
          </aside>

          {/* Map */}
          <main className="flex-1 overflow-hidden">
            <Map
              gyms={filteredGyms}
              selectedGym={selectedGym}
              onGymSelect={handleGymSelect}
            />
          </main>
        </div>
      </div>
    </>
  );
}
