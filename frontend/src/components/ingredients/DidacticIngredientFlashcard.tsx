'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  FlaskConical,
  ShieldCheck
} from 'lucide-react';

export interface DidacticIngredient {
  id: string;
  name: string;
  inci: string;
  category: string;
  categoryLabel: string;
  targetObjective: 'acne' | 'brightening' | 'barrier' | 'aging' | 'soothing' | string;
  anatomicalTarget: string; // ej. 'Glándula Sebácea & Poro', 'Estrato Córneo Superficial', 'Dermis Papilar & Fibroblastos'
  recommendedConcentration: string;
  optimalPh: string;
  whatItDoes: string; // ¿Qué hace el componente?
  detailedMechanism: string; // Mecanismo fisiológico
  synergies: string[]; // Con qué se recomienda combinar
  contraindications: string[]; // Con qué NO se recomienda combinar
  skinCyclingPhase: string; // Momento / Fase en Skin Cycling
  timing: 'AM' | 'PM' | 'AM / PM';
  textureType: string;
  macroImage: string;
  pubmedCount: number;
  cosingId?: string;
  evidenceGrade: string; // 'NIVEL A (RCTs)' | 'NIVEL B'
  studies?: Array<{ title: string; journal: string; year: number; pmid: string }>;
}

interface DidacticIngredientFlashcardProps {
  ingredient: DidacticIngredient;
  onOpenDeepModal?: (ingredient: DidacticIngredient) => void;
}

export default function DidacticIngredientFlashcard({
  ingredient,
  onOpenDeepModal,
}: DidacticIngredientFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-full h-[470px] [perspective:1000px] select-none group">
      {/* Tarjeta con efecto Flip 3D */}
      <div
        className={`w-full h-full relative rounded-3xl transition-transform duration-700 [transform-style:preserve-3d] shadow-2xs hover:shadow-md ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* ======================================================== */}
        {/* CARA A: FRENTE - PRESENTACIÓN DIDÁCTICA Y RESUMEN VISUAL  */}
        {/* ======================================================== */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white rounded-3xl p-5 border border-[#E8E1D7] flex flex-col justify-between overflow-hidden">
          
          <div>
            {/* Cabecera & Badges */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-[10.5px] font-bold uppercase tracking-wider">
                {ingredient.categoryLabel}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FAFAF7] text-[#8C827A] text-[10px] font-mono border border-[#E8E1D7]">
                {ingredient.evidenceGrade}
              </span>
            </div>

            {/* Macro Visual */}
            <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-stone-900 border border-[#E8E1D7] mb-3">
              <img
                src={ingredient.macroImage}
                alt={ingredient.name}
                className="w-full h-full object-cover group-hover:scale-106 transition duration-500"
              />
              <div className="absolute top-2 left-2 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                Dosis: {ingredient.recommendedConcentration}
              </div>
              <div className="absolute bottom-2 right-2 bg-[#2E7D5B] text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded-full">
                {ingredient.timing}
              </div>
            </div>

            {/* Nombres */}
            <h3 className="font-extrabold text-base text-[#2D2825] leading-tight group-hover:text-[#2E7D5B] transition">
              {ingredient.name}
            </h3>
            <p className="text-[11px] font-mono text-[#8C827A] mt-0.5 line-clamp-1">
              INCI: {ingredient.inci}
            </p>

            {/* ¿Qué hace este componente? */}
            <div className="mt-3 p-2.5 rounded-xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1">
              <span className="text-[10px] font-extrabold text-[#2E7D5B] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                ¿Qué hace en tu piel?
              </span>
              <p className="text-xs text-[#4A4540] line-clamp-2 leading-relaxed">
                {ingredient.whatItDoes}
              </p>
            </div>

            {/* Dónde actúa anatómicamente */}
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#66615C]">
              <Layers className="w-3.5 h-3.5 text-[#2E7D5B] shrink-0" />
              <span className="font-bold text-[#2D2825]">Dónde actúa:</span>
              <span className="truncate">{ingredient.anatomicalTarget}</span>
            </div>
          </div>

          {/* Footer del Frente: Botón de Girar Ficha */}
          <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between">
            <span className="text-[10px] text-[#8C827A] font-semibold">
              PubMed: {ingredient.pubmedCount.toLocaleString()} citas
            </span>

            <button
              type="button"
              onClick={() => setIsFlipped(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E6F4EC] hover:bg-[#D5E2DB] text-[#2E7D5B] text-xs font-extrabold transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Girar Ficha Didáctica</span>
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* CARA B: REVERSO - GUÍA DE COMBINACIÓN, ACCIÓN Y APLICACIÓN */}
        {/* ======================================================== */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#FAFAF7] rounded-3xl p-5 border-2 border-[#2E7D5B] flex flex-col justify-between overflow-hidden shadow-lg">
          
          <div className="space-y-3 overflow-y-auto pr-1">
            {/* Cabecera Reverso */}
            <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-2">
              <div>
                <span className="text-[10px] font-extrabold text-[#2E7D5B] uppercase tracking-wider block">
                  Ficha Pedagógica
                </span>
                <h4 className="font-extrabold text-sm text-[#2D2825]">
                  {ingredient.name}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="p-1 rounded-full bg-white border border-[#E8E1D7] text-[#66615C] hover:text-[#2D2825] transition cursor-pointer"
                title="Volver al frente"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 1. ¿Dónde actúa anatómicamente? */}
            <div className="p-2.5 rounded-xl bg-white border border-[#E8E1D7] space-y-0.5">
              <span className="text-[10px] font-extrabold text-[#2E7D5B] uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Zona de Acción Celular
              </span>
              <p className="text-[11.5px] text-[#2D2825] font-semibold">
                {ingredient.anatomicalTarget}
              </p>
              <p className="text-[11px] text-[#66615C] leading-snug">
                {ingredient.detailedMechanism}
              </p>
            </div>

            {/* 2. Con qué se recomienda combinar (Sinergias) */}
            <div className="p-2.5 rounded-xl bg-[#E6F4EC]/70 border border-[#D5E2DB] space-y-1">
              <span className="text-[10px] font-extrabold text-[#1B3D32] uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#2E7D5B]" />
                ✦ Con qué combinar (Sinergias)
              </span>
              <div className="flex flex-wrap gap-1">
                {ingredient.synergies.map((syn, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white text-[10px] font-bold text-[#1B3D32] border border-[#D5E2DB]"
                  >
                    {syn}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Con qué NO combinar (Precauciones) */}
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 space-y-1">
              <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-700" />
                ⚠️ Con qué NO combinar
              </span>
              <p className="text-[10.5px] text-amber-800 leading-snug font-medium">
                {ingredient.contraindications.join(', ')}
              </p>
            </div>

            {/* 4. Momento y Fase de Skin Cycling */}
            <div className="p-2 rounded-xl bg-white border border-[#E8E1D7] flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#66615C] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#2E7D5B]" />
                Skin Cycling:
              </span>
              <span className="font-extrabold text-[#2E7D5B]">
                {ingredient.skinCyclingPhase}
              </span>
            </div>
          </div>

          {/* Footer Reverso: Botón de Volver y Ficha Completa */}
          <div className="pt-2 border-t border-[#E8E1D7] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="text-[11px] font-bold text-[#66615C] hover:text-[#2D2825] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Volver</span>
            </button>

            {onOpenDeepModal && (
              <button
                type="button"
                onClick={() => onOpenDeepModal(ingredient)}
                className="px-3 py-1 rounded-full bg-[#2E7D5B] text-white text-[11px] font-extrabold hover:bg-[#1B3D32] transition cursor-pointer"
              >
                Ficha Completa
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
