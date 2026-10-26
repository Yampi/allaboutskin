'use client';

import React from 'react';
import AdminOverviewKpis from './overview/AdminOverviewKpis';
import AdminActivityFeed from './overview/AdminActivityFeed';
import AdminNodeHealth from './overview/AdminNodeHealth';
import AdminB2BIntelligence from './overview/AdminB2BIntelligence';
import ErrorState from '@/components/system/ErrorState';
import { AdminTabKey } from './layout/AdminSidebar';
import { useAdminOverview } from '@/hooks/admin/useAdminOverview';

interface AdminDashboardOverviewProps {
  onNavigateTab: (tab: AdminTabKey) => void;
}

export default function AdminDashboardOverview({ onNavigateTab }: AdminDashboardOverviewProps) {
  const { data, isLoading, loadError, reload } = useAdminOverview();

  if (loadError) {
    return <ErrorState message={loadError} onRetry={reload} />;
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-16 text-xs font-semibold text-slate-500">
        Cargando resumen...
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <AdminOverviewKpis
        totalUsersCount={data.totalUsersCount}
        totalStoresCount={data.totalStoresCount}
        pendingStoresCount={data.pendingStoresCount}
        criticalEventsCount={data.criticalEventsCount}
        isHealthy={data.systemHealth.database === 'connected'}
        onNavigateTab={onNavigateTab}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <AdminActivityFeed
            logs={data.securityLogs}
            onNavigateTab={onNavigateTab}
          />
        </div>
        <div>
          <AdminNodeHealth
            systemHealth={data.systemHealth}
            onNavigateTab={onNavigateTab}
          />
        </div>
      </div>

      <AdminB2BIntelligence />
    </div>
  );
}
