import { useState, useCallback } from 'react';
import { fetchAdminStores, fetchAdminStoreDetail, AdminStoreItem } from '@/lib/api';

export function useAdminStores(onNotify?: (type: 'success' | 'error', message: string) => void) {
  const [stores, setStores] = useState<AdminStoreItem[]>([]);
  const [storeSummary, setStoreSummary] = useState<any | null>(null);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeStatusFilter, setStoreStatusFilter] = useState('');
  const [storeTierFilter, setStoreTierFilter] = useState('');
  const [storeCountryFilter, setStoreCountryFilter] = useState('');
  const [storePage, setStorePage] = useState(1);
  const [storeTotalPages, setStoreTotalPages] = useState(1);
  const [storeViewMode, setStoreViewMode] = useState<'grouped' | 'table'>('grouped');
  const [isLoading, setIsLoading] = useState(false);

  // Grouped selection
  const [selectedGroupedStoreId, setSelectedGroupedStoreId] = useState<number | null>(null);
  const [groupedStoreDetail, setGroupedStoreDetail] = useState<any | null>(null);
  const [isLoadingGroupedStore, setIsLoadingGroupedStore] = useState(false);
  const [groupedProductSearch, setGroupedProductSearch] = useState('');
  const [groupedStockFilter, setGroupedStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');

  const loadGroupedStoreDetail = useCallback(async (storeId: number) => {
    setIsLoadingGroupedStore(true);
    try {
      const res = await fetchAdminStoreDetail(storeId);
      if (res?.store) setGroupedStoreDetail(res.store);
    } catch (err: any) {
      console.error('Error al cargar detalle de tienda:', err);
    } finally {
      setIsLoadingGroupedStore(false);
    }
  }, []);

  const handleSelectGroupedStore = useCallback((store: AdminStoreItem) => {
    setSelectedGroupedStoreId(store.id);
    setGroupedProductSearch('');
    setGroupedStockFilter('ALL');
    loadGroupedStoreDetail(store.id);
  }, [loadGroupedStoreDetail]);

  const loadStores = useCallback(async (targetIdToSelect?: number, page?: number) => {
    setIsLoading(true);
    const targetPage = page ?? storePage;
    try {
      const res = await fetchAdminStores({
        page: targetPage,
        per_page: storeViewMode === 'grouped' ? 50 : 15,
        search: storeSearch.trim() || undefined,
        verification_status: storeStatusFilter || undefined,
        subscription_tier: storeTierFilter || undefined,
        country_code: storeCountryFilter || undefined,
      });
      const storeList = res.stores?.data || [];
      setStores(storeList);
      setStoreTotalPages(res.stores?.last_page || 1);
      if (res.summary) setStoreSummary(res.summary);
      if (page) setStorePage(page);

      if (storeList.length > 0) {
        const idToSelect = targetIdToSelect
          ?? (selectedGroupedStoreId && storeList.some((s) => s.id === selectedGroupedStoreId) ? selectedGroupedStoreId : null)
          ?? (storeList.find((s) => (s.product_offers_count || (s as any).total_offers_count || 0) > 0)?.id || storeList[0].id);

        if (idToSelect) {
          setSelectedGroupedStoreId(idToSelect);
          loadGroupedStoreDetail(idToSelect);
        }
      } else {
        setSelectedGroupedStoreId(null);
        setGroupedStoreDetail(null);
      }
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al cargar tiendas');
    } finally {
      setIsLoading(false);
    }
  }, [storePage, storeViewMode, storeSearch, storeStatusFilter, storeTierFilter, storeCountryFilter, selectedGroupedStoreId, loadGroupedStoreDetail, onNotify]);

  return {
    stores,
    storeSummary,
    storeSearch,
    setStoreSearch,
    storeStatusFilter,
    setStoreStatusFilter,
    storeTierFilter,
    setStoreTierFilter,
    storeCountryFilter,
    setStoreCountryFilter,
    storePage,
    setStorePage,
    storeTotalPages,
    storeViewMode,
    setStoreViewMode,
    isLoading,
    selectedGroupedStoreId,
    groupedStoreDetail,
    isLoadingGroupedStore,
    groupedProductSearch,
    setGroupedProductSearch,
    groupedStockFilter,
    setGroupedStockFilter,
    loadStores,
    handleSelectGroupedStore,
    loadGroupedStoreDetail,
  };
}
