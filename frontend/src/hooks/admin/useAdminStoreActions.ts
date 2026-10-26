import { useState, useCallback } from 'react';
import {
  fetchAdminStoreDetail,
  updateAdminStoreVerification,
  updateAdminStoreSubscription,
  toggleAdminStoreStatus,
  quickUpdateAdminStore,
  deleteAdminStore,
} from '@/lib/api';

export function useAdminStoreActions(
  onReload: () => Promise<void>,
  onNotify?: (type: 'success' | 'error', message: string) => void
) {
  const [inspectingStore, setInspectingStore] = useState<any | null>(null);
  const [isLoadingStoreDetail, setIsLoadingStoreDetail] = useState(false);
  const [storeProductSearch, setStoreProductSearch] = useState('');
  const [storeActiveTab, setStoreActiveTab] = useState<'products' | 'branches' | 'analytics'>('products');
  const [rejectModalStore, setRejectModalStore] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [tierModalStore, setTierModalStore] = useState<any | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('FREE');
  const [selectedFeatured, setSelectedFeatured] = useState<boolean>(false);
  const [deleteModalStore, setDeleteModalStore] = useState<any | null>(null);
  const [isDeletingStore, setIsDeletingStore] = useState(false);
  const [quickCountryEditStore, setQuickCountryEditStore] = useState<any | null>(null);

  const handleInspectStore = useCallback(async (store: any) => {
    setInspectingStore(store);
    setStoreProductSearch('');
    setStoreActiveTab('products');
    setIsLoadingStoreDetail(true);
    try {
      const res = await fetchAdminStoreDetail(store.id);
      if (res?.store) setInspectingStore(res.store);
    } catch (err: any) {
      console.error('Error al cargar detalle de tienda:', err);
    } finally {
      setIsLoadingStoreDetail(false);
    }
  }, []);

  const handleApproveStore = useCallback(async (storeId: number) => {
    try {
      await updateAdminStoreVerification(storeId, { verification_status: 'VERIFIED' });
      onNotify?.('success', '¡Comercio verificado y activado!');
      await onReload();
      if (inspectingStore?.id === storeId) {
        setInspectingStore((prev: any) => (prev ? { ...prev, verification_status: 'VERIFIED', is_active: true } : null));
      }
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al verificar tienda');
    }
  }, [onReload, inspectingStore, onNotify]);

  const handleConfirmRejectStore = useCallback(async () => {
    if (!rejectModalStore) return;
    try {
      await updateAdminStoreVerification(rejectModalStore.id, {
        verification_status: 'REJECTED',
        rejected_reason: rejectReason || 'Información incompleta',
      });
      onNotify?.('success', 'Comercio rechazado.');
      setRejectModalStore(null);
      setRejectReason('');
      await onReload();
      if (inspectingStore?.id === rejectModalStore.id) setInspectingStore(null);
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al rechazar tienda');
    }
  }, [rejectModalStore, rejectReason, onReload, inspectingStore, onNotify]);

  const handleConfirmUpdateTier = useCallback(async () => {
    if (!tierModalStore) return;
    try {
      await updateAdminStoreSubscription(tierModalStore.id, {
        subscription_tier: selectedTier as any,
        is_featured: selectedFeatured,
      });
      onNotify?.('success', `Plan actualizado a ${selectedTier}`);
      setTierModalStore(null);
      await onReload();
      if (inspectingStore?.id === tierModalStore.id) {
        setInspectingStore((prev: any) => (prev ? { ...prev, subscription_tier: selectedTier, is_featured: selectedFeatured } : null));
      }
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al actualizar suscripción');
    }
  }, [tierModalStore, selectedTier, selectedFeatured, onReload, inspectingStore, onNotify]);

  const handleToggleStoreStatus = useCallback(async (storeId: number) => {
    try {
      const res = await toggleAdminStoreStatus(storeId);
      onNotify?.('success', res.message || 'Estado modificado');
      await onReload();
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al modificar estado');
    }
  }, [onReload, onNotify]);

  const handleConfirmDeleteStore = useCallback(async () => {
    if (!deleteModalStore) return;
    setIsDeletingStore(true);
    try {
      const res = await deleteAdminStore(deleteModalStore.id);
      onNotify?.('success', res.message || 'Tienda eliminada permanentemente.');
      setDeleteModalStore(null);
      await onReload();
      if (inspectingStore?.id === deleteModalStore.id) setInspectingStore(null);
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al eliminar tienda');
    } finally {
      setIsDeletingStore(false);
    }
  }, [deleteModalStore, onReload, inspectingStore, onNotify]);

  const handleQuickUpdateStoreCountry = useCallback(async (storeId: number, code: string, name?: string, flag?: string) => {
    try {
      const res = await quickUpdateAdminStore(storeId, { country_code: code, country_name: name, country_flag: flag });
      onNotify?.('success', res.message || `País actualizado a ${code}`);
      setQuickCountryEditStore(null);
      await onReload();
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al actualizar país');
    }
  }, [onReload, onNotify]);

  return {
    inspectingStore,
    setInspectingStore,
    isLoadingStoreDetail,
    storeProductSearch,
    setStoreProductSearch,
    storeActiveTab,
    setStoreActiveTab,
    rejectModalStore,
    setRejectModalStore,
    rejectReason,
    setRejectReason,
    tierModalStore,
    setTierModalStore,
    selectedTier,
    setSelectedTier,
    selectedFeatured,
    setSelectedFeatured,
    deleteModalStore,
    setDeleteModalStore,
    isDeletingStore,
    quickCountryEditStore,
    setQuickCountryEditStore,
    handleInspectStore,
    handleApproveStore,
    handleConfirmRejectStore,
    handleConfirmUpdateTier,
    handleToggleStoreStatus,
    handleConfirmDeleteStore,
    handleQuickUpdateStoreCountry,
  };
}
