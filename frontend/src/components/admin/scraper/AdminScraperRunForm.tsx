import React from 'react';
import { Play } from 'lucide-react';

interface AdminScraperRunFormProps {
  form: {
    scraper_name: string;
    country_code: string;
    ingredient_id: string;
    search_term: string;
    dry_run: boolean;
    limit: number;
    store_chain: string;
  };
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
  isRunning: boolean;
  activeIngredients?: Array<{ id: number; inci_name: string; common_name?: string }>;
}

export default function AdminScraperRunForm({
  form,
  onChange,
  onSubmit,
  isRunning,
  activeIngredients = [],
}: AdminScraperRunFormProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
      <div className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-2">
        Ejecución Manual de Conectores (Rastreo Dirigido)
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        <div>
          <label className="text-[11px] text-slate-500 font-semibold block mb-1">Conector</label>
          <select
            value={form.scraper_name}
            onChange={(e) => onChange('scraper_name', e.target.value)}
            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          >
            <option value="farmatodo">Farmatodo API (VTEX)</option>
            <option value="locatel">Locatel Venezuela</option>
            <option value="drogueria_colombia">Droguerías Colombia</option>
            <option value="cruz_verde">Cruz Verde Chile</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-500 font-semibold block mb-1">País</label>
          <select
            value={form.country_code}
            onChange={(e) => onChange('country_code', e.target.value)}
            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          >
            <option value="VE">Venezuela (VE)</option>
            <option value="CO">Colombia (CO)</option>
            <option value="CL">Chile (CL)</option>
            <option value="MX">México (MX)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-500 font-semibold block mb-1">Activo Clínico</label>
          <select
            value={form.ingredient_id}
            onChange={(e) => onChange('ingredient_id', e.target.value)}
            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          >
            <option value="">Cualquiera / Por término</option>
            {activeIngredients.map((ing) => (
              <option key={ing.id} value={String(ing.id)}>
                {ing.inci_name} {ing.common_name ? `(${ing.common_name})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-500 font-semibold block mb-1">Término de Búsqueda</label>
          <input
            type="text"
            placeholder="Ej: Niacinamida, Retinol..."
            value={form.search_term}
            onChange={(e) => onChange('search_term', e.target.value)}
            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={form.dry_run}
            onChange={(e) => onChange('dry_run', e.target.checked)}
            className="rounded border-slate-300 text-[#4A6B5B] focus:ring-[#4A6B5B]"
          />
          <span>Modo Simulación (Dry Run sin guardar en BD)</span>
        </label>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isRunning}
          className="px-4 py-1.5 bg-[#4A6B5B] hover:bg-[#3d594b] text-white text-xs font-bold rounded-md shadow-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
        >
          {isRunning ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          <span>{isRunning ? 'Ejecutando...' : 'Iniciar Rastreo'}</span>
        </button>
      </div>
    </div>
  );
}
