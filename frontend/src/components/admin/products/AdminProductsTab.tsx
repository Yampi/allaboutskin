import React, { useEffect } from 'react';
import AdminProductsFilters from './AdminProductsFilters';
import AdminProductsTable from './AdminProductsTable';
import AdminProductsPagination from './AdminProductsPagination';
import ErrorState from '@/components/system/ErrorState';
import { useAdminProducts } from '@/hooks/admin/useAdminProducts';

interface AdminProductsTabProps {
  onInspectOffer?: (product: any) => void;
}

export default function AdminProductsTab({ onInspectOffer }: AdminProductsTabProps) {
  const {
    catalogProducts,
    catalogTotal,
    catalogSearch,
    setCatalogSearch,
    catalogCategoryFilter,
    setCatalogCategoryFilter,
    catalogStoreFilter,
    setCatalogStoreFilter,
    catalogPage,
    setCatalogPage,
    catalogTotalPages,
    isLoading,
    loadError,
    loadCatalogProducts,
  } = useAdminProducts();

  useEffect(() => {
    loadCatalogProducts();
  }, [loadCatalogProducts]);

  return (
    <div className="space-y-4">
      <AdminProductsFilters
        search={catalogSearch}
        onSearchChange={setCatalogSearch}
        categoryFilter={catalogCategoryFilter}
        onCategoryFilterChange={setCatalogCategoryFilter}
        storeFilter={catalogStoreFilter}
        onStoreFilterChange={setCatalogStoreFilter}
        onSearchSubmit={() => loadCatalogProducts(1)}
        onReset={() => {
          setCatalogSearch('');
          setCatalogCategoryFilter('');
          setCatalogStoreFilter('');
          loadCatalogProducts(1);
        }}
        isLoading={isLoading}
      />

      {loadError ? (
        <ErrorState message={loadError} onRetry={() => loadCatalogProducts()} />
      ) : (
        <AdminProductsTable
          products={catalogProducts}
          onInspectProduct={(prod) => onInspectOffer?.(prod)}
        />
      )}

      <AdminProductsPagination
        currentPage={catalogPage}
        totalPages={catalogTotalPages}
        totalProducts={catalogTotal}
        onPageChange={(p) => loadCatalogProducts(p)}
        isLoading={isLoading}
      />
    </div>
  );
}
