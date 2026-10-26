'use client';

import React, { useEffect } from 'react';
import { BusinessBranchItem, BusinessOfferItem } from '@/lib/api';
import StoreExchangeRateBar from './StoreExchangeRateBar';
import StoreCatalogControls from './StoreCatalogControls';
import StoreOffersTable from './StoreOffersTable';
import StoreCatalogPagination from './StoreCatalogPagination';
import ErrorState from '@/components/system/ErrorState';

interface StoreCatalogTabProps {
  exchangeRate: string;
  onRateChange: (val: string) => void;
  onApplyRate: () => void;
  isUpdatingRate: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: () => void;
  branches: BusinessBranchItem[];
  selectedBranch: string;
  onBranchChange: (val: string) => void;
  selectedStock: string;
  onStockChange: (val: string) => void;
  onOpenImportModal: () => void;
  onOpenAddModal: () => void;
  offers: BusinessOfferItem[];
  loadError: string | null;
  onReload: () => void;
  onToggleStock: (offer: BusinessOfferItem) => void;
  onDeleteOffer: (offerId: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function StoreCatalogTab({
  exchangeRate,
  onRateChange,
  onApplyRate,
  isUpdatingRate,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  branches,
  selectedBranch,
  onBranchChange,
  selectedStock,
  onStockChange,
  onOpenImportModal,
  onOpenAddModal,
  offers,
  loadError,
  onReload,
  onToggleStock,
  onDeleteOffer,
  currentPage,
  totalPages,
  onPageChange,
}: StoreCatalogTabProps) {
  // Carga inicial al entrar en la pestaña; luego recarga por búsqueda, filtros o paginación.
  useEffect(() => {
    onReload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <StoreExchangeRateBar
        exchangeRate={exchangeRate}
        onRateChange={onRateChange}
        onApplyRate={onApplyRate}
        isUpdating={isUpdatingRate}
      />

      <StoreCatalogControls
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        branches={branches}
        selectedBranch={selectedBranch}
        onBranchChange={onBranchChange}
        selectedStock={selectedStock}
        onStockChange={onStockChange}
        onOpenImportModal={onOpenImportModal}
        onOpenAddModal={onOpenAddModal}
      />

      {loadError ? (
        <ErrorState message={loadError} onRetry={onReload} />
      ) : (
        <StoreOffersTable
          offers={offers}
          onToggleStock={onToggleStock}
          onDeleteOffer={onDeleteOffer}
        />
      )}

      <StoreCatalogPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
