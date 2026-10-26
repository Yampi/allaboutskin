import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, SkinProfileData, StoredUser } from '@/lib/api';
import { fetchProfileStrict, fetchSkinScansStrict, SkinScansSummary } from '@/lib/userDashboardApi';

interface MiPielData {
  profile: SkinProfileData | null;
  scans: SkinScansSummary;
}

export function useMiPiel() {
  const [user, setUser] = useState<StoredUser | null | undefined>(undefined);
  const [data, setData] = useState<MiPielData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [profile, scans] = await Promise.all([fetchProfileStrict(), fetchSkinScansStrict()]);
      setData({ profile, scans });
      setError(null);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : 'No se pudo cargar tu perfil dermatológico');
    }
  }, []);

  const reload = useCallback(() => {
    setData(null);
    setError(null);
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    if (current?.token) fetchData();
  }, [fetchData]);

  return { user, data, error, reload };
}
