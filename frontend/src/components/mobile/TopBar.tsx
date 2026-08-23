'use client';

import React from 'react';
import { Microscope, Sparkles, ShieldCheck } from 'lucide-react';

interface TopBarProps {
  onOpenProfile?: () => void;
  onOpenDiagnosis?: () => void;
}

export default function TopBar({ onOpenProfile, onOpenDiagnosis }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E1D7] px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Editorial Logo */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-serif text-[22px] sm:text-[24px] font-semibold text-[#2D2825] tracking-tight leading-none">
              Allabout<span className="text-[#4A6B5B]">.skin</span>
            </span>
            <span className="text-[9.5px] font-sans font-medium text-[#7E756F] tracking-wider uppercase mt-0.5">
              Auditoría Dermatológica
            </span>
          </div>
        </div>

        {/* Botanical Microscope Isotype & Status */}
        <div className="flex items-center gap-2.5">
          {/* Live Clinical Sync Badge */}
          <button
            onClick={onOpenDiagnosis}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF1EE] border border-[#8FA89B]/30 text-[#4A6B5B] text-[11px] font-medium transition hover:bg-[#8FA89B]/20 cursor-pointer"
            title="Sincronización Dermatológica Activa"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8FA89B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A6B5B]"></span>
            </span>
            <span className="hidden xs:inline">Barrera Óptima</span>
          </button>

          {/* Microscope Botanical Isotype Icon in Sage Dark (#4A6B5B) */}
          <button
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full bg-[#F2ECE4] border border-[#E2D9CD] flex items-center justify-center text-[#4A6B5B] hover:bg-[#EBF1EE] hover:text-[#3D5A4C] hover:border-[#8FA89B] transition shadow-sm cursor-pointer group"
            aria-label="Perfil y Validación"
            title="Perfil de Diagnóstico"
          >
            <div className="relative">
              <Microscope className="w-5 h-5 transition-transform group-hover:scale-110" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#4A6B5B] rounded-full flex items-center justify-center text-[7px] text-white">
                <Sparkles className="w-2 h-2 text-[#FAF8F5]" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}