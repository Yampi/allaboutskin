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
  Sparkles,
  ShieldAlert,
  Zap
} from 'lucide-react';

interface AdminDashboardOverviewProps {
  onNavigateTab: (tab: 'users' | 'stores' | 'security' | 'settings' | 'scraper' | 'products' | 'ingredients') => void;
  systemHealth?: {
    database?: string;
    ingredient_dataset?: string;
  } | null;
  totalStoresCount?: number;
  totalUsersCount?: number;
  pendingStoresCount?: number;
  criticalEventsCount?: number;
  realActivityLogs?: Array<{
    id: number;
    event_type: string;
    description: string;
    severity: string;
    created_at: string;
    ip_address?: string | null;
  }>;
}

export default function AdminDashboardOverview({
  onNavigateTab,
  systemHealth,
  totalStoresCount = 0,
  totalUsersCount = 0,
  pendingStoresCount = 0,
  criticalEventsCount = 0,
  realActivityLogs = [],
}: AdminDashboardOverviewProps) {
  const isHealthy = systemHealth?.database === 'connected';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* 1. TOP KPI CARDS (DATOS 100% REALES DEL BACKEND)         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Usuarios totales */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Usuarios registrados
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalUsersCount.toLocaleString('es-ES')}
          </div>
          <button
            onClick={() => onNavigateTab('users')}
            className="text-[11px] font-bold text-purple-600 hover:text-purple-700 transition inline-flex items-center gap-1 mt-1 cursor-pointer"
          >
            <span>Gestionar usuarios</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* KPI 2: Tiendas registradas */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tiendas aliadas
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalStoresCount.toLocaleString('es-ES')}
          </div>
          <div className="flex items-center justify-between mt-1">
            <button
              onClick={() => onNavigateTab('stores')}
              className="text-[11px] font-bold text-sky-600 hover:text-sky-700 transition inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Ver comercios</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            {pendingStoresCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200 animate-pulse">
                {pendingStoresCount} por revisar
              </span>
            )}
          </div>
        </div>

        {/* KPI 3: Auditoría y Seguridad */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Alertas del Sistema
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              criticalEventsCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {criticalEventsCount > 0 ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {criticalEventsCount}
          </div>
          <button
            onClick={() => onNavigateTab('security')}
            className={`text-[11px] font-bold transition inline-flex items-center gap-1 mt-1 cursor-pointer ${
              criticalEventsCount > 0 ? 'text-rose-600 hover:text-rose-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{criticalEventsCount > 0 ? 'Inspeccionar incidencias' : 'Bitácora segura sin fallas'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* KPI 4: Estado del Sistema */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Infraestructura
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-extrabold text-slate-900 mt-2 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isHealthy ? '100% Operativo' : 'Estado Degradado'}</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('settings')}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition inline-flex items-center gap-1 mt-2 text-left cursor-pointer"
          >
            <span>Chequeo de nodos y BD</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FEED DE ACTIVIDAD & BITÁCORA EN TIEMPO REAL            */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* COL 1 y 2: BITÁCORA REAL DE EVENTOS / SEGURIDAD */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                Bitácora de Eventos y Acciones Recientes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Eventos auditados en tiempo real (autenticación, moderación, fallas y cambios).
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('security')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver log completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {realActivityLogs.length > 0 ? (
            <div className="space-y-3">
              {realActivityLogs.slice(0, 6).map((log) => {
                const isCritical = log.severity === 'CRITICAL' || log.event_type.includes('EXCEPTION');
                const isWarning = log.severity === 'WARNING';
                return (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                      isCritical
                        ? 'bg-rose-50/60 border-rose-200/80'
                        : isWarning
                        ? 'bg-amber-50/60 border-amber-200/80'
                        : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-600 text-white'
                            : isWarning
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {log.event_type}
                        </span>
                        {log.ip_address && (
                          <span className="text-[10px] font-mono text-slate-400">
                            IP: {log.ip_address}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">
                        {log.description}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-400 shrink-0 font-medium">
                      {new Date(log.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No hay eventos recientes registrados en la bitácora de auditoría.
            </div>
          )}
        </div>

        {/* COL 3: MONITOREO DE NODOS Y SALUD DEL SERVICIO */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-emerald-600" />
              Estado de los Nodos
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Monitoreo activo de conectividad, base de datos y dataset dermatológico INCI.
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">Base de Datos</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  systemHealth?.database === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {systemHealth?.database === 'connected' ? 'Conectada' : 'Desconectada'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FlaskConical className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">Dataset INCI</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  systemHealth?.ingredient_dataset === 'loaded'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {systemHealth?.ingredient_dataset === 'loaded' ? 'Cargado' : 'Vacío'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">Crawler & Scraper</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  Listo
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Trazabilidad activa</span>
            <button
              onClick={() => onNavigateTab('settings')}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver configuración</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
