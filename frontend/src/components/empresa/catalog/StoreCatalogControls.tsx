'use client';

import React from 'react';
import { Search, FileSpreadsheet, Plus } from 'lucide-react';
import { BusinessBranchItem } from '@/lib/api';

interface StoreCatalogControlsProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: () => void;
  branches: BusinessBranchItem[];
  selectedBranch: string;
  onBranchChange: (val: string) => void;
  selectedStock: string;
  onStockChange: (val: string) => void;
  onOpenImportModal: () => void;
  onOpenAddModal: () => void;
}

export default function StoreCatalogControls({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  branches,
  selectedBranch,
  onBranchChange,
  selectedStock,
  onStockChange,
  onOpenImportModal,
  onOpenAddModal,
}: StoreCatalogControlsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <div className="flex flex-1 w-full gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por producto, marca o referencia..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
            className="w-full bg-white border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4A6B5B] shadow-xs"
          />
        </div>

        {branches.length > 1 && (
          <select
            value={selectedBranch}
            onChange={(e) => onBranchChange(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none shadow-xs"
          >
            <option value="">Todas las Sedes</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={selectedStock}
          onChange={(e) => onStockChange(e.target.value)}
          className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none shadow-xs"
        >
          <option value="">Disponibilidad (Todas)</option>
          <option value="true">Solo en Stock</option>
          <option value="false">Solo Agotados</option>
        </select>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenImportModal}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-md transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#4A6B5B]" />
          <span>Importar CSV</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-3.5 py-1.5 bg-[#4A6B5B] hover:bg-[#3d594b] text-white font-bold text-xs rounded-md transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir Producto</span>
        </button>
      </div>
    </div>
  );
}
