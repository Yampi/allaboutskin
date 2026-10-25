import React from 'react';

interface AdminCrawlerKpisProps {
  kpis?: {
    new_offers_period?: number;
    updated_offers_period?: number;
    stock_rate_percentage?: number;
    in_stock_offers?: number;
    crawled_ingredients_period?: number;
    total_active_ingredients?: number;
    coverage_rate_percentage?: number;
  };
  summaryHours: number;
}

export default function AdminCrawlerKpis({ kpis, summaryHours }: AdminCrawlerKpisProps) {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-md">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Nuevas en {summaryHours}h
        </span>
        <div className="text-xl font-black text-[#4A6B5B] mt-1">
          +{kpis.new_offers_period ?? 0}
        </div>
        <span className="text-[10px] text-slate-400">ofertas descubiertas</span>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-3 rounded-md">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Actualizadas
        </span>
        <div className="text-xl font-black text-slate-800 mt-1">
          {kpis.updated_offers_period ?? 0}
        </div>
        <span className="text-[10px] text-slate-400">precios y stock revisados</span>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-3 rounded-md">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Disponibilidad
        </span>
        <div className="text-xl font-black text-slate-900 mt-1">
          {kpis.stock_rate_percentage ?? 0}%
        </div>
        <span className="text-[10px] text-slate-400">{kpis.in_stock_offers ?? 0} con stock</span>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-3 rounded-md">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Cobertura Activos
        </span>
        <div className="text-xl font-black text-amber-700 mt-1">
          {kpis.crawled_ingredients_period ?? 0}/{kpis.total_active_ingredients ?? 0}
        </div>
        <span className="text-[10px] text-slate-400">{kpis.coverage_rate_percentage ?? 0}% del catálogo</span>
      </div>
    </div>
  );
}
