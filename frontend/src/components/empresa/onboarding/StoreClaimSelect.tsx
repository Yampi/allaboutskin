'use client';

import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

interface StoreClaimSelectProps {
  initialSlug?: string;
  onSubmit: (payload: {
    store_slug: string;
    whatsapp?: string;
    verification_notes?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function StoreClaimSelect({
  initialSlug = '',
  onSubmit,
  isSubmitting,
}: StoreClaimSelectProps) {
  const [targetSlug, setTargetSlug] = useState(initialSlug);
  const [whatsapp, setWhatsapp] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSlug.trim()) return;
    await onSubmit({
      store_slug: targetSlug.trim(),
      whatsapp: whatsapp.trim() || undefined,
      verification_notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4 text-left">
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">
          Identificador o Nombre del Comercio *
        </label>
        <input
          type="text"
          required
          value={targetSlug}
          onChange={(e) => setTargetSlug(e.target.value)}
          placeholder="Ej. farmatodo-valle-de-la-pascua o nombre exacto"
          className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
        />
        <span className="text-[11px] text-slate-500 mt-1 block">
          Ingresa el slug o nombre del comercio pre-cargado que deseas vincular a tu cuenta.
        </span>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">
          WhatsApp de Contacto Directo
        </label>
        <input
          type="text"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+58 412 1234567"
          className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">
          Notas de Verificación o Cargo (Opcional)
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej. Soy el regente farmacéutico / administrador de esta sucursal."
          className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4A6B5B] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !targetSlug.trim()}
        className="w-full mt-2 py-2.5 bg-[#4A6B5B] hover:bg-[#3d594b] text-white font-bold text-xs rounded-md transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            <span>Reclamar Tienda y Vincular</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
