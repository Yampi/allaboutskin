'use client';

import React from 'react';
import { TrendingUp, ShieldCheck, ChevronRight, Users, Sparkles } from 'lucide-react';
import { BusinessAnalyticsData } from '@/lib/api';

interface StoreOverviewDemandGapProps {
  analytics: BusinessAnalyticsData | null;
  onNavigateTab: (tab: 'catalog' | 'branches' | 'profile') => void;
}

export default function StoreOverviewDemandGap({
  analytics,
  onNavigateTab,
}: StoreOverviewDemandGapProps) {
  const demandGap = analytics?.demand_gap_opportunities || [];
  const demographics = analytics?.anonymous_demographics;
  const sampleSize = demographics?.total_sample_size ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-[#4A6B5B]" />
                Oportunidad Comercial B2B
              </div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Ingredientes con evidencia que no ofreces
              </h2>
            </div>
          </div>

          {demandGap.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-2">Ingrediente Activo</th>
                    <th className="pb-2">Evidencia</th>
                    <th className="pb-2">Beneficio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {demandGap.slice(0, 4).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 font-bold text-slate-800">
                        <div>{item.common_name}</div>
                        <div className="text-[10px] font-mono text-slate-400 font-normal">{item.inci_name}</div>
                      </td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[10px]">
                          Grado {item.evidence_level}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600 truncate max-w-xs">{item.benefit ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              Tu catálogo ya cubre los ingredientes con evidencia A/B registrados.
            </div>
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4A6B5B]" />
            Ingredientes con evidencia A/B ausentes de tu catálogo.
          </span>
          <button
            onClick={() => onNavigateTab('catalog')}
            className="text-[#4A6B5B] font-semibold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <span>Importar productos</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#4A6B5B]" />
              Biotipos de usuarios
            </h3>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-medium">
              Anónimo
            </span>
          </div>

          {sampleSize === 0 ? (
            <p className="py-6 text-center text-slate-400 text-xs">
              Aún no hay perfiles de piel registrados.
            </p>
          ) : (
          <div className="space-y-2.5 mt-3">
            {[
              { label: 'Piel Grasa / Acné', pct: demographics?.oily_skin_pct ?? 0 },
              { label: 'Piel Seca', pct: demographics?.dry_skin_pct ?? 0 },
              { label: 'Piel Mixta', pct: demographics?.combination_skin_pct ?? 0 },
              { label: 'Piel Sensible', pct: demographics?.sensitive_skin_pct ?? 0 },
            ].map((bio, i) => (
              <div key={i}>
                <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
                  <span>{bio.label}</span>
                  <span className="font-bold text-slate-800">{bio.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded h-1.5 overflow-hidden">
                  <div className="bg-[#4A6B5B] h-1.5 rounded" style={{ width: `${bio.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        <p className="mt-3 text-[10px] text-slate-400">
          Datos agregados de {sampleSize} perfil(es), sin información personal.
        </p>
      </div>
    </div>
  );
}
