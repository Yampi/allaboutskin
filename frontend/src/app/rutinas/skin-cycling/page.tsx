'use client';

import React from 'react';
import SkinCyclingWizard from '@/components/SkinCyclingWizard';
import UserAppShell from '@/components/navigation/UserAppShell';
import { Sparkles } from 'lucide-react';

export default function SkinCyclingPage() {
  return (
    <UserAppShell activeNavId="calendario">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full space-y-8 animate-in fade-in">
        {/* Header Introduction */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-sans font-bold text-[#2E7D5B] uppercase tracking-wider bg-[#E6F4EC] px-3 py-1 rounded-full inline-block border border-[#D5E2DB]">
            Metodología Dermatológica & Algoritmo Adaptativo
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2D2825] tracking-tight">
            Protocolo Científico de <span className="text-[#2E7D5B]">Skin Cycling</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#66615C] leading-relaxed max-w-xl mx-auto">
            Estrategia de ciclado nocturno para optimizar la renovación celular y proteger la barrera cutánea. Obtén los máximos beneficios sin comprometer tu piel.
          </p>
        </div>

        {/* Interactive Diagnostic Wizard */}
        <SkinCyclingWizard />
      </div>
    </UserAppShell>
  );
}
