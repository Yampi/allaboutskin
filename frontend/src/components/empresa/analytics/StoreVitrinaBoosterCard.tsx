'use client';

import React from 'react';
import { Copy, Sparkles, Check } from 'lucide-react';

interface StoreVitrinaBoosterCardProps {
  firstBranchSlug?: string;
  onCopySlug?: (slug: string) => void;
  isCopied?: boolean;
}

export default function StoreVitrinaBoosterCard({
  firstBranchSlug,
  onCopySlug,
  isCopied,
}: StoreVitrinaBoosterCardProps) {
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-[#4A6B5B]" />
          Consejo Comercial
        </span>
        <h4 className="text-sm font-bold text-slate-900">
          ¿Cómo potenciar ventas con tu Vitrina Digital?
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Comparte el enlace de tu vitrina en la biografía de Instagram y en tus estados de WhatsApp.
          Tus clientes podrán consultar disponibilidad y precios sincronizados en bolívares y dólares
          sin fricciones.
        </p>
      </div>

      {firstBranchSlug && onCopySlug && (
        <button
          type="button"
          onClick={() => onCopySlug(firstBranchSlug)}
          className="w-full py-2 bg-[#4A6B5B] hover:bg-[#3d594b] text-white font-bold text-xs rounded-md transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{isCopied ? '¡Enlace Copiado!' : 'Copiar Enlace de mi Vitrina'}</span>
        </button>
      )}
    </div>
  );
}
