import { useState, useCallback } from 'react';
import { fetchAdminSecurityLogs, fetchAdminSecurityStats, SecurityAuditLogItem } from '@/lib/api';

export function useAdminSecurity(onNotify?: (type: 'success' | 'error', message: string) => void) {
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLogItem[]>([]);
  const [securityStats, setSecurityStats] = useState<any | null>(null);
  const [logSeverityFilter, setLogSeverityFilter] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadSecurityData = useCallback(async (page?: number) => {
    setIsLoading(true);
    const targetPage = page ?? logPage;
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetchAdminSecurityLogs({ page: targetPage, severity: logSeverityFilter || undefined }),
        fetchAdminSecurityStats(),
      ]);
      setSecurityLogs(logsRes.data || []);
      setLogTotalPages(logsRes.last_page || 1);
      setSecurityStats(statsRes.stats || null);
      if (page) setLogPage(page);
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al cargar logs de seguridad');
    } finally {
      setIsLoading(false);
    }
  }, [logPage, logSeverityFilter, onNotify]);

  return {
    securityLogs,
    securityStats,
    logSeverityFilter,
    setLogSeverityFilter,
    logPage,
    setLogPage,
    logTotalPages,
    isLoading,
    loadSecurityData,
  };
}
