import React from 'react';
import { Server, Database } from 'lucide-react';

interface AdminSettingsHealthProps {
  systemHealth: any;
}

export default function AdminSettingsHealth({ systemHealth }: AdminSettingsHealthProps) {
  if (!systemHealth) return null;

  return (
    <div className="bg-white border border-slate-200 shadow-xs p-5 rounded-lg">
      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
        <Server className="w-4 h-4 text-[#4A6B5B]" />
        <span>Estado de Infraestructura y Servicios</span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
          <div className="text-slate-400 text-[11px] mb-1">Base de Datos</div>
          <div className="font-bold text-[#4A6B5B] flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" /> Conectada
          </div>
        </div>
        <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
          <div className="text-slate-400 text-[11px] mb-1">Motor PHP / Framework</div>
          <div className="font-bold text-slate-800">
            PHP {systemHealth.php_version || '8.2+'} / Laravel {systemHealth.laravel_version || '11'}
          </div>
        </div>
        <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
          <div className="text-slate-400 text-[11px] mb-1">Usuarios Totales</div>
          <div className="font-bold text-[#4A6B5B]">{systemHealth.total_users ?? 0}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
          <div className="text-slate-400 text-[11px] mb-1">Eventos Auditados</div>
          <div className="font-bold text-slate-800">{systemHealth.total_security_events ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
