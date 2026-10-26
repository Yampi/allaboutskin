import { useState, useCallback, useEffect } from 'react';
import {
  fetchAdminNotificationSummary,
  fetchAdminCrawlerSummary,
  AdminNotificationSummary,
  CrawlerSummaryData,
} from '@/lib/api';

export function useAdminB2BMetrics() {
  const [summary, setSummary] = useState<AdminNotificationSummary | null>(null);
  const [crawler, setCrawler] = useState<CrawlerSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [notif, scraper] = await Promise.all([
        fetchAdminNotificationSummary(),
        fetchAdminCrawlerSummary(24),
      ]);
      setSummary(notif);
      setCrawler(scraper.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las métricas B2B');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { summary, crawler, error, reload: load };
}
