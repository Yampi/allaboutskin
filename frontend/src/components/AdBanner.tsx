'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdBannerProps {
  slotType?: 'SPONSORED_PRODUCT' | 'BANNER_DISPLAY' | 'HERO_PROMO';
  title?: string;
  sponsorName?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  badgeText?: string;
  className?: string;
}

export default function AdBanner({
  slotType = 'SPONSORED_PRODUCT',
  title = 'Encuentra los Activos Ideales en Farmacias y Tiendas Aliadas',
  sponsorName = 'Espacio de Patrocinio Dermatológico',
  description = 'Descubre productos verificados clínicamente para tu ciclo de Skin Cycling con descuentos exclusivos.',
  ctaText = 'Ver Ofertas Verificadas',
  ctaLink = '#',
  badgeText = 'Patrocinado',
  className = '',
}: AdBannerProps) {
  if (slotType === 'BANNER_DISPLAY') {
    return (
      <div className={`w-full my-6 p-4 bg-gradient-to-r from-slate-100 to-teal-50/50 border border-dashed border-teal-300 rounded-2xl text-center relative overflow-hidden ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
            {badgeText} • Google Ads / Partner
          </span>
          <span className="text-[10px] text-slate-400">Publicidad</span>
        </div>
        <div className="py-6 flex flex-col items-center justify-center space-y-2">
          <div className="text-slate-700 font-bold text-sm sm:text-base">
            {title}
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            {description}
          </p>
          <a
            href={ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition mt-2"
          >
            {ctaText} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden border border-teal-700/50 ${className}`}>
      {/* Decorative Glow */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-teal-400/20 text-teal-300 border border-teal-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> {badgeText}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {sponsorName}
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            {title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="w-full sm:w-auto flex-shrink-0">
          <a
            href={ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {ctaText}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
