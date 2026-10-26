'use client';

import React from 'react';
import FormulaComparator from '@/components/FormulaComparator';
import UserAppShell from '@/components/navigation/UserAppShell';

export default function ComparadorPage() {
  return (
    <UserAppShell activeNavId="productos">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full space-y-8 animate-in fade-in">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-sans font-bold text-[#2E7D5B] uppercase tracking-wider bg-[#E6F4EC] px-3 py-1 rounded-full inline-block border border-[#D5E2DB]">
            Comparativa Científica Frente a Frente
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">
            Comparador de <span className="text-[#2E7D5B]">Fórmulas</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#66615C] leading-relaxed max-w-xl mx-auto">
            Compara dos productos simultáneamente para evaluar concentración de activos, compatibilidad dérmica y relación calidad-ciencia.
          </p>
        </div>
        <FormulaComparator />
      </div>
    </UserAppShell>
  );
}
