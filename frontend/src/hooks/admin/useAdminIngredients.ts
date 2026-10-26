import { useState, useCallback, useEffect } from 'react';
import {
  fetchAdminIngredients,
  fetchAdminIngredientDetail,
  AdminIngredientItem,
  AdminIngredientDetail,
} from '@/lib/api';

export function useAdminIngredients() {
  const [ingredients, setIngredients] = useState<AdminIngredientItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVES' | 'EXCIPIENTS'>('ALL');
  const [timingFilter, setTimingFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('inci_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedIngredient, setSelectedIngredient] = useState<AdminIngredientDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const loadIngredients = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const activeParam = activeFilter === 'ACTIVES' ? true : activeFilter === 'EXCIPIENTS' ? false : undefined;
      const res = await fetchAdminIngredients({
        q: searchQuery.trim() || undefined,
        is_active: activeParam,
        evidence_level: evidenceFilter || undefined,
        timing: timingFilter || undefined,
        sort_by: sortBy,
        order: sortOrder,
        page,
        per_page: 20,
      });
      setIngredients(res.data);
      setCurrentPage(res.current_page);
      setTotalPages(res.last_page);
      setTotalCount(res.total);
    } catch (err: any) {
      setErrorNotice(err.message || 'Error al conectar con la base de datos de ingredientes.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, evidenceFilter, activeFilter, timingFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadIngredients(1);
  }, [loadIngredients]);

  const handleOpenDetail = useCallback(async (id: number) => {
    setIsLoadingDetail(true);
    setIsModalOpen(true);
    try {
      const res = await fetchAdminIngredientDetail(id);
      setSelectedIngredient(res);
    } catch (err: any) {
      console.error('Error al cargar ficha técnica:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIngredient(null);
  }, []);

  return {
    ingredients,
    isLoading,
    searchQuery,
    setSearchQuery,
    evidenceFilter,
    setEvidenceFilter,
    activeFilter,
    setActiveFilter,
    timingFilter,
    setTimingFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    totalPages,
    totalCount,
    selectedIngredient,
    isLoadingDetail,
    isModalOpen,
    errorNotice,
    loadIngredients,
    handleOpenDetail,
    handleCloseModal,
  };
}
