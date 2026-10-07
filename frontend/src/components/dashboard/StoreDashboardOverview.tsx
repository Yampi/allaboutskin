'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  MessageSquare,
  Search,
  ArrowUpRight,
  Package,
  AlertTriangle,
  MapPin,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { BusinessAnalyticsData, BusinessStoreProfile } from '@/lib/api';

interface StoreDashboardOverviewProps {
  store: BusinessStoreProfile | null;
  analytics: BusinessAnalyticsData | null;
  onNavigateTab: (tab: 'catalog' | 'branches' | 'profile') => void;
  branchCount: number;
}

export default function StoreDashboardOverview({
  store,
  analytics,
  onNavigateTab,
  branchCount,
}: StoreDashboardOverviewProps) {
  const [currency, setCurrency] = useState<'USD' | 'VES'>('USD');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Sales 7-day data
  const salesData = [
    { day: '20 Jun', amountUsd: 850, amountVes: 31025 },
    { day: '21 Jun', amountUsd: 1100, amountVes: 40150 },
    { day: '22 Jun', amountUsd: 780, amountVes: 28470 },
    { day: '23 Jun', amountUsd: 1350, amountVes: 49275 },
    { day: '24 Jun', amountUsd: 920, amountVes: 33580 },
    { day: '25 Jun', amountUsd: 1480, amountVes: 54020 },
    { day: '26 Jun', amountUsd: 1248.5, amountVes: 45570 },
  ];

  // SVG Chart Dimensions
  const chartWidth = 600;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = currency === 'USD' ? 2000 : 70000;
  const getY = (val: number) => chartHeight - paddingY - (val / maxVal) * (chartHeight - paddingY * 2);
  const getX = (idx: number) => paddingX + (idx / (salesData.length - 1)) * (chartWidth - paddingX * 2);

  const points = salesData.map((d, i) => `${getX(i)},${getY(currency === 'USD' ? d.amountUsd : d.amountVes)}`).join(' ');

  // Top products
  const topProducts = [
    { name: 'Protector solar SPF 50', units: 124, growth: '+12%', icon: '☀️' },
    { name: 'Sérum vitamina C', units: 98, growth: '+8%', icon: '🍊' },
    { name: 'Limpiador facial suave', units: 86, growth: '+6%', icon: '🫧' },
    { name: 'Hidratante facial gel', units: 72, growth: '+4%', icon: '💧' },
    { name: 'Retinol 0.3% antiedad', units: 60, growth: '+2%', icon: '✨' },
  ];

  const totalLeads = analytics?.leads_summary_30d?.total_leads || 68;
  const whatsappLeads = analytics?.leads_summary_30d?.whatsapp_clicks || 32;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* 1. TOP KPI CARDS (4 COLUMNAS - MOCKUP AZUL B2B)          */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Ventas hoy */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Ventas hoy
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              $
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            $1,248.50
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12% vs. ayer</span>
          </div>
        </div>

        {/* KPI 2: Leads desde Allabout.skin */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Leads desde Allabout.skin
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalLeads}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+24% vs. ayer</span>
          </div>
        </div>

        {/* KPI 3: Pedidos por WhatsApp */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pedidos por WhatsApp
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {whatsappLeads}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18% vs. ayer</span>
          </div>
        </div>

        {/* KPI 4: Productos más buscados */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Productos más buscados
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-800 mt-2 truncate">
              Retinol, SPF, Sérum
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('catalog')}
            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 transition inline-flex items-center gap-1 mt-2 text-left"
          >
            <span>Ver detalle</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. GRÁFICO DE VENTAS 7 DÍAS & PRODUCTOS MÁS VENDIDOS      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* GRÁFICO DE VENTAS (2 COLUMNAS) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-sky-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Ventas de los últimos 7 días
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Facturación estimada en vitrina y pedidos directos
              </p>
            </div>

            {/* Currency Selector (USD / VES) */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  currency === 'USD'
                    ? 'bg-white text-sky-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('VES')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  currency === 'VES'
                    ? 'bg-white text-sky-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                VES (Bs.)
              </button>
            </div>
          </div>

          {/* Interactive SVG Smooth Area Curve */}
          <div className="w-full overflow-x-auto">
            <svg
              className="w-full h-48 select-none"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.33, 0.66, 1].map((pct, i) => {
                const y = paddingY + pct * (chartHeight - paddingY * 2);
                return (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area */}
              <polygon
                points={`${paddingX},${chartHeight - paddingY} ${points} ${chartWidth - paddingX},${chartHeight - paddingY}`}
                fill="url(#salesGradient)"
              />

              {/* Line */}
              <polyline
                points={points}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Dots & Tooltips */}
              {salesData.map((d, i) => {
                const cx = getX(i);
                const cy = getY(currency === 'USD' ? d.amountUsd : d.amountVes);
                const isHovered = hoveredPoint === i;

                return (
                  <g key={i}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 5 : 3.5}
                      className="fill-white stroke-sky-600 transition-all cursor-pointer"
                      strokeWidth={isHovered ? 3 : 2}
                      onMouseEnter={() => setHoveredPoint(i)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {isHovered && (
                      <g>
                        <rect
                          x={cx - 35}
                          y={cy - 28}
                          width="70"
                          height="20"
                          rx="6"
                          className="fill-slate-900"
                        />
                        <text
                          x={cx}
                          y={cy - 14}
                          textAnchor="middle"
                          className="fill-white text-[10px] font-bold font-mono"
                        >
                          {currency === 'USD' ? `$${d.amountUsd}` : `Bs. ${d.amountVes}`}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* X Labels */}
              {salesData.map((d, i) => (
                <text
                  key={i}
                  x={getX(i)}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px] font-semibold"
                >
                  {d.day}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* RANKING: PRODUCTOS MÁS VENDIDOS (1 COLUMNA) */}
        <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Productos más vendidos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Mayor rotación en anaquel esta semana
            </p>

            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 w-3">
                      {idx + 1}.
                    </span>
                    <span className="text-sm">{p.icon}</span>
                    <div className="truncate">
                      <div className="font-bold text-slate-800 truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {p.units} uds
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                    {p.growth}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('catalog')}
            className="w-full mt-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl transition text-center"
          >
            Ver inventario completo
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. ACTION CARDS INFERIORES (STOCK, WHATSAPP, SEDES, BCV)  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* ACTION 1: Stock bajo */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Stock bajo
              </span>
              <span className="text-xl font-black text-amber-600 mt-1 block">
                3 productos
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('catalog')}
            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 transition inline-flex items-center gap-1 mt-3"
          >
            <span>Ver inventario</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* ACTION 2: Mensajes / Solicitudes */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Mensajes / Solicitudes
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                14 sin responder
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <a
            href="https://web.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 transition inline-flex items-center gap-1 mt-3"
          >
            <span>Ir a WhatsApp</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* ACTION 3: Sucursales activas */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Sucursales
              </span>
              <span className="text-xl font-black text-emerald-700 mt-1 block">
                {branchCount || 2} activas
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('branches')}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition inline-flex items-center gap-1 mt-3"
          >
            <span>Gestionar</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* ACTION 4: Tasa de cambio oficial BCV */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Tasa de cambio (BCV)
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-1 block font-mono">
                USD 1 = Bs. 45,00
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-3">
            Sincronizado oficialmente hoy
          </div>
        </div>

      </div>

    </div>
  );
}
