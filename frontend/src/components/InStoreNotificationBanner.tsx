'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Sparkles, X, ChevronRight, Store, ShieldCheck } from 'lucide-react';
import { useStorePresence } from '@/hooks/useStorePresence';

export default function InStoreNotificationBanner() {
  const {
    isInsideStore,
    currentStore,
    catalogCount,
    isDismissed,
    dismissBanner,
    hasLocationPermission,
    requestLocation,
  } = useStorePresence();

  // Si ya fue descartado en esta sesión, no mostrar
  if (isDismissed) {
    return null;
  }

  // Si está dentro de una tienda registrada
  if (isInsideStore && currentStore) {
    return (
      <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 max-w-lg mx-auto z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-[#2D2825]/95 backdrop-blur-md border border-[#8FA89B]/40 text-white rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8FA89B]/20 text-[#B8C8BF] border border-[#8FA89B]/30">
                <MapPin className="w-3.5 h-3.5 text-[#8FA89B]" />
                Modo En Tienda
              </span>
              {currentStore.is_independent && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Comercio Local
                </span>
              )}
            </div>

            <button
              onClick={dismissBanner}
              className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8FA89B]/10 border border-[#8FA89B]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Store className="w-5 h-5 text-[#8FA89B]" />
            </div>

            <div className="flex-1">
              <p className="text-xs text-stone-300">Estás en:</p>
              <h4 className="text-sm font-semibold text-white leading-snug">
                {currentStore.name}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                {currentStore.city}, {currentStore.state}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-stone-700/60">
            <div className="flex items-center gap-1.5 text-xs text-[#B8C8BF]">
              <ShieldCheck className="w-4 h-4 text-[#8FA89B]" />
              <span>
                {catalogCount > 0
                  ? `${catalogCount} productos evaluados aquí`
                  : 'Catálogo disponible'}
              </span>
            </div>

            <Link
              href={`/en-tienda/${currentStore.slug}`}
              onClick={dismissBanner}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8FA89B] hover:bg-[#7e968a] text-[#1E1B18] text-xs font-semibold transition-all shadow-sm"
            >
              <span>Ver productos aptos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si aún no ha otorgado permisos de ubicación y no lo ha descartado, podemos invitarlo discretamente
  // solo si pulsa el detector de tiendas
  return null;
}
