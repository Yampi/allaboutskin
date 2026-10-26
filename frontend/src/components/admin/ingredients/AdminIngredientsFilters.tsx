import React from 'react';
import { Search } from 'lucide-react';

interface AdminIngredientsFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  evidenceFilter: string;
  onEvidenceChange: (val: string) => void;
  activeFilter: 'ALL' | 'ACTIVES' | 'EXCIPIENTS';
  onActiveFilterChange: (val: 'ALL' | 'ACTIVES' | 'EXCIPIENTS') => void;
  timingFilter: string;
  onTimingChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export default function AdminIngredientsFilters({
  searchQuery,
  onSearchChange,
  evidenceFilter,
  onEvidenceChange,
  activeFilter,
  onActiveFilterChange,
  timingFilter,
  onTimingChange,
  onSubmit,
  onReset,
}: AdminIngredientsFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre INCI, nombre común (ej. Niacinamida)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-1.5 rounded-md bg-[#4A6B5B] hover:bg-[#3d594b] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Buscar</span>
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Evidencia</label>
          <select
            value={evidenceFilter}
            onChange={(e) => onEvidenceChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          >
            <option value="">Cualquiera</option>
            <option value="A">Grado A (Meta-análisis / RCTs)</option>
            <option value="B">Grado B (Estudios Clínicos)</option>
            <option value="C">Grado C (Observacionales)</option>
            <option value="D">Grado D (Consenso)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Clasificación</label>
          <select
            value={activeFilter}
            onChange={(e) => onActiveFilterChange(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          >
            <option value="ALL">Todos los Componentes</option>
            <option value="ACTIVES">Solo Activos Clínicos</option>
            <option value="EXCIPIENTS">Excipientes / Vehículos</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Momento Uso</label>
          <select
            value={timingFilter}
            onChange={(e) => onTimingChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          >
            <option value="">Cualquier Horario</option>
            <option value="DAY">Día (AM)</option>
            <option value="NIGHT">Noche (PM)</option>
            <option value="BOTH">Día y Noche</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-md transition cursor-pointer"
          >
            Restablecer
          </button>
        </div>
      </div>
    </div>
  );
}
