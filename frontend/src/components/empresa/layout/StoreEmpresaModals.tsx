'use client';

import React from 'react';
import StoreAddOfferModal from '@/components/empresa/modals/StoreAddOfferModal';
import StoreBranchModal from '@/components/empresa/modals/StoreBranchModal';
import StoreBulkImportModal from '@/components/empresa/modals/StoreBulkImportModal';
import { useStoreOffers } from '@/hooks/empresa/useStoreOffers';
import { useStoreBranches } from '@/hooks/empresa/useStoreBranches';
import { useStoreBulkImport } from '@/hooks/empresa/useStoreBulkImport';

interface StoreEmpresaModalsProps {
  showAddOfferModal: boolean;
  setShowAddOfferModal: (val: boolean) => void;
  showBranchModal: boolean;
  setShowBranchModal: (val: boolean) => void;
  editingBranch: any | null;
  offers: ReturnType<typeof useStoreOffers>;
  branches: ReturnType<typeof useStoreBranches>;
  importer: ReturnType<typeof useStoreBulkImport>;
}

export default function StoreEmpresaModals({
  showAddOfferModal,
  setShowAddOfferModal,
  showBranchModal,
  setShowBranchModal,
  editingBranch,
  offers,
  branches,
  importer,
}: StoreEmpresaModalsProps) {
  return (
    <>
      <StoreAddOfferModal
        isOpen={showAddOfferModal}
        onClose={() => setShowAddOfferModal(false)}
        onSubmit={async (data) => {
          await offers.handleCreateOffer({
            product_id: data.product_id,
            branch_id: data.branch_id ?? null,
            price: data.price,
            price_ves: data.price_ves,
            in_stock: data.in_stock,
          });
          setShowAddOfferModal(false);
        }}
        branches={branches.branches}
        defaultExchangeRate={offers.exchangeRateInput}
        isSubmitting={offers.isLoading}
      />

      <StoreBranchModal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        editingBranch={editingBranch}
        onSubmit={async (data) => {
          await branches.handleSaveBranch(data);
          setShowBranchModal(false);
        }}
        isSubmitting={branches.isSubmitting}
      />

      <StoreBulkImportModal
        isOpen={importer.showImportModal}
        onClose={() => importer.setShowImportModal(false)}
        branches={branches.branches}
        importer={importer}
      />
    </>
  );
}
