import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface AdminProductsFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (val: string) => void;
  storeFilter: string;
  onStoreFilterChange: (val: string) => void;
  onSearchSubmit: () => void;
  onReset: () => void;
  isLoading: boolean;
}

export default function AdminProductsFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  storeFilter,
  onStoreFilterChange,
  onSearchSubmit,
  onReset,
  isLoading,
}: AdminProductsFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto flex-1">
        <div className="relative flex-1 md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar producto, marca o EAN..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
        >
          <option value="">Todas las Categorías</option>
          <option value="SERUM">Sérum</option>
          <option value="CLEANSER">Limpiador Facial</option>
          <option value="MOISTURIZER">Hidratante</option>
          <option value="SUNSCREEN">Protector Solar (SPF)</option>
          <option value="EXFOLIANT">Exfoliante</option>
          <option value="EYE_CARE">Contorno de Ojos</option>
          <option value="TONER">Tónico</option>
        </select>

        <button
          onClick={onSearchSubmit}
          className="px-3 py-1.5 bg-[#4A6B5B] hover:bg-[#3d594b] text-white font-bold text-xs rounded-md shadow-xs transition cursor-pointer"
        >
          Buscar
        </button>

        {(search || categoryFilter || storeFilter) && (
          <button
            onClick={onReset}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs rounded-md transition cursor-pointer"
          >
            Limpiar
          </button>
        )}
      </div>

      <button
        onClick={onSearchSubmit}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Actualizar</span>
      </button>
    </div>
  );
}
