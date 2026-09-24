import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { Gym, SPORT_BADGE, INTENSITY_COLOR, SPORT_MARKER_COLOR, TagType } from '../types/gym';
import { formatPrice, getTodayName, todaysSchedule } from '../lib/utils';
import { LatLng } from '../hooks/useUserLocation';
import { useLanguage, TAG_LABEL, INTENSITY_SHORT } from '../lib/i18n';
import { GymRatingStats } from '../hooks/useReviews';
import ReviewBadge from './ReviewBadge';

const BUDAPEST_CENTER = { lat: 47.4979, lng: 19.0402 };
const DEFAULT_ZOOM = 12;

const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0B0B0B' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B0B0B' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4A4744' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1E1E1E' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#8A8480' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#9A8E7D' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0D1310' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#2E4A2E' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1C1C1C' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111111' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#4A4744' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#252525' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#181818' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#5A5754' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#060608' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1E1C1A' }] },
];

interface MapProps {
  gyms: Gym[];
  selectedGym: Gym | null;
  hoveredGymId: string | null;
  onGymSelect: (gym: Gym | null) => void;
  userLocation?: LatLng | null;
  onLocate: () => void;
  ratingsByGym?: Record<string, GymRatingStats>;
  onOpenReviews?: (gym: Gym) => void;
  onRequestTrial?: (gym: Gym) => void;
}

function getMarkerIcon(
  gym: Gym,
  isSelected: boolean,
  isHovered: boolean
): google.maps.Symbol {
  const baseColor = gym.sport[0] ? (SPORT_MARKER_COLOR[gym.sport[0]] ?? '#C96A3D') : '#C96A3D';

  if (isSelected) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 14,
      fillColor: '#F2B632',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2.5,
    };
  }
  if (isHovered) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 11,
      fillColor: '#C96A3D',
      fillOpacity: 1,
      strokeColor: '#F2B632',
      strokeWeight: 2,
    };
  }
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: baseColor,
    fillOpacity: 0.9,
    strokeColor: '#0B0B0B',
    strokeWeight: 1.5,
  };
}

export default function Map({
  gyms,
  selectedGym,
  hoveredGymId,
  onGymSelect,
  userLocation,
  onLocate,
  ratingsByGym,
  onOpenReviews,
  onRequestTrial,
}: MapProps) {
  const { t, lang } = useLanguage();
  const today = getTodayName();
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

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(14);
    }
  }, [userLocation]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 text-sm bg-surface">
        {t.common.mapLoadError}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-ink-400 text-sm bg-surface">
        {t.common.mapLoading}
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
        options={{
          styles: DARK_MAP_STYLE,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
        }}
      >
        {mapReady && gyms.map((gym) => {
          const isSelected = selectedGym?.id === gym.id;
          const isHovered = hoveredGymId === gym.id && !isSelected;
          return (
            <Marker
              key={gym.id}
              position={{ lat: gym.lat, lng: gym.lng }}
              onClick={(e) => { e.stop(); onGymSelect(gym); }}
              icon={getMarkerIcon(gym, isSelected, isHovered)}
              zIndex={isSelected ? 10 : isHovered ? 5 : 1}
            />
          );
        })}

        {mapReady && selectedGym && (
          <InfoWindow
            position={{ lat: selectedGym.lat, lng: selectedGym.lng }}
            onCloseClick={() => onGymSelect(null)}
          >
            <div className="font-body w-64 p-4">
              <h3 className="font-display font-semibold text-sm text-ink-100 leading-snug mb-1 uppercase tracking-wide">
                {selectedGym.name}
              </h3>

              {onOpenReviews && (
                <ReviewBadge
                  stats={ratingsByGym?.[selectedGym.id]}
                  onClick={() => onOpenReviews(selectedGym)}
                  className="mb-2 inline-block"
                />
              )}

              <div className="flex flex-wrap gap-1 mb-2">
                {selectedGym.sport.map((s) => (
                  <span key={s} className={`text-xs px-2 py-0.5 rounded font-medium ${SPORT_BADGE[s] ?? 'bg-surface-3 text-ink-200'}`}>
                    {s}
                  </span>
                ))}
                {selectedGym.intensityLevel && (
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${INTENSITY_COLOR[selectedGym.intensityLevel]}`}>
                    {INTENSITY_SHORT[lang][selectedGym.intensityLevel]}
                  </span>
                )}
              </div>

              <p className="text-xs text-ink-400 mb-2">{selectedGym.address}</p>

              {todaysSchedule(selectedGym, today).length > 0 && (
                <p className="text-xs font-semibold mb-2" style={{ color: '#27AE60' }}>
                  📅 {t.common.todayAt(todaysSchedule(selectedGym, today).map((s) => s.time).join(', '))}
                </p>
              )}

              <p className="text-xs text-ink-200 mb-3 leading-relaxed">{selectedGym.description}</p>

              {selectedGym.firstTrainingInfo && (
                <div className="rounded-lg px-3 py-2 mb-3" style={{ background: 'rgba(201,106,61,0.12)', border: '1px solid rgba(201,106,61,0.25)' }}>
                  <p className="text-xs font-semibold text-accent mb-0.5">{t.common.firstTraining}</p>
                  <p className="text-xs text-ink-200">{selectedGym.firstTrainingInfo}</p>
                </div>
              )}

              {selectedGym.tags && selectedGym.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {selectedGym.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-surface-3 text-ink-400 border border-surface-4">
                      {TAG_LABEL[lang][tag as TagType]}
                    </span>
                  ))}
                </div>
              )}

              {selectedGym.priceFrom && (
                <p className="text-xs text-ink-200 mb-2">
                  <span className="text-ink-400">{t.common.from}</span>{' '}
                  <span className="font-semibold" style={{ color: '#F2B632' }}>{formatPrice(selectedGym.priceFrom)}{t.common.perMonth}</span>
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                {selectedGym.phone && (
                  <a href={`tel:${selectedGym.phone.replace(/\s/g, '')}`} className="text-xs text-ink-400 hover:text-accent transition-colors">
                    📞 {selectedGym.phone}
                  </a>
                )}
                {selectedGym.facebook && (
                  <a href={selectedGym.facebook} target="_blank" rel="noopener noreferrer" className="text-xs text-ink-400 hover:text-accent transition-colors">
                    {t.common.facebook}
                  </a>
                )}
                {selectedGym.instagram && (
                  <a href={selectedGym.instagram} target="_blank" rel="noopener noreferrer" className="text-xs text-ink-400 hover:text-accent transition-colors">
                    {t.common.instagram}
                  </a>
                )}
              </div>

              {(selectedGym.priceFrom || selectedGym.phone || selectedGym.facebook || selectedGym.instagram) && (
                <p className="text-[11px] text-ink-600 mb-2">{t.common.demoDataNotice}</p>
              )}

              {onRequestTrial && (
                <button
                  onClick={() => onRequestTrial(selectedGym)}
                  className="block w-full text-center text-xs font-display font-semibold py-2.5 rounded-lg transition-all uppercase tracking-wide mb-2"
                  style={{ background: '#C96A3D', color: '#0B0B0B' }}
                >
                  {t.trial.cta}
                </button>
              )}

              {selectedGym.website && (
                <a
                  href={selectedGym.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-light transition-colors"
                >
                  {t.common.visitWebsite}
                </a>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* My Location button */}
      <button
        onClick={onLocate}
        title={t.common.myLocation}
        className="absolute bottom-8 right-3 h-11 px-4 flex items-center gap-2 rounded-full text-sm font-semibold transition-all"
        style={{
          background: '#141414',
          border: '1px solid #2A2A2A',
          color: '#F0EDE8',
          boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
        }}
      >
        <span>📍</span>
        <span className="hidden sm:inline">{t.common.nearMe}</span>
      </button>
    </div>
  );
}
