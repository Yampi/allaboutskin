'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import ErrorState from '@/components/system/ErrorState';
import IngredientCard from './IngredientCard';
import { useIngredientCatalog } from '@/hooks/useIngredientCatalog';

const selectClass = 'px-3 py-2 rounded-xl border border-[#E8E1D7] bg-white text-xs font-medium text-[#2D2825]';

export default function IngredientCatalog() {
  const { filters, result, isLoading, error, updateFilters, retry } = useIngredientCatalog();
  const [search, setSearch] = useState('');

  return (
    <section className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold text-[#2D2825] tracking-tight">Biblioteca de ingredientes</h1>
        <p className="text-xs text-[#66615C]">
          {result ? `${result.total} ingredientes en el catálogo.` : 'Catálogo de ingredientes cosméticos con su nivel de evidencia y fuente.'}
        </p>
      </header>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          updateFilters({ q: search });
        }}
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre INCI o común…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E8E1D7] bg-white text-xs"
          />
        </div>
        <select aria-label="Momento de uso" className={selectClass} value={filters.timing} onChange={(e) => updateFilters({ timing: e.target.value as 'AM' | 'PM' | '' })}>
          <option value="">Cualquier momento</option>
          <option value="AM">Día (AM)</option>
          <option value="PM">Noche (PM)</option>
        </select>
        <select aria-label="Nivel de evidencia" className={selectClass} value={filters.evidence_level} onChange={(e) => updateFilters({ evidence_level: e.target.value })}>
          <option value="">Toda evidencia</option>
          {['A', 'B', 'C', 'D'].map((g) => <option key={g} value={g}>Nivel {g}</option>)}
        </select>
        <button type="submit" className="px-4 py-2 rounded-xl bg-[#2E7D5B] text-white text-xs font-bold cursor-pointer">Buscar</button>
      </form>

      {error && <ErrorState message={error} onRetry={retry} />}
      {isLoading && !error && <p className="text-xs text-[#8C827A]">Cargando ingredientes…</p>}

      {!isLoading && result && result.data.length === 0 && (
        <p className="p-4 rounded-2xl border border-dashed border-[#E8E1D7] text-xs text-[#66615C]">
          No hay ingredientes que coincidan con tu búsqueda.
        </p>
      )}

      {result && result.data.length > 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isLoading ? 'opacity-60' : ''}`}>
          {result.data.map((ing) => <IngredientCard key={ing.id} ingredient={ing} />)}
        </div>
      )}

      {result && result.last_page > 1 && (
        <nav className="flex items-center justify-center gap-3 text-xs font-bold" aria-label="Paginación">
          <button type="button" disabled={result.current_page <= 1} onClick={() => updateFilters({ page: result.current_page - 1 })} className="px-3 py-1.5 rounded-lg border border-[#E8E1D7] disabled:opacity-40 cursor-pointer">Anterior</button>
          <span className="text-[#66615C]">Página {result.current_page} de {result.last_page}</span>
          <button type="button" disabled={result.current_page >= result.last_page} onClick={() => updateFilters({ page: result.current_page + 1 })} className="px-3 py-1.5 rounded-lg border border-[#E8E1D7] disabled:opacity-40 cursor-pointer">Siguiente</button>
        </nav>
      )}
    </section>
  );
}
