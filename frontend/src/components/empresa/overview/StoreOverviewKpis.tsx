'use client';

import React from 'react';
import { MessageSquare, Navigation, Package, ShoppingBag, ChevronRight } from 'lucide-react';
import { BusinessAnalyticsData } from '@/lib/api';

interface StoreOverviewKpisProps {
  analytics: BusinessAnalyticsData | null;
  onNavigateTab: (tab: 'catalog' | 'branches' | 'profile') => void;
}

export default function StoreOverviewKpis({ analytics, onNavigateTab }: StoreOverviewKpisProps) {
  const whatsappLeads = analytics?.leads_summary_30d?.whatsapp_clicks || 0;
  const mapRoutes = analytics?.leads_summary_30d?.map_routes || 0;
  const routineItems = analytics?.routine_impact?.total_routine_items || 0;
  const routineUsers = analytics?.routine_impact?.active_users_relying || 0;
  const inStockOffers = analytics?.inventory?.in_stock_offers || 0;
  const totalOffers = analytics?.inventory?.total_offers || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Derivaciones WhatsApp
          </span>
          <div className="w-7 h-7 rounded-md bg-slate-50 text-[#4A6B5B] flex items-center justify-center border border-slate-200">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 mt-2">{whatsappLeads}</div>
        <div className="text-[11px] text-slate-500 mt-1">Usuarios que iniciaron contacto</div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Rutas a Sedes
          </span>
          <div className="w-7 h-7 rounded-md bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
            <Navigation className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 mt-2">{mapRoutes}</div>
        <div className="text-[11px] text-slate-500 mt-1">Clics en Cómo llegar (GPS)</div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            En Rutinas Activas
          </span>
          <div className="w-7 h-7 rounded-md bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
            <Package className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 mt-2">
          {routineItems} <span className="text-xs font-normal text-slate-500">items</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">{routineUsers} usuarios los usan</div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Catálogo Activo
            </span>
            <div className="w-7 h-7 rounded-md bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {inStockOffers} <span className="text-xs font-normal text-slate-500">/ {totalOffers}</span>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('catalog')}
          className="text-[11px] font-semibold text-[#4A6B5B] hover:text-[#3d594b] inline-flex items-center gap-1 mt-2 cursor-pointer"
        >
          <span>Gestionar inventario</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
