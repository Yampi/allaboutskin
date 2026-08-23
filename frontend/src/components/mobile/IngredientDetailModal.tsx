'use client';

import React from 'react';
import { X, CheckCircle2, AlertTriangle, ExternalLink, Sparkles, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import { ActiveIngredient } from './types';

interface IngredientDetailModalProps {
  ingredient: ActiveIngredient | null;
  onClose: () => void;
}

export default function IngredientDetailModal({ ingredient, onClose }: IngredientDetailModalProps) {
  if (!ingredient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#FAF8F5] rounded-t-[28px] sm:rounded-[24px] border border-[#E8E1D7] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle on Mobile */}
        <div className="w-12 h-1 bg-[#D5CDC5] rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="px-5 pt-3 pb-3 flex items-start justify-between border-b border-[#E8E1D7] bg-[#FAF8F5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[10.5px] font-sans font-semibold uppercase tracking-wider">
                {ingredient.categoryLabel}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#F2ECE4] text-[#7E756F] text-[10.5px] font-mono">
                CosIng #{ingredient.cosingId}
              </span>
            </div>
            <h2 className="font-serif text-[22px] sm:text-[24px] font-semibold text-[#2D2825] mt-1 leading-tight">
              {ingredient.name}
            </h2>
            <p className="text-[12px] font-mono text-[#7E756F] mt-0.5">
              INCI: {ingredient.inci}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F2ECE4] text-[#7E756F] hover:text-[#2D2825] hover:bg-[#E2D9CD] transition cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="px-5 py-4 overflow-y-auto space-y-4 text-[#2D2825] font-sans text-[13.5px]">
          {/* Macro Visual & Phase Badge */}
          <div className="relative h-40 w-full rounded-[20px] overflow-hidden border border-[#E2D9CD]">
            <img
              src={ingredient.macroImage}
              alt={ingredient.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-3.5 text-white">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#DFCAAC]">
                Asignación de Ciclado
              </span>
              <span className="font-serif text-[17px] font-medium text-white">
                {ingredient.assignedCyclePhase}
              </span>
              <span className="text-[11px] text-white/80 font-sans mt-0.5">
                Textura: {ingredient.textureType}
              </span>
            </div>
          </div>

          {/* Quick Molecular Specs Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#F2ECE4] p-2.5 rounded-[16px] border border-[#E2D9CD]">
              <span className="text-[10px] uppercase font-bold text-[#7E756F] block tracking-wider">
                Concentración
              </span>
              <span className="font-semibold text-[13px] text-[#2D2825] mt-0.5 block">
                {ingredient.recommendedConcentration}
              </span>
            </div>
            <div className="bg-[#F2ECE4] p-2.5 rounded-[16px] border border-[#E2D9CD]">
              <span className="text-[10px] uppercase font-bold text-[#7E756F] block tracking-wider">
                pH Óptimo
              </span>
              <span className="font-semibold text-[13px] text-[#2D2825] mt-0.5 block">
                {ingredient.optimalPh}
              </span>
            </div>
            <div className="bg-[#F2ECE4] p-2.5 rounded-[16px] border border-[#E2D9CD]">
              <span className="text-[10px] uppercase font-bold text-[#7E756F] block tracking-wider">
                Peso Mol.
              </span>
              <span className="font-semibold text-[13px] text-[#2D2825] mt-0.5 block">
                {ingredient.molecularWeight}
              </span>
            </div>
          </div>

          {/* Clinical Description */}
          <div className="bg-[#FFFFFF] p-4 rounded-[20px] border border-[#E8E1D7] shadow-diffuse space-y-2">
            <div className="flex items-center gap-1.5 text-[#4A6B5B]">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-serif text-[16px] font-medium text-[#2D2825]">
                Mecanismo Fisiológico
              </h3>
            </div>
            <p className="text-[13px] text-[#4A433E] leading-relaxed">
              {ingredient.clinicalDescription}
            </p>
          </div>

          {/* Clinical Benefits Checklist */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-[#7E756F] uppercase tracking-wider">
              Beneficios Dermatológicos Comprobados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ingredient.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#EBF1EE] border border-[#8FA89B]/30 text-[#2D2825] text-[12px]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#4A6B5B] shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Synergies & Incompatibilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Synergies */}
            <div className="bg-[#F2ECE4] p-3.5 rounded-[18px] border border-[#E2D9CD] space-y-1.5">
              <span className="text-[10.5px] font-bold uppercase text-[#4A6B5B] tracking-wider block">
                ✦ Sinergias Óptimas
              </span>
              <ul className="text-[12px] text-[#4A433E] space-y-1">
                {ingredient.synergies.map((syn, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#8FA89B] font-bold">•</span>
                    <span>{syn}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contraindications */}
            <div className="bg-[#FAF0ED] p-3.5 rounded-[18px] border border-[#D8A899]/40 space-y-1.5">
              <span className="text-[10.5px] font-bold uppercase text-[#943C36] tracking-wider block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-[#D8A899]" />
                Precauciones / No Mezclar
              </span>
              <ul className="text-[12px] text-[#70332E] space-y-1">
                {ingredient.contraindications.map((contra, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#D8A899] font-bold">•</span>
                    <span>{contra}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* PubMed Scientific Studies */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-[18px] border border-[#E8E1D7] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#7E756F] tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#4A6B5B]" />
                Evidencia Indexada en PubMed ({ingredient.pubmedCount.toLocaleString()} citas)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[9.5px] font-bold">
                NIH / NCBI
              </span>
            </div>

            <div className="space-y-2">
              {ingredient.clinicalStudies.map((study, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-[14px] bg-white border border-[#E8E1D7] text-[11.5px]"
                >
                  <p className="font-medium text-[#2D2825] leading-snug">
                    "{study.title}"
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-[#7E756F]">
                    <span>
                      {study.journal} ({study.year}) • PMID: {study.pmid}
                    </span>
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#4A6B5B] font-semibold hover:underline flex items-center gap-0.5"
                    >
                      Ver Paper <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="px-5 py-3 border-t border-[#E8E1D7] bg-[#FAF8F5]">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white font-sans font-medium text-[13.5px] shadow-diffuse transition cursor-pointer"
          >
            Entendido • Volver
          </button>
        </div>
      </div>
    </div>
  );
}