import React from 'react';
import { Search, Store, Building2 } from 'lucide-react';

interface AdminStoresFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  tierFilter: string;
  onTierFilterChange: (val: string) => void;
  countryFilter: string;
  onCountryFilterChange: (val: string) => void;
  viewMode: 'grouped' | 'table';
  onViewModeChange: (mode: 'grouped' | 'table') => void;
  onSearchSubmit: () => void;
  totalStoresCount: number;
}

export default function AdminStoresFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  tierFilter,
  onTierFilterChange,
  countryFilter,
  onCountryFilterChange,
  viewMode,
  onViewModeChange,
  onSearchSubmit,
  totalStoresCount,
}: AdminStoresFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onViewModeChange('grouped')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              viewMode === 'grouped'
                ? 'bg-slate-100 text-[#4A6B5B] border border-slate-200 font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-[#4A6B5B]" />
            <span>Catálogo Agrupado</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px] font-mono">
              {totalStoresCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-slate-100 text-[#4A6B5B] border border-slate-200 font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Tabla Supervisión & Planes</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500">
          Soporte multimoneda USD / Bs
        </div>
      </div>

      {/* Filter Inputs */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar comercio..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          >
            <option value="">Todos los Estados</option>
            <option value="PENDING_REVIEW">Pendientes de Revisión</option>
            <option value="VERIFIED">Verificadas</option>
            <option value="REJECTED">Rechazadas</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => onTierFilterChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          >
            <option value="">Todos los Planes</option>
            <option value="FREE">Plan FREE</option>
            <option value="PRO_LOCAL">Plan PRO_LOCAL</option>
            <option value="ENTERPRISE">Plan ENTERPRISE</option>
          </select>

          <select
            value={countryFilter}
            onChange={(e) => onCountryFilterChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          >
            <option value="">Todos los Países</option>
            <option value="VE">Venezuela</option>
            <option value="CO">Colombia</option>
            <option value="CL">Chile</option>
            <option value="AR">Argentina</option>
            <option value="MX">México</option>
          </select>
        </div>
      </div>
    </div>
  );
}
