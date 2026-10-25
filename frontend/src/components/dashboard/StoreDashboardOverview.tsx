'use client';

import React from 'react';
import { BusinessAnalyticsData, BusinessStoreProfile } from '@/lib/api';
import StoreOverviewKpis from '@/components/empresa/overview/StoreOverviewKpis';
import StoreOverviewDemandGap from '@/components/empresa/overview/StoreOverviewDemandGap';
import StoreOverviewWaGenerator from '@/components/empresa/overview/StoreOverviewWaGenerator';
import StoreOverviewInventoryCards from '@/components/empresa/overview/StoreOverviewInventoryCards';

interface StoreDashboardOverviewProps {
  store: BusinessStoreProfile | null;
  analytics: BusinessAnalyticsData | null;
  onNavigateTab: (tab: 'catalog' | 'branches' | 'profile') => void;
  branchCount: number;
}

export default function StoreDashboardOverview({
  store,
  analytics,
  onNavigateTab,
  branchCount,
}: StoreDashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <StoreOverviewKpis analytics={analytics} onNavigateTab={onNavigateTab} />
      <StoreOverviewDemandGap analytics={analytics} onNavigateTab={onNavigateTab} />
      <StoreOverviewWaGenerator store={store} />
      <StoreOverviewInventoryCards
        analytics={analytics}
        branchCount={branchCount}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
}
