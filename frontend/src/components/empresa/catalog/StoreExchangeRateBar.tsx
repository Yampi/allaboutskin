'use client';

import React from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';

interface StoreExchangeRateBarProps {
  exchangeRate: string;
  onRateChange: (val: string) => void;
  onApplyRate: () => void;
  isUpdating: boolean;
}

export default function StoreExchangeRateBar({
  exchangeRate,
  onRateChange,
  onApplyRate,
  isUpdating,
}: StoreExchangeRateBarProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
          <RefreshCw className="w-3.5 h-3.5 text-[#4A6B5B]" />
          <span>Actualizador de Tasa de Cambio (USD &rarr; VES)</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Ajusta la tasa oficial del día y recalcula automáticamente los precios en Bolívares (Bs) en tu vitrina.
        </p>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
            Bs/$
          </span>
          <input
            type="number"
            step="0.10"
            value={exchangeRate}
            onChange={(e) => onRateChange(e.target.value)}
            className="w-24 bg-[#FAF8F5] border border-slate-200 rounded-md pl-10 pr-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#4A6B5B]"
          />
        </div>
        <button
          type="button"
          onClick={onApplyRate}
          disabled={isUpdating}
          className="px-3.5 py-1.5 bg-[#4A6B5B] hover:bg-[#3d594b] text-white font-bold text-xs rounded-md transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isUpdating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recalcular Precios</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
