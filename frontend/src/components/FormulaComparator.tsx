'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Swords, 
  ShieldCheck, 
  Leaf, 
  Droplets, 
  Flame, 
  RotateCcw,
  Activity,
  Layers
} from 'lucide-react';
import { auditInci, AuditReport, getRecentAudits } from '@/lib/api';

const POPULAR_DUELS = [
  {
    title: 'The Ordinary Niacinamida 10% vs. Paula’s Choice Niacinamida 20%',
    productA: 'The Ordinary Niacinamide 10% + Zinc 1%: Aqua, Niacinamide, Pentylene Glycol, Zinc PCA, Tamarindus Indica Seed Gum, Phenoxyethanol.',
    nameA: 'The Ordinary Niacinamide 10%',
    priceA: 6.50,
    productB: 'Paula’s Choice Clinical 20% Niacinamide Treatment: Water, Niacinamide, Pentylene Glycol, Portulaca Oleracea Extract, Acetyl Glucosamine, Boerhavia Diffusa Root Extract.',
    nameB: 'Paula’s Choice 20% Treatment',
    priceB: 48.00,
  },
  {
    title: 'Paula’s Choice 2% BHA vs. Cosrx BHA Blackhead Power Liquid',
    productA: "Paula's Choice 2% BHA Liquid: Water, Methylpropanediol, Butylene Glycol, Salicylic Acid, Green Tea Extract, Sodium Hydroxide.",
    nameA: "Paula's Choice 2% BHA",
    priceA: 35.00,
    productB: "Cosrx BHA Blackhead Power Liquid: Salix Alba (Willow) Bark Water, Butylene Glycol, Betaine Salicylate, Niacinamide, 1,2-Hexanediol, Arginine, Panthenol, Sodium Hyaluronate.",
    nameB: "Cosrx BHA Power Liquid",
    priceB: 21.00,
  },
  {
    title: 'Cicaplast B5+ vs. CeraVe Bálsamo Reparador Avanzado',
    productA: 'La Roche-Posay Cicaplast B5+: Aqua, Hydrogenated Polyisobutene, Dimethicone, Glycerin, Butyrospermum Parkii Butter, Panthenol, Madecassoside, Zinc Gluconate, Tribioma.',
    nameA: 'Cicaplast B5+ Baume',
    priceA: 16.50,
    productB: 'CeraVe Healing Ointment: Petrolatum, Paraffinum Liquidum, Mineral Oil, Ozokerite, Dimethicone, Hyaluronic Acid, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine.',
    nameB: 'CeraVe Healing Ointment',
    priceB: 14.00,
  }
];

export default function FormulaComparator() {
  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');
  const [reportA, setReportA] = useState<AuditReport | null>(null);
  const [reportB, setReportB] = useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (customA?: string, customB?: string) => {
    const textA = (customA ?? queryA).trim();
    const textB = (customB ?? queryB).trim();

    if (!textA || !textB) {
      setError('Por favor introduce ambas fórmulas o cosméticos para iniciar la comparativa.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [resA, resB] = await Promise.all([
        auditInci(textA, textA.length < 60 ? textA : undefined),
        auditInci(textB, textB.length < 60 ? textB : undefined),
      ]);
      setReportA(resA);
      setReportB(resB);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar las fórmulas para la comparativa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDuel = (duel: typeof POPULAR_DUELS[0]) => {
    setQueryA(duel.productA);
    setQueryB(duel.productB);
    handleCompare(duel.productA, duel.productB);
  };

  const calculateScore = (report: AuditReport | null) => {
    if (!report) return 0;
    return Math.min(100, Math.max(45,
      report.ai_clinical_copilot?.friction_risk_level === 'HIGH' ? 55 :
      report.ai_clinical_copilot?.friction_risk_level === 'MODERATE' ? 72 :
      report.ai_clinical_copilot?.barrier_warning ? 84 : 95
    ));
  };

  const scoreA = calculateScore(reportA);
  const scoreB = calculateScore(reportB);

  return (
    <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-beauty space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFECE6] pb-4">
        <div>
          <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-widest block">
            Duelo de Fórmulas & Cosméticos
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2B2A29] flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#7A9A8B]" />
            <span>Comparador Lado a Lado</span>
          </h2>
          <p className="text-xs text-[#6E6A66] mt-0.5">
            Analiza compatibilidad, concentración de activos, irritantes y valor dermatológico cara a cara.
          </p>
        </div>

        {(reportA || reportB) && (
          <button
            type="button"
            onClick={() => {
              setReportA(null);
              setReportB(null);
              setQueryA('');
              setQueryB('');
            }}
            className="text-xs font-semibold text-[#6E6A66] hover:text-[#A46864] flex items-center gap-1.5 self-start sm:self-center touch-target"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Duelo</span>
          </button>
        )}
      </div>

      {/* Preset Duels Quick Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold text-[#9C9790] uppercase tracking-wider flex items-center gap-1 mr-1">
          <Flame className="w-3.5 h-3.5 text-[#C4A482]" />
          Duelos Frecuentes:
        </span>
        {POPULAR_DUELS.map((duel, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectDuel(duel)}
            className="text-xs bg-[#FAF8F5] hover:bg-[#EFF5F1] hover:text-[#4F6D60] text-[#6E6A66] font-medium px-3 py-1.5 rounded-full border border-[#EFECE6] transition-all cursor-pointer touch-target"
          >
            <span>{duel.title}</span>
          </button>
        ))}
      </div>

      {/* Inputs Form: Formula A vs Formula B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Formula A Input */}
        <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFECE6] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4F6D60] bg-[#EFF5F1] px-2.5 py-0.5 rounded-full border border-[#7A9A8B]/30 uppercase tracking-wider">
              Cosmético A
            </span>
          </div>
          <textarea
            rows={3}
            value={queryA}
            onChange={(e) => setQueryA(e.target.value)}
            placeholder="Escribe el primer producto o pega sus ingredientes..."
            className="w-full bg-white border border-[#EFECE6] rounded-xl p-3 text-xs sm:text-sm text-[#2B2A29] focus:outline-none focus:border-[#7A9A8B] resize-none"
          />
        </div>

        {/* Formula B Input */}
        <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFECE6] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A46864] bg-[#F8EFEA] px-2.5 py-0.5 rounded-full border border-[#E8D5D0] uppercase tracking-wider">
              Cosmético B
            </span>
          </div>
          <textarea
            rows={3}
            value={queryB}
            onChange={(e) => setQueryB(e.target.value)}
            placeholder="Escribe el segundo producto o pega sus ingredientes..."
            className="w-full bg-white border border-[#EFECE6] rounded-xl p-3 text-xs sm:text-sm text-[#2B2A29] focus:outline-none focus:border-[#7A9A8B] resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Compare Button */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          disabled={isLoading || !queryA.trim() || !queryB.trim()}
          onClick={() => handleCompare()}
          className="bg-[#7A9A8B] hover:bg-[#688577] disabled:opacity-50 text-white font-bold px-8 py-3 rounded-full shadow-beauty flex items-center gap-2 text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer touch-target"
        >
          {isLoading ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              <span>Analizando Química & Evidencia...</span>
            </>
          ) : (
            <>
              <Swords className="w-4 h-4" />
              <span>Ejecutar Comparativa Lado a Lado</span>
            </>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* SIDE-BY-SIDE RESULT MATRIX                               */}
      {/* ======================================================== */}
      {reportA && reportB && (
        <div className="pt-4 border-t border-[#EFECE6] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Side by Side Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Product A Card */}
            <div className="bg-[#FAF8F5] rounded-3xl p-5 border-2 border-[#7A9A8B]/40 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#4F6D60] uppercase tracking-wider">
                    Opción A
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#2B2A29]">
                    {reportA.meta.product_name}
                  </h3>
                </div>
                {/* Score Circular Dial A */}
                <div className="w-14 h-14 rounded-full bg-white border-2 border-[#7A9A8B] flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[#4F6D60] font-serif leading-none">{scoreA}</span>
                  <span className="text-[8px] text-[#9C9790] uppercase">/100</span>
                </div>
              </div>

              <p className="text-xs text-[#6E6A66] leading-relaxed">
                {reportA.ai_clinical_copilot.plain_language_summary}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#EFECE6]">
                <span className="text-[10px] bg-white border border-[#EFECE6] text-[#4F6D60] font-semibold px-2.5 py-0.5 rounded-full">
                  🌿 {reportA.meta.active_ingredients_count} Activos
                </span>
                <span className="text-[10px] bg-white border border-[#EFECE6] text-[#6E6A66] font-semibold px-2.5 py-0.5 rounded-full">
                  🕒 {reportA.layering_and_usage.recommended_timing === 'AM' ? 'Mañana' : reportA.layering_and_usage.recommended_timing === 'PM' ? 'Noche' : 'AM/PM'}
                </span>
              </div>
            </div>

            {/* Product B Card */}
            <div className="bg-[#FAF8F5] rounded-3xl p-5 border-2 border-[#A46864]/40 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#A46864] uppercase tracking-wider">
                    Opción B
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#2B2A29]">
                    {reportB.meta.product_name}
                  </h3>
                </div>
                {/* Score Circular Dial B */}
                <div className="w-14 h-14 rounded-full bg-white border-2 border-[#A46864] flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[#A46864] font-serif leading-none">{scoreB}</span>
                  <span className="text-[8px] text-[#9C9790] uppercase">/100</span>
                </div>
              </div>

              <p className="text-xs text-[#6E6A66] leading-relaxed">
                {reportB.ai_clinical_copilot.plain_language_summary}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#EFECE6]">
                <span className="text-[10px] bg-white border border-[#EFECE6] text-[#A46864] font-semibold px-2.5 py-0.5 rounded-full">
                  🌿 {reportB.meta.active_ingredients_count} Activos
                </span>
                <span className="text-[10px] bg-white border border-[#EFECE6] text-[#6E6A66] font-semibold px-2.5 py-0.5 rounded-full">
                  🕒 {reportB.layering_and_usage.recommended_timing === 'AM' ? 'Mañana' : reportB.layering_and_usage.recommended_timing === 'PM' ? 'Noche' : 'AM/PM'}
                </span>
              </div>
            </div>
          </div>

          {/* VEREDICTO DERMATOLÓGICO Y COMPARATIVA DE ATRIBUTOS */}
          <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-[#EFECE6] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7A9A8B]" />
              <h4 className="font-serif font-bold text-base text-[#2B2A29]">
                Veredicto Comparativo de Formulación
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              {/* Compatibilidad Sensible */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#EFECE6] space-y-1">
                <span className="font-bold text-[#9C9790] text-[10px] uppercase block">Para Piel Sensible:</span>
                <span className="font-semibold text-[#2B2A29] block">
                  {scoreA > scoreB ? `🏆 ${reportA.meta.product_name} es más calmante.` : scoreB > scoreA ? `🏆 ${reportB.meta.product_name} es más calmante.` : 'Ambos presentan un perfil de tolerancia similar.'}
                </span>
              </div>

              {/* Potencia Activa */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#EFECE6] space-y-1">
                <span className="font-bold text-[#9C9790] text-[10px] uppercase block">Densidad de Activos:</span>
                <span className="font-semibold text-[#2B2A29] block">
                  {reportA.meta.active_ingredients_count > reportB.meta.active_ingredients_count 
                    ? `🏆 Opción A (${reportA.meta.active_ingredients_count} vs ${reportB.meta.active_ingredients_count})`
                    : `🏆 Opción B (${reportB.meta.active_ingredients_count} vs ${reportA.meta.active_ingredients_count})`}
                </span>
              </div>

              {/* Integración con Skin Cycling */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#EFECE6] space-y-1">
                <span className="font-bold text-[#9C9790] text-[10px] uppercase block">Fase de Skin Cycling:</span>
                <span className="font-semibold text-[#2B2A29] block">
                  {reportA.layering_and_usage.recommended_timing === 'PM' ? '🌙 Noches de Tratamiento' : '☀️ Rutina de Día'}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
