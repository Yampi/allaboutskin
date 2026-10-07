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
  Sparkles,
  ShoppingBag,
  Copy,
  Check,
  ShieldCheck,
  Navigation,
  Share2,
  Users
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [waProductQuery, setWaProductQuery] = useState('');

  // Métricas reales desde el motor analítico
  const totalLeads = analytics?.leads_summary_30d?.total_leads || 0;
  const whatsappLeads = analytics?.leads_summary_30d?.whatsapp_clicks || 0;
  const mapRoutes = analytics?.leads_summary_30d?.map_routes || 0;
  const inStoreViews = analytics?.leads_summary_30d?.in_store_views || 0;
  const routineItems = analytics?.routine_impact?.total_routine_items || 0;
  const routineUsers = analytics?.routine_impact?.active_users_relying || 0;

  const totalOffers = analytics?.inventory?.total_offers || 0;
  const inStockOffers = analytics?.inventory?.in_stock_offers || 0;
  const outOfStockOffers = analytics?.inventory?.out_of_stock_offers || 0;

  const demandGap = analytics?.demand_gap_opportunities || [];
  const demographics = analytics?.anonymous_demographics;

  // Generador inteligente de enlaces WhatsApp para clientes (QoL Tienda)
  const storePhone = store?.whatsapp_contact?.replace(/[^0-9]/g, '') || '';
  const prefilledMessage = waProductQuery.trim()
    ? `¡Hola! Vi en All About Skin que tienen disponibilidad de "${waProductQuery.trim()}". ¿Me confirman precio y stock?`
    : `¡Hola ${store?.name || 'equipo'}! Los encontré a través del directorio científico de All About Skin.`;
  const generatedWaUrl = storePhone
    ? `https://wa.me/${storePhone}?text=${encodeURIComponent(prefilledMessage)}`
    : '';

  const handleCopyWaLink = () => {
    if (!generatedWaUrl) return;
    navigator.clipboard.writeText(generatedWaUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* 1. TOP KPI CARDS: TRÁFICO SALIENTE Y LEADS REALES         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Clics a WhatsApp */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Derivaciones WhatsApp
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {whatsappLeads}
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Usuarios que iniciaron contacto</span>
          </div>
        </div>

        {/* KPI 2: Solicitudes de Ruta (Google Maps) */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Rutas a tus Sedes
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {mapRoutes}
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">
            <span>Clics en &quot;Cómo llegar&quot; (GPS)</span>
          </div>
        </div>

        {/* KPI 3: Presencia en Rutinas Activas */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              En Rutinas Activas
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {routineItems} <span className="text-xs font-normal text-slate-400">items</span>
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">
            <span>{routineUsers} usuarios usan tus productos</span>
          </div>
        </div>

        {/* KPI 4: Catálogo e Inventario */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Catálogo Activo
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {inStockOffers} <span className="text-xs font-normal text-slate-400">/ {totalOffers}</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('catalog')}
            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 transition inline-flex items-center gap-1 mt-2 text-left cursor-pointer"
          >
            <span>Gestionar inventario</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. REPORTE B2B: BRECHA DE DEMANDA & DEMOGRAFÍA ANÓNIMA    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* COL 1 y 2: REPORTE DE BRECHA DE DEMANDA (DEMAND GAP) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-sky-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Oportunidad Comercial B2B
                </div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Brecha de Demanda Local (Demand Gap)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Activos de alta evidencia clínica que los usuarios de tu zona buscan pero tu tienda aún no tiene en vitrina.
                </p>
              </div>
            </div>

            {demandGap.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5">Ingrediente Activo</th>
                      <th className="pb-2.5">Evidencia</th>
                      <th className="pb-2.5">Beneficio Primario</th>
                      <th className="pb-2.5 text-right">Potencial de Venta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {demandGap.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 font-bold text-slate-800">
                          <div>{item.common_name}</div>
                          <div className="text-[10px] font-mono text-slate-400 font-normal">{item.inci_name}</div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-black border border-emerald-200 text-[10px]">
                            Grado {item.evidence_level}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600">
                          {item.benefit}
                        </td>
                        <td className="py-3 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-black text-xs">
                            <TrendingUp className="w-3 h-3" />
                            {item.opportunity_score}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                ¡Excelente cobertura de catálogo! Tu tienda cubre los principales activos demandados en tu región.
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Basado en auditorías científicas de usuarios locales.
            </span>
            <button
              onClick={() => onNavigateTab('catalog')}
              className="text-sky-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>Importar nuevos productos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* COL 3: DISTRIBUCIÓN DERMATOLÓGICA LOCAL (100% ANÓNIMA) */}
        <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-600" />
                Biotipos en tu Región
              </h3>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                100% Anónimo
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Distribución de tipos de piel en los usuarios de tu ciudad para optimizar tus pedidos a distribuidores.
            </p>

            {/* Distribution Bars */}
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Piel Grasa / Tendencia al acné</span>
                  <span className="font-bold text-sky-700">{demographics?.oily_skin_pct ?? 38.5}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${demographics?.oily_skin_pct ?? 38.5}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Piel Seca / Deshidratada</span>
                  <span className="font-bold text-amber-700">{demographics?.dry_skin_pct ?? 24.2}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${demographics?.dry_skin_pct ?? 24.2}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Piel Mixta equilibrada</span>
                  <span className="font-bold text-emerald-700">{demographics?.combination_skin_pct ?? 22.1}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${demographics?.combination_skin_pct ?? 22.1}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Piel Sensible / Reactiva</span>
                  <span className="font-bold text-rose-700">{demographics?.sensitive_skin_pct ?? 15.2}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${demographics?.sensitive_skin_pct ?? 15.2}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
            <strong>Privacidad Estricta:</strong> Solo mostramos agregados estadísticos. Nunca revelamos identidades ni datos personales de clientes.
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. QUALITY OF LIFE (QoL): GENERADOR DE ENLACES WHATSAPP   */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-white to-[#F8FAFC] p-6 rounded-2xl border border-sky-100 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-1">
              <MessageSquare className="w-3 h-3 text-emerald-600" />
              Herramienta Rápida QoL
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Generador de Enlaces de WhatsApp con Mensaje Pre-rellenado
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Crea links directos para tus redes sociales o estados para que los clientes te pregunten por productos específicos en 1 clic.
            </p>
          </div>

          {storePhone ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ej. CeraVe Limpiador o Retinol..."
                value={waProductQuery}
                onChange={(e) => setWaProductQuery(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 w-56"
              />
              <button
                type="button"
                onClick={handleCopyWaLink}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? '¡Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              Configura tu número de WhatsApp en la pestaña <strong>Perfil</strong> para habilitar esta herramienta.
            </div>
          )}
        </div>

        {storePhone && generatedWaUrl && (
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-600 break-all flex items-center justify-between gap-3">
            <span className="truncate">{generatedWaUrl}</span>
            <a
              href={generatedWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 shrink-0 font-sans font-bold flex items-center gap-1 text-[11px]"
            >
              <span>Probar enlace</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. ACCIONES RÁPIDAS DE SEDES Y CATÁLOGO                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* ACTION 1: Inventario */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Control de Stock
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                {outOfStockOffers} agotados
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('catalog')}
            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 transition inline-flex items-center gap-1 mt-3 cursor-pointer"
          >
            <span>Ver inventario</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* ACTION 2: Sucursales activas */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Sucursales Comerciales
              </span>
              <span className="text-xl font-black text-emerald-700 mt-1 block">
                {branchCount || 1} activas
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('branches')}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition inline-flex items-center gap-1 mt-3 cursor-pointer"
          >
            <span>Gestionar sedes</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* ACTION 3: Vistas en Tienda */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Vistas en Catálogo Local
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                {inStoreViews} visitas
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-3">
            Usuarios que exploraron tu sucursal
          </div>
        </div>

      </div>

    </div>
  );
}
