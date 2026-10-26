'use client';

import React from 'react';
import AdminIngredientsKpis from './ingredients/AdminIngredientsKpis';
import AdminIngredientsFilters from './ingredients/AdminIngredientsFilters';
import AdminIngredientsTable from './ingredients/AdminIngredientsTable';
import AdminIngredientDossierModal from './ingredients/AdminIngredientDossierModal';
import { useAdminIngredients } from '@/hooks/admin/useAdminIngredients';

export default function AdminIngredientsTab() {
  const {
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
    totalCount,
    selectedIngredient,
    isLoadingDetail,
    isModalOpen,
    loadIngredients,
    handleOpenDetail,
    handleCloseModal,
  } = useAdminIngredients();

  const activesCount = ingredients.filter((i) => i.is_active).length;
  const highEvidenceCount = ingredients.filter(
    (i) => i.evidence_level === 'A' || i.evidence_level === 'B'
  ).length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <AdminIngredientsKpis
        totalCount={totalCount}
        activesInView={activesCount}
        highEvidenceInView={highEvidenceCount}
      />

      <AdminIngredientsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        evidenceFilter={evidenceFilter}
        onEvidenceChange={setEvidenceFilter}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
        timingFilter={timingFilter}
        onTimingChange={setTimingFilter}
        onSubmit={(e) => {
          e.preventDefault();
          loadIngredients(1);
        }}
        onReset={() => {
          setSearchQuery('');
          setEvidenceFilter('');
          setActiveFilter('ALL');
          setTimingFilter('');
        }}
      />

      <AdminIngredientsTable
        ingredients={ingredients}
        isLoading={isLoading}
        onOpenDetail={handleOpenDetail}
      />

      <AdminIngredientDossierModal
        ingredient={selectedIngredient}
        isOpen={isModalOpen}
        isLoading={isLoadingDetail}
        onClose={handleCloseModal}
      />
    </div>
  );
}
