'use client';

import React from 'react';
import { StoreTabKey } from './StoreSidebar';
import StoreDashboardOverview from '@/components/dashboard/StoreDashboardOverview';
import StoreAnalyticsTab from '@/components/empresa/analytics/StoreAnalyticsTab';
import StoreCatalogTab from '@/components/empresa/catalog/StoreCatalogTab';
import StoreBranchesTab from '@/components/empresa/branches/StoreBranchesTab';
import StoreProfileTab from '@/components/empresa/profile/StoreProfileTab';
import { useStoreProfile } from '@/hooks/empresa/useStoreProfile';
import { useStoreAnalytics } from '@/hooks/empresa/useStoreAnalytics';
import { useStoreOffers } from '@/hooks/empresa/useStoreOffers';
import { useStoreBranches } from '@/hooks/empresa/useStoreBranches';

interface StoreEmpresaTabsProps {
  activeTab: StoreTabKey;
  onTabChange: (tab: StoreTabKey) => void;
  profile: ReturnType<typeof useStoreProfile>;
  analytics: ReturnType<typeof useStoreAnalytics>;
  offers: ReturnType<typeof useStoreOffers>;
  branches: ReturnType<typeof useStoreBranches>;
  onOpenAddOffer: () => void;
  onOpenImport: () => void;
  onAddBranch: () => void;
  onEditBranch: (b: any) => void;
}

export default function StoreEmpresaTabs({
  activeTab,
  onTabChange,
  profile,
  analytics,
  offers,
  branches,
  onOpenAddOffer,
  onOpenImport,
  onAddBranch,
  onEditBranch,
}: StoreEmpresaTabsProps) {
  const firstSlug = branches.branches[0]?.slug;

  return (
    <>
      {activeTab === 'inicio' && (
        <StoreDashboardOverview
          store={profile.store}
          analytics={analytics.analytics}
          onNavigateTab={onTabChange}
          branchCount={branches.branches.length}
        />
      )}
      {activeTab === 'analytics' && (
        <StoreAnalyticsTab
          analytics={analytics.analytics}
          firstBranchSlug={firstSlug}
          onCopySlug={profile.copyStorefrontLink}
          isCopied={profile.copiedSlug === firstSlug}
        />
      )}
      {activeTab === 'catalog' && (
        <StoreCatalogTab
          exchangeRate={offers.exchangeRateInput}
          onRateChange={offers.setExchangeRateInput}
          onApplyRate={offers.handleUpdateExchangeRate}
          isUpdatingRate={offers.isUpdatingRate}
          searchQuery={offers.catalogSearch}
          onSearchChange={offers.setCatalogSearch}
          onSearchSubmit={() => offers.loadOffers()}
          branches={branches.branches}
          selectedBranch={offers.selectedBranchFilter}
          onBranchChange={offers.setSelectedBranchFilter}
          selectedStock={offers.selectedStockFilter}
          onStockChange={(val) => offers.setSelectedStockFilter(val as any)}
          onOpenImportModal={onOpenImport}
          onOpenAddModal={onOpenAddOffer}
          offers={offers.offers}
          loadError={offers.loadError}
          onReload={() => offers.loadOffers()}
          onToggleStock={(o) => offers.handleToggleStock(o.id, o.in_stock)}
          onDeleteOffer={offers.handleDeleteOffer}
          currentPage={offers.offersPage}
          totalPages={offers.offersTotalPages}
          onPageChange={(p) => offers.loadOffers(p)}
        />
      )}
      {activeTab === 'branches' && (
        <StoreBranchesTab
          branches={branches.branches}
          maxBranches={branches.maxBranches}
          tierLabel={profile.store?.subscription_tier_label}
          onAddBranch={onAddBranch}
          onEditBranch={onEditBranch}
          onDeleteBranch={branches.handleDeleteBranch}
          onCopySlug={profile.copyStorefrontLink}
          copiedSlug={profile.copiedSlug}
        />
      )}
      {activeTab === 'profile' && (
        <StoreProfileTab
          store={profile.store}
          onSaveProfile={profile.handleSaveProfile}
          isSaving={profile.isSavingProfile}
        />
      )}
    </>
  );
}
