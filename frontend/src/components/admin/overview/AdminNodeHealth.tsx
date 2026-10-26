import React from 'react';
import { Server, Database, FlaskConical, Radio, ChevronRight } from 'lucide-react';
import { AdminTabKey } from '../layout/AdminSidebar';

interface AdminNodeHealthProps {
  systemHealth?: {
    database?: string;
    ingredient_dataset?: string;
  } | null;
  onNavigateTab: (tab: AdminTabKey) => void;
}

export default function AdminNodeHealth({ systemHealth, onNavigateTab }: AdminNodeHealthProps) {
  const isDbConnected = systemHealth?.database === 'connected';
  const isDatasetLoaded = systemHealth?.ingredient_dataset === 'loaded';

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-2">
          <Server className="w-4 h-4 text-[#4A6B5B]" />
          Estado de los Nodos
        </h3>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Monitoreo activo de conectividad, base de datos y dataset dermatológico INCI.
        </p>

        <div className="space-y-2.5">
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-semibold text-slate-800">Base de Datos SQL</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isDbConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isDbConnected ? 'Conectada' : 'Desconectada'}
            </span>
          </div>

          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-semibold text-slate-800">Dataset INCI</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isDatasetLoaded
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isDatasetLoaded ? 'Cargado' : 'Vacío'}
            </span>
          </div>

          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-semibold text-slate-800">Crawler & Scraper</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Listo
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Trazabilidad activa</span>
        <button
          onClick={() => onNavigateTab('settings')}
          className="text-xs font-semibold text-[#4A6B5B] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Configuración</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
