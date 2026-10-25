import React from 'react';
import { Users, Store, ShieldAlert, ShieldCheck, Activity, ChevronRight } from 'lucide-react';
import { AdminTabKey } from '../layout/AdminSidebar';

interface AdminOverviewKpisProps {
  totalUsersCount: number;
  totalStoresCount: number;
  pendingStoresCount: number;
  criticalEventsCount: number;
  isHealthy: boolean;
  onNavigateTab: (tab: AdminTabKey) => void;
}

export default function AdminOverviewKpis({
  totalUsersCount,
  totalStoresCount,
  pendingStoresCount,
  criticalEventsCount,
  isHealthy,
  onNavigateTab,
}: AdminOverviewKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Usuarios registrados */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Usuarios registrados
          </span>
          <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 mt-2">
          {totalUsersCount.toLocaleString('es-ES')}
        </div>
        <button
          onClick={() => onNavigateTab('users')}
          className="text-xs font-semibold text-[#4A6B5B] hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
        >
          <span>Gestionar usuarios</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* KPI 2: Tiendas aliadas */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tiendas aliadas
          </span>
          <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
            <Store className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 mt-2">
          {totalStoresCount.toLocaleString('es-ES')}
        </div>
        <div className="flex items-center justify-between mt-1">
          <button
            onClick={() => onNavigateTab('stores')}
            className="text-xs font-semibold text-[#4A6B5B] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Ver comercios</span>
            <ChevronRight className="w-3 h-3" />
          </button>
          {pendingStoresCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              {pendingStoresCount} por revisar
            </span>
          )}
        </div>
      </div>

      {/* KPI 3: Alertas del Sistema */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Alertas del Sistema
          </span>
          <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
            criticalEventsCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {criticalEventsCount > 0 ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 mt-2">{criticalEventsCount}</div>
        <button
          onClick={() => onNavigateTab('security')}
          className="text-xs font-semibold text-[#4A6B5B] hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
        >
          <span>{criticalEventsCount > 0 ? 'Inspeccionar incidencias' : 'Bitácora segura'}</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* KPI 4: Infraestructura */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Infraestructura
            </span>
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm font-extrabold text-slate-900 mt-2 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{isHealthy ? '100% Operativo' : 'Estado Degradado'}</span>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('settings')}
          className="text-xs font-semibold text-[#4A6B5B] hover:underline inline-flex items-center gap-1 mt-2 text-left cursor-pointer"
        >
          <span>Chequeo de nodos</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
