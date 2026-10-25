import React from 'react';

interface AdminIngredientsKpisProps {
  totalCount: number;
  activesInView: number;
  highEvidenceInView: number;
}

export default function AdminIngredientsKpis({
  totalCount,
  activesInView,
  highEvidenceInView,
}: AdminIngredientsKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-lg">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Total Componentes
        </span>
        <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
        <p className="text-[11px] text-slate-400 mt-0.5">Nomenclaturas INCI registradas</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-lg">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Activos Clínicos
        </span>
        <div className="text-2xl font-black text-[#4A6B5B] mt-1">
          {activesInView} <span className="text-xs font-normal text-slate-400">(en vista)</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Con acción biológica declarada</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-lg">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Alta Evidencia (A/B)
        </span>
        <div className="text-2xl font-black text-slate-900 mt-1">{highEvidenceInView}</div>
        <p className="text-[11px] text-slate-400 mt-0.5">Respaldo en ensayos clínicos</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-lg">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Trazabilidad
        </span>
        <div className="text-2xl font-black text-slate-800 mt-1">CosIng / NLM</div>
        <p className="text-[11px] text-slate-400 mt-0.5">Reglamento CE 1223/2009</p>
      </div>
    </div>
  );
}
