import { API_BASE_URL, apiFetch, getAuthHeaders, SkinProfileData, UserSkinScanItem } from './api';

// Lecturas estrictas para el dashboard de usuario: ante un error lanzan ApiError,
// sin recurrir a localStorage ni a datos de ejemplo.

export interface RoutineItem {
  id: number;
  slot: 'AM' | 'PM';
  cycle_type: string;
  custom_name: string | null;
  opened_at: string | null;
  product?: {
    name: string;
    pao_months: number | null;
    dosage_per_application_ml: number | null;
    texture_type: string | null;
    recommended_timing: string | null;
    brand?: { name: string } | null;
  } | null;
  notes?: string | null;
}

export interface TodayRoutine {
  date: string;
  skin_cycling_phase: 'EXFOLIATION' | 'RETINOID' | 'RECOVERY_1' | 'RECOVERY_2' | string;
  skin_cycling_label: string;
  am_routine: { is_completed: boolean; items: RoutineItem[] };
  pm_routine: { is_completed: boolean; items: RoutineItem[] };
}

export interface RoutineStats {
  current_streak_days: number;
  compliance_percentage_last_30_days: number;
  total_routines_completed: number;
}

export interface SkinScansSummary {
  total_scans: number;
  latest_scan: UserSkinScanItem | null;
  scans: UserSkinScanItem[];
}

export interface PublicStore {
  id: number;
  name: string;
  country_name?: string;
  in_stock_offers_count: number;
  total_offers_count: number;
  branches_count: number;
}

export interface NearbyBranch {
  id: number;
  name: string;
  slug: string;
  store_name: string;
  city: string | null;
  state: string | null;
  distance_meters: number;
}

const authed = () => ({ headers: getAuthHeaders(), cache: 'no-store' as const });

// El backend responde 404/204 cuando aún no hay perfil: se trata como "sin datos", no como error.
export async function fetchProfileStrict(): Promise<SkinProfileData | null> {
  try {
    const res = await apiFetch<{ data: SkinProfileData | null }>(`${API_BASE_URL}/profile`, authed());
    return res.data ?? null;
  } catch (err) {
    if ((err as { code?: string }).code === 'NOT_FOUND') return null;
    throw err;
  }
}

export async function fetchTodayRoutineStrict(): Promise<TodayRoutine> {
  const res = await apiFetch<{ data: TodayRoutine }>(`${API_BASE_URL}/routine/today`, authed());
  return res.data;
}

export async function fetchRoutineStatsStrict(): Promise<RoutineStats> {
  const res = await apiFetch<{ data: RoutineStats }>(`${API_BASE_URL}/routine/stats`, authed());
  return res.data;
}

export async function fetchSkinScansStrict(): Promise<SkinScansSummary> {
  const res = await apiFetch<{ total_scans: number; latest_scan: UserSkinScanItem | null; scans: UserSkinScanItem[] }>(
    `${API_BASE_URL}/user/skin-scans`,
    authed()
  );
  return { total_scans: res.total_scans, latest_scan: res.latest_scan, scans: res.scans ?? [] };
}

export async function fetchStoresStrict(): Promise<PublicStore[]> {
  const res = await apiFetch<{ stores: PublicStore[] }>(`${API_BASE_URL}/stores`, { cache: 'no-store' });
  return res.stores ?? [];
}

export async function fetchNearbyBranchesStrict(lat: number, lng: number): Promise<NearbyBranch[]> {
  const res = await apiFetch<{ nearby_branches: NearbyBranch[] }>(
    `${API_BASE_URL}/stores/nearby?lat=${lat}&lng=${lng}&radius_meters=15000`,
    { cache: 'no-store' }
  );
  return res.nearby_branches ?? [];
}
