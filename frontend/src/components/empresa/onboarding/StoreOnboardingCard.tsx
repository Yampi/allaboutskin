'use client';

import React from 'react';
import { Store, ShieldCheck, Sparkles } from 'lucide-react';

interface StoreOnboardingCardProps {
  mode: 'REGISTER' | 'CLAIM';
  onModeChange: (mode: 'REGISTER' | 'CLAIM') => void;
}

export default function StoreOnboardingCard({ mode, onModeChange }: StoreOnboardingCardProps) {
  return (
    <div className="space-y-4 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FAF8F5] border border-slate-200 text-slate-700 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-[#4A6B5B]" />
        <span>Portal B2B de Comercios & Farmacias</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {mode === 'REGISTER'
          ? 'Crea tu Vitrina Digital en Allabout.skin'
          : 'Reclama la Titularidad de tu Comercio'}
      </h1>

      <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
        Publica tu inventario dermatológico verificado, conecta con clientes de tu localidad y recibe
        pedidos directos por WhatsApp con precios sincronizados en USD y Bs.
      </p>

      <div className="flex items-center justify-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => onModeChange('REGISTER')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition cursor-pointer ${
            mode === 'REGISTER'
              ? 'bg-[#4A6B5B] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Registrar Nuevo Comercio</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange('CLAIM')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition cursor-pointer ${
            mode === 'CLAIM'
              ? 'bg-[#4A6B5B] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Reclamar Tienda Existente</span>
        </button>
      </div>
    </div>
  );
}
