import React from 'react';
import { SecurityAuditLogItem } from '@/lib/api';

interface AdminSecurityLogsTableProps {
  logs: SecurityAuditLogItem[];
}

export default function AdminSecurityLogsTable({ logs }: AdminSecurityLogsTableProps) {
  return (
    <div className="bg-white border border-slate-200 shadow-xs rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600 tracking-wider">
            <tr>
              <th className="px-4 py-3">Severidad</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Detalle / Descripción</th>
              <th className="px-4 py-3">IP / Actor</th>
              <th className="px-4 py-3 text-right">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No hay registros de auditoría de seguridad disponibles.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] font-bold text-slate-900">
                    {log.event_type}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700 max-w-md">
                    <div>{log.description}</div>
                    {log.payload && (
                      <pre className="mt-1 p-1.5 bg-slate-50 rounded text-[10px] font-mono text-slate-500 overflow-x-auto max-h-24">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <div className="font-semibold text-slate-800">{log.ip_address || '—'}</div>
                    {log.user && <div className="text-[11px] text-[#4A6B5B]">{log.user.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('es-ES')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
