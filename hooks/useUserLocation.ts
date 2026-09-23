import { useCallback, useState } from 'react';

export interface LatLng {
  lat: number;
  lng: number;
}

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);

  const locate = useCallback((onSuccess?: (loc: LatLng) => void) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocating(false);
        onSuccess?.(loc);
      },
      () => {
        setLocating(false);
        alert('Location permission denied.');
      }
    );
  }, []);

  return { userLocation, locating, locate };
}
