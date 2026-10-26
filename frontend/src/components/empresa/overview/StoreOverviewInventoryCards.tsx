'use client';

import React from 'react';
import { Package, MapPin, TrendingUp, ChevronRight } from 'lucide-react';
import { BusinessAnalyticsData } from '@/lib/api';

interface StoreOverviewInventoryCardsProps {
  analytics: BusinessAnalyticsData | null;
  branchCount: number;
  onNavigateTab: (tab: 'catalog' | 'branches' | 'profile') => void;
}

export default function StoreOverviewInventoryCards({
  analytics,
  branchCount,
  onNavigateTab,
}: StoreOverviewInventoryCardsProps) {
  const outOfStockOffers = analytics?.inventory?.out_of_stock_offers || 0;
  const inStoreViews = analytics?.leads_summary_30d?.in_store_views || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Control de Stock</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {outOfStockOffers} agotados
            </span>
          </div>
          <div className="w-7 h-7 rounded-md bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
            <Package className="w-3.5 h-3.5" />
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('catalog')}
          className="text-[11px] font-semibold text-[#4A6B5B] hover:text-[#3d594b] inline-flex items-center gap-1 mt-3 cursor-pointer"
        >
          <span>Ver catálogo</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Sedes Físicas</span>
            <span className="text-xl font-bold text-[#4A6B5B] mt-1 block">
              {branchCount || 1} activas
            </span>
          </div>
          <div className="w-7 h-7 rounded-md bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
            <MapPin className="w-3.5 h-3.5" />
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('branches')}
          className="text-[11px] font-semibold text-[#4A6B5B] hover:text-[#3d594b] inline-flex items-center gap-1 mt-3 cursor-pointer"
        >
          <span>Gestionar sedes</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Vistas en Catálogo</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {inStoreViews} visitas
            </span>
          </div>
          <div className="w-7 h-7 rounded-md bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-medium mt-3">
          Exploraciones en tu vitrina
        </div>
      </div>
    </div>
  );
}
