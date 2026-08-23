'use client';

import React from 'react';
import { X, Microscope, ShieldCheck, Droplets, Sparkles, Activity } from 'lucide-react';
import { UserProfile } from './types';

interface MicroscopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

export default function MicroscopyModal({ isOpen, onClose, userProfile }: MicroscopyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#FAF8F5] rounded-t-[28px] sm:rounded-[24px] border border-[#E8E1D7] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle on Mobile */}
        <div className="w-12 h-1 bg-[#D5CDC5] rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-[#E8E1D7] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#EBF1EE] border border-[#8FA89B]/40 flex items-center justify-center text-[#4A6B5B]">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-[19px] font-semibold text-[#2D2825] leading-tight">
                Micro-Validación Cutánea
              </h2>
              <p className="text-[11px] font-sans text-[#7E756F]">
                Análisis Óptico del Estrato Córneo • Biomarcadores
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F2ECE4] text-[#7E756F] hover:text-[#2D2825] hover:bg-[#E2D9CD] transition cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-4 overflow-y-auto space-y-4 font-sans text-[#2D2825]">
          {/* Microscope High-Res Canvas */}
          <div className="relative w-full h-56 rounded-[22px] overflow-hidden border border-[#8FA89B]/40 bg-[#1E2822] shadow-inner">
            <img
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=700&q=80"
              alt="Microscopía de Barrera Lipídica"
              className="w-full h-full object-cover opacity-90"
            />
            {/* Grid & Reticle Overlay */}
            <div className="absolute inset-0 border-2 border-dashed border-[#8FA89B]/30 m-3 rounded-[16px] pointer-events-none flex items-center justify-center">
              <div className="w-16 h-16 border border-[#8FA89B]/60 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#8FA89B] rounded-full animate-ping" />
              </div>
            </div>

            {/* Live HUD Badges */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white text-[10px] font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Aumento 200x • Lamelas Bilipídicas
            </div>

            <div className="absolute bottom-3 right-3 bg-[#4A6B5B]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10.5px] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Integridad: {userProfile.barrierScore}%
            </div>
          </div>

          {/* Biomarkers 3-Card Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#F2ECE4] p-3 rounded-[18px] border border-[#E2D9CD] text-center">
              <span className="text-[10px] uppercase font-bold text-[#7E756F] block tracking-wider">
                TEWL (Pérdida Agua)
              </span>
              <span className="font-semibold text-[15px] text-[#4A6B5B] block mt-0.5 font-mono">
                {userProfile.tewlScore}
              </span>
              <span className="text-[9.5px] text-[#7E756F] block">Óptimo (&lt;10.0)</span>
            </div>

            <div className="bg-[#F2ECE4] p-3 rounded-[18px] border border-[#E2D9CD] text-center">
              <span className="text-[10px] uppercase font-bold text-[#7E756F] block tracking-wider">
                Hidratación NMF
              </span>
              <span className="font-semibold text-[15px] text-[#4A6B5B] block mt-0.5 font-mono">
                {userProfile.hydrationLevel}
              </span>
              <span className="text-[9.5px] text-[#7E756F] block">Adecuada</span>
            </div>

            <div className="bg-[#F2ECE4] p-3 rounded-[18px] border border-[#E2D9CD] text-center">
              <span className="text-[10px] uppercase font-bold text-[#7E756F] block tracking-wider">
                Ciclado Activo
              </span>
              <span className="font-semibold text-[15px] text-[#2D2825] block mt-0.5">
                Noche {userProfile.activeNight}
              </span>
              <span className="text-[9.5px] text-[#8FA89B] font-semibold block">En Curso</span>
            </div>
          </div>

          {/* Clinical Interpretation Note */}
          <div className="p-4 rounded-[20px] bg-white border border-[#E8E1D7] shadow-diffuse space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#4A6B5B]">
              <Activity className="w-4 h-4" />
              <h3 className="font-serif text-[15px] font-semibold text-[#2D2825]">
                Diagnóstico Dermatológico Clínico
              </h3>
            </div>
            <p className="text-[13px] text-[#4A433E] leading-relaxed">
              La matriz lipídica intercorneocitaria muestra una continuidad lamelar del 94%. Los niveles de ceramidas y ácidos grasos libres tras la noche 2 de retinoides se encuentran estabilizados, permitiendo una noche de recuperación óptima con fito-activos.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#E8E1D7] bg-[#FAF8F5]">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white font-sans font-medium text-[13.5px] shadow-diffuse transition cursor-pointer"
          >
            Cerrar Micro-Visor
          </button>
        </div>
      </div>
    </div>
  );
}