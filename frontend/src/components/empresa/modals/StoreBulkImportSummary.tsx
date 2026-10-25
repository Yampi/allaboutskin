'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { BulkImportResponse } from '@/lib/api';

interface StoreBulkImportSummaryProps {
  result: BulkImportResponse;
  onReset: () => void;
  onClose: () => void;
}

export default function StoreBulkImportSummary({
  result,
  onReset,
  onClose,
}: StoreBulkImportSummaryProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 space-y-3">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{result.message}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded bg-white border border-emerald-100">
            <span className="text-slate-500 block text-[10px]">Nuevas Ofertas</span>
            <span className="text-base font-bold text-slate-900">{result.summary.created_offers}</span>
          </div>
          <div className="p-2.5 rounded bg-white border border-emerald-100">
            <span className="text-slate-500 block text-[10px]">Actualizadas</span>
            <span className="text-base font-bold text-slate-900">{result.summary.updated_offers}</span>
          </div>
          <div className="p-2.5 rounded bg-white border border-emerald-100">
            <span className="text-slate-500 block text-[10px]">Ficha Médica</span>
            <span className="text-base font-bold text-[#4A6B5B]">{result.summary.matched_scientific_products}</span>
          </div>
          <div className="p-2.5 rounded bg-white border border-emerald-100">
            <span className="text-slate-500 block text-[10px]">Nuevos Productos</span>
            <span className="text-base font-bold text-slate-900">{result.summary.created_new_products}</span>
          </div>
        </div>

        {result.errors && result.errors.length > 0 && (
          <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Observaciones en {result.errors.length} fila(s):</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-0.5 text-[10px]">
              {result.errors.map((err, i) => (
                <div key={i}>&bull; Fila {err.row} ({err.name}): {err.error}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onReset}
          className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md cursor-pointer hover:bg-slate-200"
        >
          Importar Otro Lote
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-[#4A6B5B] hover:bg-[#3d594b] text-white text-xs font-bold rounded-md cursor-pointer"
        >
          Cerrar y Ver Catálogo
        </button>
      </div>
    </div>
  );
}
