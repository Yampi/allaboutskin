'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStoreProfile } from '@/hooks/empresa/useStoreProfile';
import { useStoreAnalytics } from '@/hooks/empresa/useStoreAnalytics';
import { useStoreOffers } from '@/hooks/empresa/useStoreOffers';
import { useStoreBranches } from '@/hooks/empresa/useStoreBranches';
import { useStoreBulkImport } from '@/hooks/empresa/useStoreBulkImport';
import StoreToast from '@/components/empresa/layout/StoreToast';
import StoreSidebar, { StoreTabKey } from '@/components/empresa/layout/StoreSidebar';
import StoreTopbar from '@/components/empresa/layout/StoreTopbar';
import StoreNavTabs from '@/components/empresa/layout/StoreNavTabs';
import StoreMobileNav from '@/components/empresa/layout/StoreMobileNav';
import StoreOnboardingView from '@/components/empresa/onboarding/StoreOnboardingView';
import StoreEmpresaTabs from '@/components/empresa/layout/StoreEmpresaTabs';
import StoreEmpresaModals from '@/components/empresa/layout/StoreEmpresaModals';

function BusinessDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as StoreTabKey | null;
  const claimParam = searchParams.get('claim') || '';

  const [activeTab, setActiveTab] = useState<StoreTabKey>(() =>
    ['analytics', 'catalog', 'branches', 'profile'].includes(tabParam || '') ? (tabParam as StoreTabKey) : 'inicio'
  );
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const profile = useStoreProfile(showToast);
  const analytics = useStoreAnalytics();
  const branches = useStoreBranches(showToast);
  const offers = useStoreOffers(showToast);
  const importer = useStoreBulkImport(() => offers.loadOffers(), showToast);

  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);

  useEffect(() => {
    if (tabParam && ['analytics', 'catalog', 'branches', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab('inicio');
    }
  }, [tabParam]);

  const handleTabChange = (tab: StoreTabKey) => {
    setActiveTab(tab);
    router.replace(tab === 'inicio' ? '/dashboard/empresa' : `/dashboard/empresa?tab=${tab}`, { scroll: false });
  };

  if (profile.isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-3">
        <div className="w-7 h-7 border-2 border-[#4A6B5B] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Cargando portal comercial...</p>
      </div>
    );
  }

  if (profile.hasStore === false) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-8">
        <StoreToast toast={toast} />
        <StoreOnboardingView
          initialClaimSlug={claimParam}
          onRegister={profile.handleRegisterStore}
          onClaim={(payload) => profile.handleClaimStore(Number(payload.store_slug) || 0)}
          isSubmitting={profile.isOnboardingSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex text-slate-900 pb-16 lg:pb-0">
      <StoreToast toast={toast} />
      <StoreSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        storeName={profile.store?.name}
        storeSlug={branches.branches[0]?.slug}
      />

      <main className="flex-1 min-w-0 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-5">
        <StoreTopbar store={profile.store} branchSlug={branches.branches[0]?.slug} />
        <StoreNavTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <StoreEmpresaTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          profile={profile}
          analytics={analytics}
          offers={offers}
          branches={branches}
          onOpenAddOffer={() => setShowAddOfferModal(true)}
          onOpenImport={() => importer.setShowImportModal(true)}
          onAddBranch={() => {
            setEditingBranch(null);
            setShowBranchModal(true);
          }}
          onEditBranch={(b) => {
            setEditingBranch(b);
            setShowBranchModal(true);
          }}
        />
      </main>

      <StoreMobileNav activeTab={activeTab} onTabChange={handleTabChange} />

      <StoreEmpresaModals
        showAddOfferModal={showAddOfferModal}
        setShowAddOfferModal={setShowAddOfferModal}
        showBranchModal={showBranchModal}
        setShowBranchModal={setShowBranchModal}
        editingBranch={editingBranch}
        offers={offers}
        branches={branches}
        importer={importer}
      />
    </div>
  );
}

export default function BusinessDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-3">
          <div className="w-7 h-7 border-2 border-[#4A6B5B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Cargando portal comercial...</p>
        </div>
      }
    >
      <BusinessDashboardContent />
    </Suspense>
  );
}
