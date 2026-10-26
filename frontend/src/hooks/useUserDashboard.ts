import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logUserRoutineAdherence, SkinProfileData, StoredUser } from '@/lib/api';
import {
  fetchProfileStrict,
  fetchTodayRoutineStrict,
  fetchRoutineStatsStrict,
  fetchSkinScansStrict,
  fetchStoresStrict,
  fetchNearbyBranchesStrict,
  NearbyBranch,
  PublicStore,
  RoutineStats,
  SkinScansSummary,
  TodayRoutine,
} from '@/lib/userDashboardApi';

export interface Section<T> {
  status: 'loading' | 'ready' | 'error';
  data: T | null;
  error: string | null;
}

const loading = <T,>(): Section<T> => ({ status: 'loading', data: null, error: null });

async function load<T>(fn: () => Promise<T>): Promise<Section<T>> {
  try {
    return { status: 'ready', data: await fn(), error: null };
  } catch (err) {
    return { status: 'error', data: null, error: err instanceof Error ? err.message : 'Error al cargar los datos' };
  }
}

export function useUserDashboard() {
  // undefined = aún no se ha leído la sesión (evita parpadear el aviso de "inicia sesión").
  const [user, setUser] = useState<StoredUser | null | undefined>(undefined);
  const [profile, setProfile] = useState<Section<SkinProfileData | null>>(loading);
  const [routine, setRoutine] = useState<Section<TodayRoutine>>(loading);
  const [stats, setStats] = useState<Section<RoutineStats>>(loading);
  const [scans, setScans] = useState<Section<SkinScansSummary>>(loading);
  const [stores, setStores] = useState<Section<PublicStore[]>>(loading);
  const [nearby, setNearby] = useState<Section<NearbyBranch[]> | null>(null);

  const fetchAll = useCallback(async () => {
    const [p, r, s, sc, st] = await Promise.all([
      load(fetchProfileStrict),
      load(fetchTodayRoutineStrict),
      load(fetchRoutineStatsStrict),
      load(fetchSkinScansStrict),
      load(fetchStoresStrict),
    ]);
    setProfile(p);
    setRoutine(r);
    setStats(s);
    setScans(sc);
    setStores(st);
  }, []);

  const reload = useCallback(() => {
    setProfile(loading());
    setRoutine(loading());
    setStats(loading());
    setScans(loading());
    setStores(loading());
    return fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    if (current?.token) fetchAll();
  }, [fetchAll]);

  // La ubicación solo se pide cuando la persona lo solicita.
  const locateNearby = useCallback(() => {
    if (!navigator.geolocation) {
      setNearby({ status: 'error', data: null, error: 'Tu navegador no permite obtener la ubicación.' });
      return;
    }
    setNearby(loading());
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setNearby(await load(() => fetchNearbyBranchesStrict(pos.coords.latitude, pos.coords.longitude)));
      },
      () => setNearby({ status: 'error', data: null, error: 'No se pudo obtener tu ubicación. Revisa el permiso del navegador.' }),
      { timeout: 10000 }
    );
  }, []);

  // Registra el cumplimiento de todo el turno (AM o PM) y refresca rutina y racha desde la API.
  const completeSlot = useCallback(async (slot: 'AM' | 'PM') => {
    await logUserRoutineAdherence({ slot });
    const [r, s] = await Promise.all([load(fetchTodayRoutineStrict), load(fetchRoutineStatsStrict)]);
    setRoutine(r);
    setStats(s);
  }, []);

  return { user, profile, routine, stats, scans, stores, nearby, reload, locateNearby, completeSlot };
}
