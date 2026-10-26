'use client';

import React from 'react';

interface StoreCatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function StoreCatalogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: StoreCatalogPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-2">
      <span className="text-xs text-slate-500">
        Página {currentPage} de {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="px-3 py-1 bg-white border border-slate-200 text-xs font-semibold rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition shadow-xs cursor-pointer"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="px-3 py-1 bg-white border border-slate-200 text-xs font-semibold rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition shadow-xs cursor-pointer"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
