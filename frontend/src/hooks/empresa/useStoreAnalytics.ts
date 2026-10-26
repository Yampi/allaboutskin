import { useState, useCallback, useEffect } from 'react';
import { fetchBusinessAnalytics, BusinessAnalyticsData } from '@/lib/api';

export function useStoreAnalytics(enabled: boolean = true) {
  const [analytics, setAnalytics] = useState<BusinessAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadAnalytics = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const res = await fetchBusinessAnalytics();
      setAnalytics(res);
    } catch (err: any) {
      console.error('Error al cargar analíticas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) loadAnalytics();
  }, [enabled, loadAnalytics]);

  return {
    analytics,
    isLoading,
    loadAnalytics,
  };
}
