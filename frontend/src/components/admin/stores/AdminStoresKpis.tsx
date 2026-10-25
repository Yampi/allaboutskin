import React from 'react';
import { Clock, BadgeCheck, Building2, AlertTriangle, CheckCircle, Store } from 'lucide-react';

interface AdminStoresKpisProps {
  summary: {
    pending_review?: number;
    total_verified?: number;
    total_stores?: number;
  } | null;
}

export default function AdminStoresKpis({ summary }: AdminStoresKpisProps) {
  const pending = summary?.pending_review ?? 0;
  const verified = summary?.total_verified ?? 0;
  const total = summary?.total_stores ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pendientes de Aprobación
            </p>
            <p className="text-2xl font-black text-amber-700 mt-1">{pending}</p>
          </div>
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 text-[11px] text-amber-800 flex items-center gap-1 font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Esperando validación de catálogo</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tiendas Verificadas
            </p>
            <p className="text-2xl font-black text-[#4A6B5B] mt-1">{verified}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-[#4A6B5B]">
            <BadgeCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 text-[11px] text-[#4A6B5B] flex items-center gap-1 font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Activas en el directorio público</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Red Comercial
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
          </div>
          <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-md text-slate-700">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
          <Store className="w-3.5 h-3.5" />
          <span>Empresas registradas en el ecosistema</span>
        </div>
      </div>
    </div>
  );
}
