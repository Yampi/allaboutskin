import { useState, useCallback, useEffect } from 'react';
import {
  fetchBusinessBranches,
  createBusinessBranch,
  updateBusinessBranch,
  deleteBusinessBranch,
  BusinessBranchItem,
} from '@/lib/api';

export function useStoreBranches(onToast?: (type: 'success' | 'error', message: string) => void) {
  const [branches, setBranches] = useState<BusinessBranchItem[]>([]);
  const [maxBranches, setMaxBranches] = useState<number>(3);
  const [editingBranch, setEditingBranch] = useState<BusinessBranchItem | null>(null);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadBranchesList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchBusinessBranches();
      setBranches(res.branches || []);
      if (res.max_allowed) setMaxBranches(res.max_allowed);
    } catch (err: any) {
      console.error('Error al cargar sucursales:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranchesList();
  }, [loadBranchesList]);

  const handleSaveBranch = useCallback(async (branchData: {
    name: string;
    city: string;
    state?: string;
    address: string;
    reference_point?: string;
    phone?: string;
    whatsapp?: string;
    opening_hours?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    setIsSubmitting(true);
    try {
      if (editingBranch) {
        await updateBusinessBranch(editingBranch.id, branchData);
        onToast?.('success', 'Sucursal actualizada con éxito');
      } else {
        await createBusinessBranch({
          name: branchData.name,
          city: branchData.city,
          state: branchData.state || 'Guárico',
          address: branchData.address,
          reference_point: branchData.reference_point,
          phone: branchData.phone,
          whatsapp: branchData.whatsapp,
          opening_hours: branchData.opening_hours,
          latitude: branchData.latitude ?? 9.215,
          longitude: branchData.longitude ?? -66.01,
        });
        onToast?.('success', '¡Nueva sucursal creada con éxito!');
      }
      setShowAddBranchModal(false);
      setEditingBranch(null);
      await loadBranchesList();
    } catch (err: any) {
      onToast?.('error', err.message || 'Error al guardar sucursal');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingBranch, loadBranchesList, onToast]);

  const handleDeleteBranch = useCallback(async (branchId: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta sede? Sus ofertas vinculadas deberán reasignarse.')) return;
    try {
      await deleteBusinessBranch(branchId);
      onToast?.('success', 'Sucursal eliminada');
      await loadBranchesList();
    } catch (err: any) {
      onToast?.('error', err.message || 'Error al eliminar sucursal');
    }
  }, [loadBranchesList, onToast]);

  return {
    branches,
    maxBranches,
    editingBranch,
    setEditingBranch,
    showAddBranchModal,
    setShowAddBranchModal,
    isLoading,
    isSubmitting,
    loadBranchesList,
    handleSaveBranch,
    handleDeleteBranch,
  };
}
