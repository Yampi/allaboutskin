import React, { useEffect } from 'react';
import AdminSecurityKpis from './AdminSecurityKpis';
import AdminSecurityFilters from './AdminSecurityFilters';
import AdminSecurityLogsTable from './AdminSecurityLogsTable';
import { useAdminSecurity } from '@/hooks/admin/useAdminSecurity';

interface AdminSecurityTabProps {
  onNotify?: (type: 'success' | 'error', message: string) => void;
}

export default function AdminSecurityTab({ onNotify }: AdminSecurityTabProps) {
  const {
    securityLogs,
    securityStats,
    logSeverityFilter,
    setLogSeverityFilter,
    logPage,
    setLogPage,
    logTotalPages,
    isLoading,
    loadSecurityData,
  } = useAdminSecurity(onNotify);

  useEffect(() => {
    loadSecurityData();
  }, [loadSecurityData]);

  return (
    <div className="space-y-4">
      <AdminSecurityKpis stats={securityStats} />

      <AdminSecurityFilters
        severityFilter={logSeverityFilter}
        onSeverityFilterChange={setLogSeverityFilter}
        onRefresh={() => loadSecurityData(1)}
        isLoading={isLoading}
      />

      <AdminSecurityLogsTable logs={securityLogs} />
    </div>
  );
}
