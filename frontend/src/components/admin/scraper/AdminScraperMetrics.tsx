import React from 'react';

interface AdminScraperMetricsProps {
  metrics?: {
    total_offers?: number;
    total_branches?: number;
    total_stores?: number;
    cron_frequency?: string;
  };
}

export default function AdminScraperMetrics({ metrics }: AdminScraperMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-lg">
        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
          Ofertas en Base de Datos
        </div>
        <div className="text-2xl font-black text-[#4A6B5B]">
          {metrics?.total_offers ?? '—'}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Precios y stock activos</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-lg">
        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
          Sucursales Mapeadas
        </div>
        <div className="text-2xl font-black text-slate-900">
          {metrics?.total_branches ?? '—'}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Con geolocalización GPS</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-lg">
        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
          Cadenas Registradas
        </div>
        <div className="text-2xl font-black text-slate-800">
          {metrics?.total_stores ?? '—'}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Farmatodo, Locatel, etc.</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-lg">
        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
          Frecuencia de Rastreo
        </div>
        <div className="text-base font-bold text-amber-800 mt-1">
          {metrics?.cron_frequency ?? 'Cada 2 horas'}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Sincronización en segundo plano</p>
      </div>
    </div>
  );
}
