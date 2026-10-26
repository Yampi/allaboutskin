import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

export function useAdminProducts() {
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('');
  const [catalogStoreFilter, setCatalogStoreFilter] = useState('');
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogTotalPages, setCatalogTotalPages] = useState(1);
  const [inspectingCatalogProduct, setInspectingCatalogProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCatalogProducts = useCallback(async (page?: number) => {
    setIsLoading(true);
    setLoadError(null);
    const targetPage = page ?? catalogPage;
    try {
      const params = new URLSearchParams();
      params.append('page', targetPage.toString());
      params.append('per_page', '15');
      params.append('include_all', '1');
      if (catalogSearch.trim()) params.append('q', catalogSearch.trim());
      if (catalogCategoryFilter) params.append('category', catalogCategoryFilter);
      if (catalogStoreFilter) params.append('store_id', catalogStoreFilter);

      const res = await fetch(`${API_BASE_URL}/catalog/products?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error al cargar el catálogo (HTTP ${res.status})`);
      }
      const json = await res.json();
      setCatalogProducts(json.data || []);
      setCatalogTotal(json.total || 0);
      setCatalogTotalPages(json.last_page || 1);
      if (page) setCatalogPage(page);
    } catch (err: any) {
      setLoadError(err?.message || 'Error al cargar el catálogo de productos');
    } finally {
      setIsLoading(false);
    }
  }, [catalogPage, catalogSearch, catalogCategoryFilter, catalogStoreFilter]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/catalog/products?per_page=1`, {
      headers: getAuthHeaders(),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.total) setCatalogTotal(json.total);
      })
      .catch(() => {});
  }, []);

  return {
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
    inspectingCatalogProduct,
    setInspectingCatalogProduct,
    isLoading,
    loadError,
    loadCatalogProducts,
  };
}
