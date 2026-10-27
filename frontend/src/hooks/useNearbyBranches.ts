'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchNearbyStores } from '@/lib/api';
import { StoreBranchInfo } from '@/types/stores';

export interface CityPreset {
  name: string;
  shortName: string;
  lat: number;
  lng: number;
}

export const PRESET_CITIES: CityPreset[] = [
  { name: 'Caracas, Venezuela', shortName: 'Caracas', lat: 10.4812, lng: -66.8611 },
  { name: 'Valle de la Pascua, Guárico', shortName: 'Valle de la Pascua', lat: 9.2152, lng: -66.0098 },
  { name: 'Maracay, Aragua', shortName: 'Maracay', lat: 10.2541, lng: -67.6012 },
];

export const SEARCH_RADIUS_METERS = 15000;

// 'asking': esperando respuesta del permiso; 'gps': ubicación real; 'city': ciudad elegida a mano;
// 'denied': el usuario negó el permiso o el navegador no lo soporta
export type LocationStatus = 'asking' | 'gps' | 'city' | 'denied';

const GPS_LOCATION: Omit<CityPreset, 'lat' | 'lng'> = { name: 'Tu ubicación actual', shortName: 'tu zona' };

export function useNearbyBranches() {
  const [location, setLocation] = useState<CityPreset>(PRESET_CITIES[0]);
  const [status, setStatus] = useState<LocationStatus>('asking');
  const [branches, setBranches] = useState<StoreBranchInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  const requestGps = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('denied');
      return;
    }
    setStatus('asking');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ ...GPS_LOCATION, lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('gps');
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const selectCity = useCallback((city: CityPreset) => {
    setLocation(city);
    setStatus('city');
  }, []);

  // Al entrar en la página pedimos la ubicación automáticamente
  useEffect(() => {
    requestGps();
  }, [requestGps]);

  // Mientras se espera el permiso no consultamos nada, para no mostrar tiendas de otra ciudad
  useEffect(() => {
    if (status === 'asking') return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchNearbyStores(location.lat, location.lng, SEARCH_RADIUS_METERS)
      .then((res) => {
        if (!cancelled) setBranches(res?.nearby_branches ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setBranches([]);
          setError('No pudimos cargar las tiendas. Revisa tu conexión e inténtalo de nuevo.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [location, status, reloadKey]);

  return { location, status, branches, isLoading: isLoading || status === 'asking', error, retry, requestGps, selectCity };
}
