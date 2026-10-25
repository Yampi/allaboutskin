'use client';

import React from 'react';
import { MapPin } from 'lucide-react';

interface BranchPerformanceItem {
  id: number;
  name: string;
  city: string;
  offers_count: number;
  leads_count: number;
}

interface StoreBranchPerformanceListProps {
  branchesPerformance?: BranchPerformanceItem[];
}

export default function StoreBranchPerformanceList({
  branchesPerformance = [],
}: StoreBranchPerformanceListProps) {
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[#4A6B5B]" />
        <span>Rendimiento por Sucursal</span>
      </h3>

      {branchesPerformance.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">
          Aún no hay datos de interacción registrados para tus sucursales.
        </p>
      ) : (
        <div className="space-y-2.5">
          {branchesPerformance.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200"
            >
              <div>
                <div className="font-bold text-slate-800 text-xs">{b.name}</div>
                <div className="text-[11px] text-slate-500">
                  {b.city} &bull; {b.offers_count} productos en vitrina
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-[#4A6B5B]">{b.leads_count}</div>
                <div className="text-[10px] text-slate-400">leads generados</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
