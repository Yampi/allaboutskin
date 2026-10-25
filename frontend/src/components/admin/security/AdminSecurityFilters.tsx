import React from 'react';
import { RefreshCw } from 'lucide-react';

interface AdminSecurityFiltersProps {
  severityFilter: string;
  onSeverityFilterChange: (val: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function AdminSecurityFilters({
  severityFilter,
  onSeverityFilterChange,
  onRefresh,
  isLoading,
}: AdminSecurityFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
      <div className="flex items-center gap-2">
        <select
          value={severityFilter}
          onChange={(e) => onSeverityFilterChange(e.target.value)}
          className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
        >
          <option value="">Todas las severidades</option>
          <option value="CRITICAL">CRITICAL (Crítica)</option>
          <option value="WARNING">WARNING (Advertencia)</option>
          <option value="INFO">INFO (Informativa)</option>
        </select>
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Refrescar Logs</span>
      </button>
    </div>
  );
}
