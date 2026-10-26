import { useState, useEffect, useCallback } from 'react';
import { fetchIngredientsStrict, IngredientPage, IngredientQuery } from '@/lib/ingredientCatalogApi';

export function useIngredientCatalog() {
  const [filters, setFilters] = useState<IngredientQuery>({ q: '', timing: '', evidence_level: '', page: 1 });
  const [result, setResult] = useState<IngredientPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (query: IngredientQuery) => {
    try {
      setResult(await fetchIngredientsStrict(query));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'No se pudo cargar el catálogo de ingredientes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    run(filters);
  }, [filters, run]);

  // Cualquier cambio de filtro vuelve a la página 1; solo la paginación conserva el resto.
  const updateFilters = useCallback((patch: Partial<IngredientQuery>) => {
    setIsLoading(true);
    setFilters((prev) => ({ ...prev, page: 1, ...patch }));
  }, []);

  const retry = useCallback(() => {
    setIsLoading(true);
    run(filters);
  }, [filters, run]);

  return { filters, result, isLoading, error, updateFilters, retry };
}
