import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface AdminUsersFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  roleFilter: string;
  onRoleFilterChange: (val: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function AdminUsersFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onRefresh,
  isLoading,
}: AdminUsersFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onRefresh()}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B] focus:border-[#4A6B5B]"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
        >
          <option value="">Todos los roles</option>
          <option value="super_admin">Super Administrador</option>
          <option value="admin">Administrador</option>
          <option value="scientific_editor">Editor Científico</option>
          <option value="premium_user">Usuario Premium</option>
          <option value="standard_user">Usuario Estándar</option>
        </select>
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold rounded-md flex items-center gap-2 transition cursor-pointer"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Actualizar</span>
      </button>
    </div>
  );
}
