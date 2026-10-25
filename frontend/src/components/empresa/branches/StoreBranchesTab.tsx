'use client';

import React from 'react';
import { BusinessBranchItem } from '@/lib/api';
import StoreBranchQuotaAlert from './StoreBranchQuotaAlert';
import StoreBranchesList from './StoreBranchesList';

interface StoreBranchesTabProps {
  branches: BusinessBranchItem[];
  maxBranches: number;
  tierLabel?: string;
  onAddBranch: () => void;
  onEditBranch: (b: BusinessBranchItem) => void;
  onDeleteBranch: (id: number) => void;
  onCopySlug: (slug: string) => void;
  copiedSlug: string | null;
}

export default function StoreBranchesTab({
  branches,
  maxBranches,
  tierLabel,
  onAddBranch,
  onEditBranch,
  onDeleteBranch,
  onCopySlug,
  copiedSlug,
}: StoreBranchesTabProps) {
  return (
    <div className="space-y-4">
      <StoreBranchQuotaAlert
        currentCount={branches.length}
        maxAllowed={maxBranches}
        tierLabel={tierLabel}
        onAddBranch={onAddBranch}
      />

      <StoreBranchesList
        branches={branches}
        onEdit={onEditBranch}
        onDelete={onDeleteBranch}
        onCopySlug={onCopySlug}
        copiedSlug={copiedSlug}
      />
    </div>
  );
}
