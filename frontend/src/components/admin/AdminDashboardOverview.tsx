'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Store,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Activity,
  Server,
  Database,
  Globe,
  Radio,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  FlaskConical,
  Sparkles
} from 'lucide-react';

interface AdminDashboardOverviewProps {
  onNavigateTab: (tab: 'users' | 'stores' | 'security' | 'settings' | 'scraper' | 'products' | 'ingredients') => void;
  systemHealth?: {
    database?: string;
    ingredient_dataset?: string;
  } | null;
  totalStoresCount?: number;
  totalUsersCount?: number;
}

export default function AdminDashboardOverview({
  onNavigateTab,
  systemHealth,
  totalStoresCount,
  totalUsersCount,
}: AdminDashboardOverviewProps) {
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<string | null>(null);

  // KPIs
  const usersCount = totalUsersCount || 24832;
  const storesCount = totalStoresCount || 1248;
  const productsCount = 8642;
  const issuesCount = 3;

  // Donut SVG Parameters
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Segments (Clientes 78%, Tiendas 18%, Admins 3%, Super Admin 1%)
  const segments = [
    { id: 'clients', label: 'Clientes', percent: 78, color: '#38BDF8', strokeColor: '#0284C7' },
    { id: 'stores', label: 'Tiendas', percent: 18, color: '#A855F7', strokeColor: '#7C3AED' },
    { id: 'admins', label: 'Admins', percent: 3, color: '#F43F5E', strokeColor: '#E11D48' },
    { id: 'superadmin', label: 'Super Admin', percent: 1, color: '#F59E0B', strokeColor: '#D97706' },
  ];

  let cumulativePercent = 0;

  // System Health items
  const healthMetrics = [
    { name: 'API / Backend', uptime: '98.7%', status: 'optimal', icon: Server },
    { name: 'Base de datos (PostgreSQL)', uptime: '99.9%', status: 'optimal', icon: Database },
    { name: 'Scrapers y fuentes', uptime: '100%', status: 'optimal', icon: Radio },
    { name: 'CDN / Hosting', uptime: '99.8%', status: 'optimal', icon: Globe },
  ];

  // Recent Activity Feed
  const recentActivity = [
    {
      id: '1',
      title: 'Nuevo usuario registrado',
      subtitle: 'maria.lopez@email.com',
      time: 'hace 2 min',
      icon: Users,
      badgeColor: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      id: '2',
      title: 'Tienda pendiente de verificación',
      subtitle: 'Farmacia El Valle',
      time: 'hace 12 min',
      icon: Store,
      badgeColor: 'bg-amber-50 text-amber-600 border-amber-100',
      actionTab: 'stores' as const,
    },
    {
      id: '3',
      title: 'Producto actualizado',
      subtitle: 'La Roche-Posay Anthelios',
      time: 'hace 28 min',
      icon: Package,
      badgeColor: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      id: '4',
      title: 'Incidencia resuelta',
      subtitle: 'Error en scraper de Farmatodo',
      time: 'hace 1 h',
      icon: CheckCircle2,
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      actionTab: 'scraper' as const,
    },
    {
      id: '5',
      title: 'Nuevo comentario científico',
      subtitle: 'Dr. Pérez (Dermatólogo)',
      time: 'hace 2 h',
      icon: FlaskConical,
      badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      actionTab: 'ingredients' as const,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* 1. TOP KPI CARDS (4 COLUMNAS - MOCKUP MORADO ADMIN)      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Usuarios totales */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Usuarios totales
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {usersCount.toLocaleString('es-ES')}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+8% vs. mes anterior</span>
          </div>
        </div>

        {/* KPI 2: Tiendas activas */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tiendas activas
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {storesCount.toLocaleString('es-ES')}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12% vs. mes anterior</span>
          </div>
        </div>

        {/* KPI 3: Productos en catálogo */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Productos en catálogo
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {productsCount.toLocaleString('es-ES')}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+5% vs. mes anterior</span>
          </div>
        </div>

        {/* KPI 4: Incidencias abiertas */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Incidencias abiertas
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600 mt-2">
              {issuesCount}
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-70% vs. mes anterior</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PANELES CENTRALES (3 COLUMNAS - TIMELINE, SALUD, DONUT)*/}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* PANEL 1: ACTIVIDAD RECIENTE (TIMELINE) */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Actividad reciente
              </h2>
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            </div>

            <div className="space-y-3.5">
              {recentActivity.map((act) => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    onClick={() => act.actionTab && onNavigateTab(act.actionTab)}
                    className={`flex items-start gap-3 text-xs p-1.5 rounded-xl transition ${
                      act.actionTab ? 'cursor-pointer hover:bg-purple-50/60' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${act.badgeColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 leading-tight truncate">
                        {act.title}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {act.subtitle} &bull; <span className="text-slate-400">{act.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('security')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 transition inline-flex items-center gap-1 mt-4 text-left pt-2 border-t border-slate-50"
          >
            <span>Ver todas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* PANEL 2: SALUD DEL SISTEMA (UPTIME & SERVICIOS) */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Salud del sistema
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Operativo
              </span>
            </div>

            {/* Overall status badge */}
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span className="text-xs font-bold text-emerald-800">
                Todos los servicios operativos
              </span>
            </div>

            {/* Metrics List */}
            <div className="space-y-3">
              {healthMetrics.map((metric, i) => {
                const Icon = metric.icon;
                return (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{metric.name}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 text-xs">
                      {metric.uptime}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('settings')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 transition inline-flex items-center gap-1 mt-4 text-left pt-2 border-t border-slate-50"
          >
            <span>Ver detalle</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* PANEL 3: DISTRIBUCIÓN DE USUARIOS (DONUT CHART SVG) */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight mb-2">
              Distribución de usuarios
            </h2>

            {/* Donut Chart SVG */}
            <div className="relative flex items-center justify-center my-3">
              <svg width={size} height={size} className="transform -rotate-90">
                {segments.map((seg) => {
                  const strokeDasharray = `${(seg.percent / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = - (cumulativePercent / 100) * circumference;
                  cumulativePercent += seg.percent;

                  return (
                    <circle
                      key={seg.id}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="transparent"
                      stroke={seg.strokeColor}
                      strokeWidth={hoveredDonutSegment === seg.id ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredDonutSegment(seg.id)}
                      onMouseLeave={() => setHoveredDonutSegment(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Total Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-lg font-black text-slate-900 leading-none">
                  {usersCount.toLocaleString('es-ES')}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Total usuarios
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              {segments.map((seg) => (
                <div
                  key={seg.id}
                  className={`flex items-center gap-1.5 p-1 rounded-lg transition ${
                    hoveredDonutSegment === seg.id ? 'bg-purple-50 font-bold' : ''
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: seg.strokeColor }}
                  />
                  <span className="text-slate-600 text-[11px] truncate">{seg.label}:</span>
                  <span className="font-bold text-slate-800 text-[11px] ml-auto">
                    {seg.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('users')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 transition inline-flex items-center gap-1 mt-4 text-left pt-2 border-t border-slate-50"
          >
            <span>Gestionar usuarios & roles</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
