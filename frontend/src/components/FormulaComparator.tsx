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
    <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#ECE6DC] shadow-editorial space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECE6DC] pb-4">
        <div>
          <span className="text-[10px] font-bold text-[#99938B] uppercase tracking-widest block">
            Comparativa de Fórmulas
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1B1A] flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#4F6D60]" />
            <span>Comparador Lado a Lado</span>
          </h2>
          <p className="text-xs text-[#66615C] mt-0.5">
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
            className="text-xs font-semibold text-[#66615C] hover:text-[#943C36] flex items-center gap-1.5 self-start sm:self-center touch-target"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Duelo</span>
          </button>
        )}
      </div>

      {/* Preset Duels Quick Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold text-[#99938B] uppercase tracking-wider flex items-center gap-1 mr-1">
          <Flame className="w-3.5 h-3.5 text-[#B89B7D]" />
          Duelos Frecuentes:
        </span>
        {POPULAR_DUELS.map((duel, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectDuel(duel)}
            className="text-xs bg-[#FAF8F5] hover:bg-[#EEF4F0] hover:text-[#2D4A3E] text-[#66615C] font-medium px-3 py-1.5 rounded-full border border-[#ECE6DC] transition-all cursor-pointer touch-target"
          >
            <span>{duel.title}</span>
          </button>
        ))}
      </div>

      {/* Inputs Form: Formula A vs Formula B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Formula A Input */}
        <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#ECE6DC] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2D4A3E] bg-[#EEF4F0] px-2.5 py-0.5 rounded-full border border-[#4F6D60]/30 uppercase tracking-wider">
              Cosmético A
            </span>
          </div>
          <textarea
            rows={3}
            value={queryA}
            onChange={(e) => setQueryA(e.target.value)}
            placeholder="Escribe el primer producto o pega sus ingredientes..."
            className="w-full bg-white border border-[#ECE6DC] rounded-xl p-3 text-xs sm:text-sm text-[#1C1B1A] focus:outline-none focus:border-[#4F6D60] resize-none"
          />
        </div>

        {/* Formula B Input */}
        <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#ECE6DC] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#943C36] bg-[#FDF2F0] px-2.5 py-0.5 rounded-full border border-[#D97D75]/40 uppercase tracking-wider">
              Cosmético B
            </span>
          </div>
          <textarea
            rows={3}
            value={queryB}
            onChange={(e) => setQueryB(e.target.value)}
            placeholder="Escribe el segundo producto o pega sus ingredientes..."
            className="w-full bg-white border border-[#ECE6DC] rounded-xl p-3 text-xs sm:text-sm text-[#1C1B1A] focus:outline-none focus:border-[#4F6D60] resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[#FDF2F0] border border-[#D97D75]/40 text-[#943C36] rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D97D75] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Compare Button */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          disabled={isLoading || !queryA.trim() || !queryB.trim()}
          onClick={() => handleCompare()}
          className="bg-[#4F6D60] hover:bg-[#3D5B4E] disabled:opacity-50 text-white font-semibold px-8 py-2.5 rounded-xl shadow-editorial flex items-center gap-2 text-xs sm:text-sm transition-all duration-200 cursor-pointer touch-target"
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

      {/* SIDE-BY-SIDE RESULT MATRIX */}
      {reportA && reportB && (
        <div className="pt-4 border-t border-[#ECE6DC] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Side by Side Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Product A Card */}
            <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#4F6D60]/40 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#2D4A3E] uppercase tracking-wider">
                    Opción A
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#1C1B1A]">
                    {reportA.meta.product_name}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-white border border-[#4F6D60] flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[#2D4A3E] font-serif leading-none">{scoreA}</span>
                  <span className="text-[8px] text-[#99938B] uppercase">/100</span>
                </div>
              </div>

              <p className="text-xs text-[#66615C] leading-relaxed">
                {reportA.ai_clinical_copilot.plain_language_summary}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#ECE6DC]">
                <span className="text-[10px] bg-white border border-[#ECE6DC] text-[#2D4A3E] font-semibold px-2.5 py-0.5 rounded-full">
                  🌿 {reportA.meta.active_ingredients_count} Activos
                </span>
                <span className="text-[10px] bg-white border border-[#ECE6DC] text-[#66615C] font-semibold px-2.5 py-0.5 rounded-full">
                  🕒 {reportA.layering_and_usage.recommended_timing === 'AM' ? 'Mañana' : reportA.layering_and_usage.recommended_timing === 'PM' ? 'Noche' : 'AM/PM'}
                </span>
              </div>
            </div>

            {/* Product B Card */}
            <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#D97D75]/40 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#943C36] uppercase tracking-wider">
                    Opción B
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#1C1B1A]">
                    {reportB.meta.product_name}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-white border border-[#D97D75] flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[#943C36] font-serif leading-none">{scoreB}</span>
                  <span className="text-[8px] text-[#99938B] uppercase">/100</span>
                </div>
              </div>

              <p className="text-xs text-[#66615C] leading-relaxed">
                {reportB.ai_clinical_copilot.plain_language_summary}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#ECE6DC]">
                <span className="text-[10px] bg-white border border-[#ECE6DC] text-[#943C36] font-semibold px-2.5 py-0.5 rounded-full">
                  🌿 {reportB.meta.active_ingredients_count} Activos
                </span>
                <span className="text-[10px] bg-white border border-[#ECE6DC] text-[#66615C] font-semibold px-2.5 py-0.5 rounded-full">
                  🕒 {reportB.layering_and_usage.recommended_timing === 'AM' ? 'Mañana' : reportB.layering_and_usage.recommended_timing === 'PM' ? 'Noche' : 'AM/PM'}
                </span>
              </div>
            </div>
          </div>

          {/* Veredicto de Formulación */}
          <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#ECE6DC] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4F6D60]" />
              <h4 className="font-serif font-bold text-sm text-[#1C1B1A]">
                Veredicto Comparativo de Formulación
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-[#ECE6DC] space-y-1">
                <span className="font-bold text-[#99938B] text-[10px] uppercase block">Para Piel Sensible:</span>
                <span className="font-semibold text-[#1C1B1A] block">
                  {scoreA > scoreB ? `🏆 ${reportA.meta.product_name} es más calmante.` : scoreB > scoreA ? `🏆 ${reportB.meta.product_name} es más calmante.` : 'Ambos presentan un perfil de tolerancia similar.'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#ECE6DC] space-y-1">
                <span className="font-bold text-[#99938B] text-[10px] uppercase block">Densidad de Activos:</span>
                <span className="font-semibold text-[#1C1B1A] block">
                  {reportA.meta.active_ingredients_count > reportB.meta.active_ingredients_count 
                    ? `🏆 Opción A (${reportA.meta.active_ingredients_count} vs ${reportB.meta.active_ingredients_count})`
                    : `🏆 Opción B (${reportB.meta.active_ingredients_count} vs ${reportA.meta.active_ingredients_count})`}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#ECE6DC] space-y-1">
                <span className="font-bold text-[#99938B] text-[10px] uppercase block">Fase de Skin Cycling:</span>
                <span className="font-semibold text-[#1C1B1A] block">
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
