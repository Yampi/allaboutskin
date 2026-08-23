'use client';

import React, { useState, useEffect } from 'react';
import {
  Scan,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Sparkles,
  Info,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Plus,
  BookOpen,
  Layers,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { InciScanResult, InciIngredientResult, ActiveIngredient } from './types';
import { sampleScanPresets, activeIngredientsList } from './skincareData';

interface ScannerScreenProps {
  onAddProductToShelf?: (productName: string, brand: string) => void;
  onSelectIngredient?: (ing: ActiveIngredient) => void;
}

export default function ScannerScreen({
  onAddProductToShelf,
  onSelectIngredient,
}: ScannerScreenProps) {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selectedInciItem, setSelectedInciItem] = useState<InciIngredientResult | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const currentPreset = sampleScanPresets[selectedPresetIndex];

  // Trigger evaluation
  const handleEvaluate = () => {
    setIsScanning(false);
    setShowBottomSheet(true);
  };

  const handleResetScan = () => {
    setIsScanning(true);
    setShowBottomSheet(false);
    setSelectedInciItem(null);
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    setIsScanning(true);
    setShowBottomSheet(false);
    setSelectedInciItem(null);
  };

  // Group ingredients by traffic light
  const safeIngredients = currentPreset.ingredients.filter((i) => i.trafficLight === 'SAFE');
  const hydratingIngredients = currentPreset.ingredients.filter((i) => i.trafficLight === 'HYDRATING');
  const cautionIngredients = currentPreset.ingredients.filter((i) => i.trafficLight === 'CAUTION');

  return (
    <div className="flex flex-col gap-3 pb-24 pt-1 px-4 max-w-md mx-auto animate-in fade-in duration-300">
      {/* 1. Header Editorial */}
      <div className="text-center py-1">
        <span className="text-[11px] font-sans font-bold text-[#4A6B5B] uppercase tracking-widest block">
          Auditor INCI en Tiempo Real
        </span>
        <h1 className="font-serif text-[23px] sm:text-[25px] font-semibold text-[#2D2825] mt-0.5">
          Escáner de Ingredientes
        </h1>
        <p className="text-[12px] font-sans text-[#7E756F] max-w-xs mx-auto mt-0.5">
          Enfoca el envase o selecciona una muestra dermatológica para verificar pureza científica y compatibilidad con Skin Cycling.
        </p>
      </div>

      {/* Preset Cosmetic Selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {sampleScanPresets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectPreset(idx)}
            className={`px-3 py-1.5 rounded-full text-[11.5px] font-medium whitespace-nowrap transition cursor-pointer border ${
              selectedPresetIndex === idx
                ? 'bg-[#8FA89B] text-white border-[#8FA89B] shadow-xs'
                : 'bg-[#F2ECE4] text-[#4A433E] border-[#E2D9CD] hover:border-[#8FA89B]'
            }`}
          >
            <span>{preset.productName}</span>
          </button>
        ))}
      </div>

      {/* 2. Visor AR / Cámara (border-radius: 24px + esquinas retícula salvia) */}
      <div className="relative w-full h-[360px] sm:h-[380px] rounded-[24px] overflow-hidden bg-[#1C2620] border-2 border-[#8FA89B]/40 shadow-diffuse-elevated flex items-center justify-center">
        {/* Background Simulated Product Feed */}
        <img
          src={
            selectedPresetIndex === 0
              ? 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80'
              : 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80'
          }
          alt="Visor AR Skincare"
          className="w-full h-full object-cover opacity-80"
        />

        {/* Central Blur & Vignette Overlay */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60 pointer-events-none" />

        {/* AR HUD Focus Corners (Sage Green #8FA89B) */}
        <div className="absolute inset-4 pointer-events-none">
          {/* Top Left Corner */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-[#8FA89B] rounded-tl-[12px]" />
          {/* Top Right Corner */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-[#8FA89B] rounded-tr-[12px]" />
          {/* Bottom Left Corner */}
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-[#8FA89B] rounded-bl-[12px]" />
          {/* Bottom Right Corner */}
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-[#8FA89B] rounded-br-[12px]" />
        </div>

        {/* Animated Laser Scanning Beam */}
        {isScanning && (
          <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[#8FA89B] to-transparent shadow-[0_0_12px_#8FA89B] animate-scan-beam pointer-events-none" />
        )}

        {/* Live Detected Floating AR Pills (positioned on recognized cosmetic formula) */}
        <div className="absolute inset-0 p-6 flex flex-col justify-around pointer-events-none">
          {/* Pill 1: Niacinamide / Main active */}
          <div className="self-start animate-bounce duration-1000">
            <div className="bg-[#FAF8F5]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#8FA89B] shadow-lg flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#2D2825]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentPreset.ingredients[0]?.name}</span>
              <span className="text-[9.5px] text-[#4A6B5B] font-bold">100% INCI</span>
            </div>
          </div>

          {/* Pill 2: Secondary active */}
          <div className="self-end mt-4">
            <div className="bg-[#FAF8F5]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#8FA89B] shadow-lg flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#2D2825]">
              <span className="w-2 h-2 rounded-full bg-[#8FA89B]" />
              <span>{currentPreset.ingredients[1]?.name}</span>
              <span className="text-[9.5px] text-[#7E756F]">Fisiológico</span>
            </div>
          </div>

          {/* Pill 3: Hydrating agent */}
          <div className="self-center mt-2">
            <div className="bg-[#FAF8F5]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#DFCAAC] shadow-lg flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#2D2825]">
              <Droplets className="w-3 h-3 text-[#4A6B5B]" />
              <span>{currentPreset.ingredients[2]?.name || 'Aqua / Solvente'}</span>
            </div>
          </div>
        </div>

        {/* Live Status Header Overlay in Viewport */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-white text-[11px] font-mono pointer-events-none">
          <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            INCI Detection: Active
          </span>
          <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
            {currentPreset.brand}
          </span>
        </div>
      </div>

      {/* 3. Acción Principal (CTA Botón Cápsula Flotante "Evaluar") */}
      <div className="flex gap-2">
        <button
          onClick={handleEvaluate}
          className="flex-1 py-3.5 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white font-sans font-semibold text-[14px] shadow-diffuse hover:shadow-diffuse-elevated transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Evaluar Fórmula INCI</span>
        </button>

        {showBottomSheet && (
          <button
            onClick={handleResetScan}
            className="px-4 py-3.5 rounded-full bg-[#F2ECE4] hover:bg-[#E2D9CD] text-[#4A6B5B] border border-[#E2D9CD] transition cursor-pointer"
            title="Volver a Escanear"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 4. Bottom Sheet / Drawer de Resultados (Semáforo de Seguridad Científica) */}
      {showBottomSheet && (
        <div className="card-white p-4.5 border border-[#8FA89B]/40 shadow-diffuse-elevated space-y-4 animate-in slide-in-from-bottom duration-300">
          {/* Header of Drawer */}
          <div className="flex items-start justify-between border-b border-[#E8E1D7] pb-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[10px] font-bold uppercase tracking-wider">
                Auditoría Completada
              </span>
              <h3 className="font-serif text-[18px] font-semibold text-[#2D2825] mt-1">
                {currentPreset.productName}
              </h3>
              <p className="text-[11.5px] font-sans text-[#7E756F]">
                Marca: {currentPreset.brand} • {currentPreset.category}
              </p>
            </div>

            {/* Global Compatibility Score */}
            <div className="text-right">
              <span className="font-serif text-[22px] font-bold text-[#4A6B5B] block leading-none">
                {currentPreset.compatibilityScore}/100
              </span>
              <span className="text-[9.5px] font-sans font-semibold text-[#8FA89B] uppercase">
                Apto para Ciclado
              </span>
            </div>
          </div>

          {/* Clinical Formula Summary */}
          <p className="text-[12.5px] font-sans text-[#4A433E] leading-relaxed bg-[#FAF8F5] p-3 rounded-[16px] border border-[#E8E1D7]">
            {currentPreset.summary}
          </p>

          {/* Recommended Cycling Phase */}
          <div className="flex items-center justify-between p-3 rounded-[16px] bg-[#EBF1EE] border border-[#8FA89B]/30 text-[12px]">
            <span className="font-medium text-[#2D4A3E]">
              Fases de Ciclado Recomendadas:
            </span>
            <div className="flex gap-1">
              {currentPreset.cycleNightsRecommended.map((n) => (
                <span
                  key={n}
                  className="px-2 py-0.5 rounded-full bg-[#4A6B5B] text-white font-bold text-[10.5px]"
                >
                  Noche {n}
                </span>
              ))}
            </div>
          </div>

          {/* Semáforo de Seguridad Científica (Traffic Light Groups) */}
          <div className="space-y-3 pt-1">
            <span className="text-[11px] font-bold text-[#7E756F] uppercase tracking-wider block">
              Desglose INCI por Semáforo Científico:
            </span>

            {/* Group 1: Eficaz / Seguro (Verde Salvia #8FA89B / Verde Bosque #4A6B5B) */}
            {safeIngredients.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#4A6B5B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8FA89B]" />
                  <span>🟢 EFICAZ / SEGURO ({safeIngredients.length})</span>
                </div>
                <div className="space-y-1">
                  {safeIngredients.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedInciItem(item)}
                      className="p-2.5 rounded-[14px] bg-[#FAF8F5] border border-[#E8E1D7] flex items-center justify-between hover:border-[#8FA89B] transition cursor-pointer"
                    >
                      <div>
                        <span className="font-semibold text-[12.5px] text-[#2D2825] block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[#7E756F] font-mono">
                          {item.function}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[10px] font-bold">
                        {item.safetyScore}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group 2: Hidratante / Reparador (Beige #F2ECE4 / Verde Bosque #4A6B5B) */}
            {hydratingIngredients.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#7A5E43]">
                  <Droplets className="w-3.5 h-3.5 text-[#4A6B5B]" />
                  <span>💧 HIDRATANTE / REPARADOR ({hydratingIngredients.length})</span>
                </div>
                <div className="space-y-1">
                  {hydratingIngredients.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedInciItem(item)}
                      className="p-2.5 rounded-[14px] bg-[#F2ECE4] border border-[#E2D9CD] flex items-center justify-between hover:border-[#8FA89B] transition cursor-pointer"
                    >
                      <div>
                        <span className="font-semibold text-[12.5px] text-[#2D2825] block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[#7E756F] font-mono">
                          {item.function}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white text-[#4A6B5B] text-[10px] font-bold">
                        {item.safetyScore}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group 3: Precaución / Sensibilizante (Rosa Suave #D8A899 / Almendra #DFCAAC) */}
            {cautionIngredients.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#943C36]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D8A899]" />
                  <span>⚠️ PRECAUCIÓN EN PIEL REACTIVA ({cautionIngredients.length})</span>
                </div>
                <div className="space-y-1">
                  {cautionIngredients.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedInciItem(item)}
                      className="p-2.5 rounded-[14px] bg-[#FAF0ED] border border-[#D8A899]/50 flex items-center justify-between hover:border-[#D8A899] transition cursor-pointer"
                    >
                      <div>
                        <span className="font-semibold text-[12.5px] text-[#2D2825] block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[#70332E]">
                          {item.function}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white text-[#943C36] text-[10px] font-bold">
                        {item.safetyScore}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add to Shelf Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                setAddedSuccess(true);
                if (onAddProductToShelf) {
                  onAddProductToShelf(currentPreset.productName, currentPreset.brand);
                }
                setTimeout(() => setAddedSuccess(false), 3000);
              }}
              disabled={addedSuccess}
              className={`w-full py-3 rounded-full font-sans font-medium text-[13px] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                addedSuccess
                  ? 'bg-[#4A6B5B] text-white'
                  : 'bg-[#F2ECE4] hover:bg-[#EBF1EE] text-[#4A6B5B] border border-[#E2D9CD]'
              }`}
            >
              {addedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>¡Añadido a tus Activos Asignados!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Añadir a mi Estantería de Ciclado</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Detail Inci Item Quick Popup Modal */}
      {selectedInciItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-[#FAF8F5] rounded-[24px] border border-[#E8E1D7] p-5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[10px] font-bold">
                  {selectedInciItem.category}
                </span>
                <h4 className="font-serif text-[18px] font-semibold text-[#2D2825] mt-1">
                  {selectedInciItem.name}
                </h4>
                <p className="text-[11.5px] font-mono text-[#7E756F]">
                  INCI: {selectedInciItem.inci}
                </p>
              </div>
              <button
                onClick={() => setSelectedInciItem(null)}
                className="p-1 rounded-full bg-[#F2ECE4] text-[#7E756F] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[12.5px] text-[#4A433E] leading-relaxed">
              {selectedInciItem.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
              <div className="bg-[#F2ECE4] p-2 rounded-[12px]">
                <span className="text-[#7E756F] block">Comedogenicidad</span>
                <span className="font-bold text-[#2D2825]">
                  {selectedInciItem.comedogenicRating} / 5
                </span>
              </div>
              <div className="bg-[#F2ECE4] p-2 rounded-[12px]">
                <span className="text-[#7E756F] block">Citas PubMed</span>
                <span className="font-bold text-[#4A6B5B]">
                  {selectedInciItem.pubmedStudiesCount}+ papers
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedInciItem(null)}
              className="w-full py-2.5 rounded-full bg-[#8FA89B] text-white text-[12.5px] font-medium cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}