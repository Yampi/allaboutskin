import { useState, useCallback } from 'react';
import {
  fetchBusinessOffers,
  createBusinessOffer,
  updateBusinessOffer,
  deleteBusinessOffer,
  bulkUpdateBusinessOffers,
  BusinessOfferItem,
} from '@/lib/api';

export function useStoreOffers(onToast?: (type: 'success' | 'error', message: string) => void) {
  const [offers, setOffers] = useState<BusinessOfferItem[]>([]);
  const [offersPage, setOffersPage] = useState(1);
  const [offersTotalPages, setOffersTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [exchangeRateInput, setExchangeRateInput] = useState('45.00');
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);

  const loadOffers = useCallback(async (page?: number) => {
    setIsLoading(true);
    const targetPage = page ?? offersPage;
    try {
      const res = await fetchBusinessOffers({
        page: targetPage,
        search: catalogSearch.trim() || undefined,
        branch_id: selectedBranchFilter ? parseInt(selectedBranchFilter) : undefined,
        in_stock: selectedStockFilter === 'IN_STOCK' ? true : selectedStockFilter === 'OUT_OF_STOCK' ? false : undefined,
      });
      setOffers(res.offers?.data || []);
      setOffersTotalPages(res.offers?.last_page || 1);
      if (page) setOffersPage(page);
    } catch (err: any) {
      console.error('Error al cargar ofertas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [offersPage, catalogSearch, selectedBranchFilter, selectedStockFilter]);

  const handleToggleStock = useCallback(async (offerId: number, currentStock: boolean) => {
    try {
      await updateBusinessOffer(offerId, { in_stock: !currentStock });
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, in_stock: !currentStock } : o)));
      onToast?.('success', !currentStock ? 'Producto marcado en stock' : 'Producto marcado como agotado');
    } catch (err: any) {
      onToast?.('error', err.message || 'Error al actualizar stock');
    }
  }, [onToast]);

  const handleQuickPriceSave = useCallback(async (offerId: number, priceUsd: number, priceVes?: number) => {
    try {
      await updateBusinessOffer(offerId, { price: priceUsd, price_ves: priceVes });
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, price_usd: priceUsd, price_ves: priceVes } : o)));
      onToast?.('success', 'Precio actualizado');
    } catch (err: any) {
      onToast?.('error', err.message || 'Error al actualizar precio');
    }
  }, [onToast]);

  const handleDeleteOffer = useCallback(async (offerId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto de tu catálogo?')) return;
    try {
      await deleteBusinessOffer(offerId);
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
      onToast?.('success', 'Oferta eliminada');
    } catch (err: any) {
      onToast?.('error', err.message || 'Error al eliminar');
    }
  }, [onToast]);

  const handleUpdateExchangeRate = useCallback(async () => {
    const rate = parseFloat(exchangeRateInput);
    if (!rate || rate <= 0) {
      onToast?.('error', 'Ingrese una tasa válida');
      return;
    }
    setIsUpdatingRate(true);
    try {
      const res = await bulkUpdateBusinessOffers({ exchange_rate: rate });
      onToast?.('success', res.message || 'Precios en Bolívares recalculados');
      await loadOffers();
    } catch (err: any) {
      onToast?.('error', err.message || 'Error al actualizar tasa');
    } finally {
      setIsUpdatingRate(false);
    }
  }, [exchangeRateInput, loadOffers, onToast]);

  const handleCreateOffer = useCallback(async (data: {
    product_id: number;
    branch_id: number | null;
    price: number;
    price_ves?: number;
    in_stock: boolean;
  }) => {
    await createBusinessOffer(data);
    onToast?.('success', 'Producto agregado a tu inventario');
    await loadOffers();
  }, [loadOffers, onToast]);

  return {
    offers,
    offersPage,
    setOffersPage,
    offersTotalPages,
    isLoading,
    catalogSearch,
    setCatalogSearch,
    selectedBranchFilter,
    setSelectedBranchFilter,
    selectedStockFilter,
    setSelectedStockFilter,
    exchangeRateInput,
    setExchangeRateInput,
    isUpdatingRate,
    loadOffers,
    handleToggleStock,
    handleQuickPriceSave,
    handleDeleteOffer,
    handleUpdateExchangeRate,
    handleCreateOffer,
  };
}
