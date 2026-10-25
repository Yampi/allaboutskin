import React from 'react';
import { Eye, ExternalLink } from 'lucide-react';
import { AdminIngredientItem } from '@/lib/api';

interface AdminIngredientsTableProps {
  ingredients: AdminIngredientItem[];
  isLoading: boolean;
  onOpenDetail: (id: number) => void;
}

export default function AdminIngredientsTable({
  ingredients,
  isLoading,
  onOpenDetail,
}: AdminIngredientsTableProps) {
  return (
    <div className="bg-white border border-slate-200 shadow-xs rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600 tracking-wider">
            <tr>
              <th className="px-4 py-3">Nombre INCI / Común</th>
              <th className="px-4 py-3">Función / Categoría</th>
              <th className="px-4 py-3">Evidencia</th>
              <th className="px-4 py-3">Dosis Terapéutica</th>
              <th className="px-4 py-3">Momento de Uso</th>
              <th className="px-4 py-3 text-right">Dossier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Cargando componentes químicos del catálogo clínico...
                </td>
              </tr>
            ) : ingredients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No se encontraron ingredientes coincidentes con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              ingredients.map((ing) => (
                <tr
                  key={ing.id}
                  onClick={() => onOpenDetail(ing.id)}
                  className="hover:bg-slate-50/60 transition cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 block text-xs">
                      {ing.inci_name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {ing.common_name || (ing.cosing_id ? `CosIng: ${ing.cosing_id}` : 'Sin nombre común')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ing.is_active
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {ing.is_active ? 'Activo Clínico' : 'Excipiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ing.evidence_level === 'A'
                          ? 'bg-emerald-100 text-emerald-800 font-black'
                          : ing.evidence_level === 'B'
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Grado {ing.evidence_level || 'C'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {ing.optimal_ph_min !== null && ing.optimal_ph_max !== null ? (
                      <span className="font-mono text-[11px]">
                        pH {ing.optimal_ph_min} - {ing.optimal_ph_max}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Comed: {ing.comedogenic_rating ?? 0}/5</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="text-[11px] font-medium">{ing.recommended_timing || 'Cualquiera'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetail(ing.id);
                      }}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                    >
                      <Eye className="w-3 h-3 inline mr-1" /> Ficha
                    </button>
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
