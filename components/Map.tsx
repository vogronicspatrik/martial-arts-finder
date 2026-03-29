import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { Gym } from '../types/gym';

const BUDAPEST_CENTER = { lat: 47.4979, lng: 19.0402 };
const DEFAULT_ZOOM = 12;

const SPORT_BADGE: Record<string, string> = {
  Karate: 'bg-red-100 text-red-700',
  BJJ: 'bg-blue-100 text-blue-700',
  Boxing: 'bg-orange-100 text-orange-700',
  'Muay Thai': 'bg-purple-100 text-purple-700',
  MMA: 'bg-green-100 text-green-700',
};

interface MapProps {
  gyms: Gym[];
  selectedGym: Gym | null;
  onGymSelect: (gym: Gym | null) => void;
}

export default function Map({ gyms, selectedGym, onGymSelect }: MapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    map.addListener('idle', () => setMapReady(true));
  }, []);

  useEffect(() => {
    if (selectedGym && mapRef.current) {
      mapRef.current.panTo({ lat: selectedGym.lat, lng: selectedGym.lng });
      mapRef.current.setZoom(15);
    }
  }, [selectedGym]);

  const handleMyLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        mapRef.current?.setZoom(14);
      },
      () => alert('Unable to retrieve your location.')
    );
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm">
        Failed to load Google Maps. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Loading map…
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={BUDAPEST_CENTER}
        zoom={DEFAULT_ZOOM}
        onLoad={onMapLoad}
        onClick={() => onGymSelect(null)}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: true }}
      >
        {mapReady && gyms.map((gym) => (
          <Marker
            key={gym.id}
            position={{ lat: gym.lat, lng: gym.lng }}
            onClick={(e) => { e.stop(); onGymSelect(gym); }}
          />
        ))}

        {mapReady && selectedGym && (
          <InfoWindow
            position={{ lat: selectedGym.lat, lng: selectedGym.lng }}
            onCloseClick={() => onGymSelect(null)}
          >
            <div className="max-w-xs font-sans">
              <h3 className="font-bold text-sm text-gray-900 leading-snug mb-1">
                {selectedGym.name}
              </h3>
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedGym.sport.map((s) => (
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
              <p className="text-xs text-gray-600 mb-1">{selectedGym.address}</p>
              <p className="text-xs text-gray-700 mb-2">{selectedGym.description}</p>
              {selectedGym.website && (
                <a
                  href={selectedGym.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Visit Website →
                </a>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <button
        onClick={handleMyLocation}
        title="Use my location"
        className="absolute bottom-10 right-3 bg-white shadow-md border border-gray-200 rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
      >
        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
        </svg>
        My Location
      </button>
    </div>
  );
}
