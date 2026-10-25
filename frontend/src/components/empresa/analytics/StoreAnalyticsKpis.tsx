'use client';

import React from 'react';
import { TrendingUp, Phone, Package, DollarSign } from 'lucide-react';
import { BusinessAnalyticsData } from '@/lib/api';

interface StoreAnalyticsKpisProps {
  analytics: BusinessAnalyticsData | null;
}

export default function StoreAnalyticsKpis({ analytics }: StoreAnalyticsKpisProps) {
  const totalLeads = analytics?.leads_summary_30d?.total_leads || 0;
  const whatsappClicks = analytics?.leads_summary_30d?.whatsapp_clicks || 0;
  const inStockOffers = analytics?.inventory?.in_stock_offers || 0;
  const totalOffers = analytics?.inventory?.total_offers || 0;
  const avgPrice = analytics?.inventory?.average_price_usd || '0.00';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Leads Totales (30d)
          </span>
          <div className="w-7 h-7 rounded-md bg-slate-50 text-[#4A6B5B] flex items-center justify-center border border-slate-200">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 mt-2">{totalLeads}</div>
        <p className="text-[11px] text-slate-500 mt-1">Interacciones de clientes</p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Pedidos WhatsApp
          </span>
          <div className="w-7 h-7 rounded-md bg-slate-50 text-[#4A6B5B] flex items-center justify-center border border-slate-200">
            <Phone className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 mt-2">{whatsappClicks}</div>
        <p className="text-[11px] text-slate-500 mt-1">Clics para compra directa</p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Catálogo Activo
          </span>
          <div className="w-7 h-7 rounded-md bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
            <Package className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 mt-2">
          {inStockOffers} <span className="text-xs font-normal text-slate-500">/ {totalOffers}</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Ofertas en stock</p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Precio Promedio
          </span>
          <div className="w-7 h-7 rounded-md bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 mt-2">${avgPrice}</div>
        <p className="text-[11px] text-slate-500 mt-1">Ticket medio en USD</p>
      </div>
    </div>
  );
}
