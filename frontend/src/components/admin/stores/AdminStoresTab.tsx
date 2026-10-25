import React, { useEffect } from 'react';
import AdminStoresKpis from './AdminStoresKpis';
import AdminStoresFilters from './AdminStoresFilters';
import AdminStoresGroupedList from './AdminStoresGroupedList';
import AdminStoreMasterHeader from './AdminStoreMasterHeader';
import AdminStoreProductGrid from './AdminStoreProductGrid';
import AdminStoresTable from './AdminStoresTable';
import AdminStoreInspectDrawer from './AdminStoreInspectDrawer';
import AdminStoreRejectModal from './AdminStoreRejectModal';
import AdminStoreTierModal from './AdminStoreTierModal';
import AdminStoreDeleteModal from './AdminStoreDeleteModal';
import AdminStoreCountryPopover from './AdminStoreCountryPopover';
import { useAdminStores } from '@/hooks/admin/useAdminStores';
import { useAdminStoreActions } from '@/hooks/admin/useAdminStoreActions';

interface AdminStoresTabProps {
  onNotify?: (type: 'success' | 'error', message: string) => void;
  onInspectOffer?: (offer: any) => void;
}

export default function AdminStoresTab({ onNotify, onInspectOffer }: AdminStoresTabProps) {
  const storeHook = useAdminStores(onNotify);
  const actionHook = useAdminStoreActions(() => storeHook.loadStores(), onNotify);

  useEffect(() => {
    storeHook.loadStores();
  }, [
    storeHook.storePage,
    storeHook.storeStatusFilter,
    storeHook.storeTierFilter,
    storeHook.storeCountryFilter,
    storeHook.storeViewMode,
  ]);

  return (
    <div className="space-y-4">
      <AdminStoresKpis summary={storeHook.storeSummary} />

      <AdminStoresFilters
        search={storeHook.storeSearch}
        onSearchChange={storeHook.setStoreSearch}
        statusFilter={storeHook.storeStatusFilter}
        onStatusFilterChange={storeHook.setStoreStatusFilter}
        tierFilter={storeHook.storeTierFilter}
        onTierFilterChange={storeHook.setStoreTierFilter}
        countryFilter={storeHook.storeCountryFilter}
        onCountryFilterChange={storeHook.setStoreCountryFilter}
        viewMode={storeHook.storeViewMode}
        onViewModeChange={storeHook.setStoreViewMode}
        onSearchSubmit={() => storeHook.loadStores()}
        totalStoresCount={storeHook.stores.length}
      />

      {storeHook.storeViewMode === 'grouped' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <AdminStoresGroupedList
              stores={storeHook.stores}
              selectedStoreId={storeHook.selectedGroupedStoreId}
              onSelectStore={storeHook.handleSelectGroupedStore}
            />
          </div>

          <div className="lg:col-span-2 space-y-4 flex flex-col">
            <AdminStoreMasterHeader
              storeDetail={storeHook.groupedStoreDetail}
              onApprove={actionHook.handleApproveStore}
              onRejectModal={actionHook.setRejectModalStore}
              onTierModal={actionHook.setTierModalStore}
              onDeleteModal={actionHook.setDeleteModalStore}
              onCountryModal={actionHook.setQuickCountryEditStore}
            />

            <AdminStoreProductGrid
              products={storeHook.groupedStoreDetail?.offers || []}
              search={storeHook.groupedProductSearch}
              onSearchChange={storeHook.setGroupedProductSearch}
              stockFilter={storeHook.groupedStockFilter}
              onStockFilterChange={storeHook.setGroupedStockFilter}
              isLoading={storeHook.isLoadingGroupedStore}
              onInspectOffer={onInspectOffer}
            />
          </div>
        </div>
      ) : (
        <AdminStoresTable
          stores={storeHook.stores}
          onInspect={actionHook.handleInspectStore}
          onApprove={actionHook.handleApproveStore}
          onRejectModal={actionHook.setRejectModalStore}
          onTierModal={actionHook.setTierModalStore}
          onDeleteModal={actionHook.setDeleteModalStore}
        />
      )}

      {/* Modals & Drawer */}
      <AdminStoreInspectDrawer
        store={actionHook.inspectingStore}
        onClose={() => actionHook.setInspectingStore(null)}
        isLoading={actionHook.isLoadingStoreDetail}
      />

      <AdminStoreRejectModal
        store={actionHook.rejectModalStore}
        reason={actionHook.rejectReason}
        onReasonChange={actionHook.setRejectReason}
        onConfirm={actionHook.handleConfirmRejectStore}
        onClose={() => actionHook.setRejectModalStore(null)}
      />

      <AdminStoreTierModal
        store={actionHook.tierModalStore}
        selectedTier={actionHook.selectedTier}
        onTierChange={actionHook.setSelectedTier}
        selectedFeatured={actionHook.selectedFeatured}
        onFeaturedChange={actionHook.setSelectedFeatured}
        onConfirm={actionHook.handleConfirmUpdateTier}
        onClose={() => actionHook.setTierModalStore(null)}
      />

      <AdminStoreDeleteModal
        store={actionHook.deleteModalStore}
        isDeleting={actionHook.isDeletingStore}
        onConfirm={actionHook.handleConfirmDeleteStore}
        onClose={() => actionHook.setDeleteModalStore(null)}
      />

      <AdminStoreCountryPopover
        store={actionHook.quickCountryEditStore}
        onUpdateCountry={actionHook.handleQuickUpdateStoreCountry}
        onClose={() => actionHook.setQuickCountryEditStore(null)}
      />
    </div>
  );
}
