'use client';

import React from 'react';
import { BusinessAnalyticsData } from '@/lib/api';
import StoreAnalyticsKpis from './StoreAnalyticsKpis';
import StoreBranchPerformanceList from './StoreBranchPerformanceList';
import StoreVitrinaBoosterCard from './StoreVitrinaBoosterCard';

interface StoreAnalyticsTabProps {
  analytics: BusinessAnalyticsData | null;
  firstBranchSlug?: string;
  onCopySlug?: (slug: string) => void;
  isCopied?: boolean;
}

export default function StoreAnalyticsTab({
  analytics,
  firstBranchSlug,
  onCopySlug,
  isCopied,
}: StoreAnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <StoreAnalyticsKpis analytics={analytics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StoreBranchPerformanceList
            branchesPerformance={analytics?.branches_performance}
          />
        </div>
        <div>
          <StoreVitrinaBoosterCard
            firstBranchSlug={firstBranchSlug}
            onCopySlug={onCopySlug}
            isCopied={isCopied}
          />
        </div>
      </div>
    </div>
  );
}
