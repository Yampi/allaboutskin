import React from 'react';
import { Activity, ChevronRight } from 'lucide-react';
import { AdminTabKey } from '../layout/AdminSidebar';

interface ActivityLogItem {
  id: number;
  event_type: string;
  description: string;
  severity: string;
  created_at: string;
  ip_address?: string | null;
}

interface AdminActivityFeedProps {
  logs: ActivityLogItem[];
  onNavigateTab: (tab: AdminTabKey) => void;
}

export default function AdminActivityFeed({ logs, onNavigateTab }: AdminActivityFeedProps) {
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#4A6B5B]" />
            Bitácora de Eventos y Acciones Recientes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Eventos auditados en tiempo real (autenticación, moderación y cambios).
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('security')}
          className="text-xs font-semibold text-[#4A6B5B] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Ver log</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {logs.length > 0 ? (
        <div className="space-y-2">
          {logs.slice(0, 5).map((log) => {
            const isCritical = log.severity === 'CRITICAL' || log.event_type.includes('EXCEPTION');
            const isWarning = log.severity === 'WARNING';
            return (
              <div
                key={log.id}
                className={`p-3 rounded-md border transition flex items-start justify-between gap-3 text-xs ${
                  isCritical
                    ? 'bg-rose-50 border-rose-200'
                    : isWarning
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100/60'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-600 text-white'
                          : isWarning
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {log.event_type}
                    </span>
                    {log.ip_address && (
                      <span className="text-[10px] font-mono text-slate-400">
                        IP: {log.ip_address}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-800 leading-snug truncate">
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
        <div className="py-8 text-center text-slate-400 text-xs">
          No hay eventos recientes registrados en la bitácora de auditoría.
        </div>
      )}
    </div>
  );
}
