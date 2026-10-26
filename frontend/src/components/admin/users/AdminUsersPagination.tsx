import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminUsersPaginationProps {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export default function AdminUsersPagination({
  currentPage,
  totalPages,
  totalUsers,
  onPageChange,
  isLoading,
}: AdminUsersPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
      <div>
        Total: <span className="font-semibold text-slate-800">{totalUsers}</span> usuarios
        (Pág. {currentPage} de {totalPages})
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Anterior</span>
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer flex items-center gap-1"
        >
          <span>Siguiente</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
