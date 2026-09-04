'use client';

import { useState, useEffect, useCallback } from 'react';
import { StoreBranchInfo, NearbyStoresResponse } from '@/types/stores';

const DISMISS_STORAGE_KEY = 'allaboutskin_store_banner_dismissed';

export function useStorePresence() {
  const [isInsideStore, setIsInsideStore] = useState<boolean>(false);
  const [currentStore, setCurrentStore] = useState<StoreBranchInfo | null>(null);
  const [nearbyBranches, setNearbyBranches] = useState<StoreBranchInfo[]>([]);
  const [catalogCount, setCatalogCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(true); // Comienza true para evitar flash hasta montar
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

  // Verificar si ya fue descartado en esta sesión
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem(DISMISS_STORAGE_KEY);
      setIsDismissed(dismissed === 'true');
    }
  }, []);

  const checkProximity = useCallback(async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/stores/nearby?lat=${lat}&lng=${lng}&radius_meters=5000`);
      if (res.ok) {
        const data: NearbyStoresResponse = await res.json();
        setIsInsideStore(data.is_inside_store);
        setCurrentStore(data.current_store);
        setNearbyBranches(data.nearby_branches || []);
        setCatalogCount(data.in_store_catalog_count || 0);
      }
    } catch {
      // Silencioso para no perturbar la navegación si falla la red
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setHasLocationPermission(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setHasLocationPermission(true);
        checkProximity(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setHasLocationPermission(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, [checkProximity]);

  // Chequeo pasivo inicial si el permiso ya fue concedido previamente
  useEffect(() => {
    if (typeof window !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          if (result.state === 'granted') {
            setHasLocationPermission(true);
            requestLocation();
          }
        })
        .catch(() => {});
    }
  }, [requestLocation]);

  const dismissBanner = useCallback(() => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(DISMISS_STORAGE_KEY, 'true');
    }
  }, []);

  // Función para simular estar en una tienda de Valle de la Pascua (ideal para pruebas y selector manual)
  const simulateStore = useCallback((branch: StoreBranchInfo) => {
    setIsInsideStore(true);
    setCurrentStore({ ...branch, is_inside: true, distance_meters: 0 });
    setCatalogCount(3);
    setIsDismissed(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(DISMISS_STORAGE_KEY);
    }
  }, []);

  return {
    isInsideStore,
    currentStore,
    nearbyBranches,
    catalogCount,
    isLoading,
    isDismissed,
    hasLocationPermission,
    dismissBanner,
    requestLocation,
    simulateStore,
  };
}
