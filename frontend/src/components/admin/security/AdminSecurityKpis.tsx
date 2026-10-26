import React from 'react';

interface SecurityStats {
  failed_logins_24h?: number;
  throttled_requests_24h?: number;
  critical_events_count?: number;
  total_admins_count?: number;
}

interface AdminSecurityKpisProps {
  stats: SecurityStats | null;
}

export default function AdminSecurityKpis({ stats }: AdminSecurityKpisProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-lg">
        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
          Logins Fallidos (24h)
        </div>
        <div className="text-2xl font-black text-rose-700">
          {stats.failed_logins_24h ?? 0}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Intentos con clave errónea</div>
      </div>

      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-lg">
        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
          Ataques Mitigados / Rate Limits
        </div>
        <div className="text-2xl font-black text-amber-700">
          {stats.throttled_requests_24h ?? 0}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Bloqueos de fuerza bruta</div>
      </div>

      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-lg">
        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
          Alertas Críticas
        </div>
        <div className="text-2xl font-black text-slate-900">
          {stats.critical_events_count ?? 0}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Cambios de rol & config</div>
      </div>

      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-lg">
        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
          Administradores Activos
        </div>
        <div className="text-2xl font-black text-[#4A6B5B]">
          {stats.total_admins_count ?? 0}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Super Admin & Admins</div>
      </div>
    </div>
  );
}
