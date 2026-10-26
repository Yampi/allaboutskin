import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

interface AdminGoogleDiscoveryFormProps {
  form: { term: string; limit: number; crawl: boolean };
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
  isDiscovering: boolean;
}

export default function AdminGoogleDiscoveryForm({
  form,
  onChange,
  onSubmit,
  isDiscovering,
}: AdminGoogleDiscoveryFormProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Compass className="w-4 h-4 text-[#4A6B5B]" />
        <span className="font-bold text-xs text-slate-900">
          Descubrimiento Web de Farmacias & Cosmética (Google Serper)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="sm:col-span-2">
          <label className="text-[11px] text-slate-500 font-semibold block mb-1">
            Término de Descubrimiento o Dominio
          </label>
          <input
            type="text"
            placeholder="Ej: farmacias dermocosmética caracas, tienda skincare bogota..."
            value={form.term}
            onChange={(e) => onChange('term', e.target.value)}
            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-500 font-semibold block mb-1">
            Límite de Resultados
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={form.limit}
            onChange={(e) => onChange('limit', parseInt(e.target.value) || 5)}
            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={form.crawl}
            onChange={(e) => onChange('crawl', e.target.checked)}
            className="rounded border-slate-300 text-[#4A6B5B] focus:ring-[#4A6B5B]"
          />
          <span>Rastrear e indexar automáticamente los dominios encontrados</span>
        </label>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isDiscovering}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md shadow-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
        >
          {isDiscovering ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{isDiscovering ? 'Descubriendo...' : 'Buscar Nuevas Fuentes'}</span>
        </button>
      </div>
    </div>
  );
}
