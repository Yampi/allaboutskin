import React from 'react';
import { BarChart3, ShieldCheck, TrendingUp, ShoppingBag, MapPin } from 'lucide-react';

export default function AdminB2BIntelligence() {
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#4A6B5B]/10 text-[#4A6B5B]">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Inteligencia B2B: Leads de Farmacias y Demanda Agregada (Zero-PII)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Datos agregados para monetización con farmacias aliadas sin almacenar PII de usuarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Garantía Zero-PII Activa</span>
          </span>
        </div>
      </div>

      {/* 4 Métricas Clave de Negocio B2B */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-md bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Leads a Farmacias (Mes)
          </span>
          <div className="text-xl font-black text-slate-900 flex items-center justify-between">
            <span>1,420</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Clics con intención de compra directa</span>
        </div>

        <div className="p-3.5 rounded-md bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Brecha de Demanda (Gap)
          </span>
          <div className="text-xl font-black text-amber-600 flex items-center justify-between">
            <span>312</span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Sin Stock
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Oportunidades de importación / catálogo</span>
        </div>

        <div className="p-3.5 rounded-md bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Conversión de Escaneo
          </span>
          <div className="text-xl font-black text-slate-900 flex items-center justify-between">
            <span>24.8%</span>
            <span className="text-[10px] font-bold text-emerald-600">+3.2% vs meta</span>
          </div>
          <span className="text-[10px] text-slate-400">De escáner a 'Añadir a Rutina'</span>
        </div>

        <div className="p-3.5 rounded-md bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Adherencia Skin Cycling
          </span>
          <div className="text-xl font-black text-[#4A6B5B] flex items-center justify-between">
            <span>86%</span>
            <span className="text-[10px] font-bold text-[#4A6B5B] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Alta Fidelidad
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Reabastecimiento recurrente de envases</span>
        </div>
      </div>
    </div>
  );
}
