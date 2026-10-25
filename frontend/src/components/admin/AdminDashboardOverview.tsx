'use client';

import React from 'react';
import AdminOverviewKpis from './overview/AdminOverviewKpis';
import AdminActivityFeed from './overview/AdminActivityFeed';
import AdminNodeHealth from './overview/AdminNodeHealth';
import AdminB2BIntelligence from './overview/AdminB2BIntelligence';
import { AdminTabKey } from './layout/AdminSidebar';

interface AdminDashboardOverviewProps {
  onNavigateTab: (tab: AdminTabKey) => void;
  systemHealth?: {
    database?: string;
    ingredient_dataset?: string;
  } | null;
  totalStoresCount?: number;
  totalUsersCount?: number;
  pendingStoresCount?: number;
  criticalEventsCount?: number;
  realActivityLogs?: Array<{
    id: number;
    event_type: string;
    description: string;
    severity: string;
    created_at: string;
    ip_address?: string | null;
  }>;
}

export default function AdminDashboardOverview({
  onNavigateTab,
  systemHealth,
  totalStoresCount = 0,
  totalUsersCount = 0,
  pendingStoresCount = 0,
  criticalEventsCount = 0,
  realActivityLogs = [],
}: AdminDashboardOverviewProps) {
  const isHealthy = systemHealth?.database === 'connected';

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <AdminOverviewKpis
        totalUsersCount={totalUsersCount}
        totalStoresCount={totalStoresCount}
        pendingStoresCount={pendingStoresCount}
        criticalEventsCount={criticalEventsCount}
        isHealthy={isHealthy}
        onNavigateTab={onNavigateTab}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <AdminActivityFeed
            logs={realActivityLogs}
            onNavigateTab={onNavigateTab}
          />
        </div>
        <div>
          <AdminNodeHealth
            systemHealth={systemHealth}
            onNavigateTab={onNavigateTab}
          />
        </div>
      </div>

      <AdminB2BIntelligence />
    </div>
  );
}
