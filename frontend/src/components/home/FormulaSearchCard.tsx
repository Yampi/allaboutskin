'use client';

import React from 'react';
import { Search, RotateCcw, Camera, ArrowRight, Activity, Microscope } from 'lucide-react';

const QUICK_PRESETS = [
  {
    label: 'The Ordinary Niacinamida 10%',
    desc: 'Poros & Sebo',
    input: 'The Ordinary Niacinamide 10% + Zinc 1%: Aqua, Niacinamide, Pentylene Glycol, Zinc PCA, Tamarindus Indica Seed Gum, Phenoxyethanol.',
    price: 6.50,
  },
  {
    label: "Paula's Choice BHA 2%",
    desc: 'Acné & Puntos Negros',
    input: "Paula's Choice 2% BHA Liquid: Water, Methylpropanediol, Butylene Glycol, Salicylic Acid, Green Tea Extract, Sodium Hydroxide.",
    price: 35.00,
  },
  {
    label: 'Retinol 0.5% en Escualano',
    desc: 'Renovación Celular',
    input: 'Retinol Anti-Edad: Squalane, Caprylic/Capric Triglyceride, Retinol, Solanum Lycopersicum Fruit Extract, Rosmarinus Officinalis Leaf Extract.',
    price: 9.80,
  },
  {
    label: 'Cicaplast Baume B5+',
    desc: 'Reparador / Cica',
    input: 'La Roche-Posay Cicaplast Baume B5+: Aqua, Hydrogenated Polyisobutene, Dimethicone, Glycerin, Butyrospermum Parkii Butter, Panthenol, Centella Asiatica, Madecassoside, Zinc Gluconate.',
    price: 18.00,
  },
  {
    label: 'Hawaiian Tropic Ozono 50+',
    desc: 'Solar FPS 50+',
    input: 'Hawaiian Tropic Ozono Duo Defense FPS 50+: Aqua, Homosalate, Octocrylene, Ethylhexyl Salicylate, Butyl Methoxydibenzoylmethane, Cetearyl Alcohol, Glycerin, Dimethicone, Phenoxyethanol.',
    price: 14.99,
  }
];

interface FormulaSearchCardProps {
  omniInput: string;
  setOmniInput: (v: string) => void;
  isLoading: boolean;
  onAudit: (customQuery?: string, customPrice?: number | null) => void;
  onClear: () => void;
  onCameraClick: () => void;
  productPrice: string;
  setProductPrice: (v: string) => void;
}

export default function FormulaSearchCard({
  omniInput,
  setOmniInput,
  isLoading,
  onAudit,
  onClear,
  onCameraClick,
  productPrice,
  setProductPrice
}: FormulaSearchCardProps) {
  return (
    <div className="w-full">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#ECE6DC] p-3 shadow-sm transition-all duration-300 focus-within:border-[#4F6D60] focus-within:shadow-md">
        <div className="flex items-center gap-2 mb-3 px-2">
          <Microscope className="w-4 h-4 text-[#4F6D60]" />
          <span className="text-xs font-semibold text-[#1C1B1A]">Auditoría Científica de Fórmula</span>
          <span className="text-[10px] bg-[#EFF5F1] text-[#4F6D60] px-2 py-0.5 rounded-full ml-auto">Análisis / Foto / INCI</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center pl-3 text-[#4F6D60]">
            <Search className="w-4 h-4" />
          </div>

          <textarea
            rows={omniInput.length > 80 ? 2 : 1}
            value={omniInput}
            onChange={(e) => setOmniInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onAudit();
              }
            }}
            placeholder="¿Qué quieres analizar? Ingrediente, producto o fórmula..."
            className="w-full bg-transparent px-2.5 py-2 text-[#1C1B1A] text-xs sm:text-sm placeholder:text-[#99938B] focus:outline-none resize-none leading-relaxed font-sans"
          />

          {omniInput && (
            <button
              type="button"
              onClick={onClear}
              className="p-2 text-[#99938B] hover:text-[#1C1B1A] rounded-full transition-colors self-center cursor-pointer"
              title="Limpiar"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-2 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-[#ECE6DC]">
            {/* Photo OCR Button */}
            <button
              type="button"
              onClick={onCameraClick}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-[#FAF8F5] hover:bg-[#EFF5F1] text-[#2D4A3E] px-3.5 py-2 rounded-xl transition duration-150 active:scale-95 flex-shrink-0 touch-target cursor-pointer"
              title="Tomar foto al envase o lista de ingredientes"
            >
              <Camera className="w-3.5 h-3.5 text-[#4F6D60]" />
              <span className="hidden xs:inline">Escanear</span>
            </button>

            {/* Submit Action */}
            <button
              type="button"
              onClick={() => onAudit()}
              disabled={isLoading || !omniInput.trim()}
              className="flex-grow sm:flex-grow-0 bg-gradient-to-r from-[#4F6D60] to-[#2D4A3E] hover:from-[#3D5B4E] hover:to-[#1E362C] disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm transition duration-150 active:scale-95 flex-shrink-0 touch-target cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <span>Analizar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Value Proposition Typographic Strip */}
      <div className="mt-4 flex items-center justify-center gap-4 sm:gap-6 text-[11px] text-[#66615C] font-medium flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F6D60]" />
          Evidencia científica
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F6D60]" />
          Compatibilidad
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F6D60]" />
          Rutinas personalizadas
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F6D60]" />
          Skin Cycling
        </span>
      </div>

      {/* Quick Presets Row */}
      <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#99938B]">
          Ejemplos:
        </span>
        {QUICK_PRESETS.slice(0, 4).map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setOmniInput(preset.input);
              if (preset.price) setProductPrice(preset.price.toString());
              onAudit(preset.input, preset.price);
            }}
            className="text-[11px] bg-[#FFFFFF] hover:bg-[#EFF5F1] hover:text-[#2D4A3E] text-[#66615C] font-medium px-3 py-1 rounded-full border border-[#ECE6DC] transition active:scale-95 cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
