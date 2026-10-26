'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface StoreBranchQuotaAlertProps {
  currentCount: number;
  maxAllowed: number;
  tierLabel?: string;
  onAddBranch: () => void;
}

export default function StoreBranchQuotaAlert({
  currentCount,
  maxAllowed,
  tierLabel = 'Plan Básico',
  onAddBranch,
}: StoreBranchQuotaAlertProps) {
  const isAtLimit = currentCount >= maxAllowed;

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
          Límite de Sedes Físicas
        </div>
        <div className="text-xs font-semibold text-slate-800 mt-0.5">
          Has registrado <span className="text-[#4A6B5B] font-bold">{currentCount}</span> de{' '}
          <span className="font-bold">{maxAllowed}</span> sede(s) permitidas en tu {tierLabel}.
        </div>
      </div>

      <button
        type="button"
        onClick={onAddBranch}
        disabled={isAtLimit}
        className="px-3.5 py-1.5 bg-[#4A6B5B] hover:bg-[#3d594b] text-white font-bold text-xs rounded-md transition flex items-center gap-1.5 shadow-xs disabled:opacity-40 shrink-0 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Añadir Sucursal</span>
      </button>
    </div>
  );
}
