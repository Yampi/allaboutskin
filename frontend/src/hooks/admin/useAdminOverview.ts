import { useState, useCallback, useEffect } from 'react';
import {
  fetchAdminSystemHealth,
  fetchAdminStores,
  fetchAdminSecurityStats,
  fetchAdminSecurityLogs,
  SecurityAuditLogItem,
} from '@/lib/api';

interface OverviewData {
  systemHealth: { database: string; ingredient_dataset: string };
  totalUsersCount: number;
  totalStoresCount: number;
  pendingStoresCount: number;
  criticalEventsCount: number;
  securityLogs: SecurityAuditLogItem[];
}

export function useAdminOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      const [healthRes, storesRes, statsRes, logsRes] = await Promise.all([
        fetchAdminSystemHealth(),
        fetchAdminStores({ per_page: 1 }),
        fetchAdminSecurityStats(),
        fetchAdminSecurityLogs({ page: 1 }),
      ]);
      const health = healthRes.health ?? {};
      setData({
        systemHealth: {
          database: health.database_connected ? 'connected' : 'disconnected',
          ingredient_dataset: (health.total_ingredients ?? 0) > 0 ? 'loaded' : 'empty',
        },
        totalUsersCount: health.total_users ?? 0,
        totalStoresCount: storesRes.summary?.total_stores ?? 0,
        pendingStoresCount: storesRes.summary?.pending_review ?? 0,
        criticalEventsCount: statsRes.stats?.critical_events_count ?? 0,
        securityLogs: logsRes.data ?? [],
      });
    } catch (err) {
      setData(null);
      setLoadError(err instanceof Error ? err.message : 'No se pudo cargar el resumen de administración');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reload = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    return fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { data, isLoading, loadError, reload };
}
