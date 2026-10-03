'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WifiOff, X, ArrowRight } from 'lucide-react';

export default function OfflineStatusBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Chequeo nativo del navegador
    const updateOnlineStatus = () => {
      if (typeof navigator !== 'undefined') {
        setIsOffline(!navigator.onLine);
      }
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!isOffline || isDismissed) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs py-2 px-4 sticky top-0 z-50 transition-all duration-200"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
          <WifiOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <p className="truncate text-slate-300">
            <strong className="text-white font-medium">Modo Local Autónomo:</strong>{' '}
            El nodo central está en reposo. Tus rutinas y mapas faciales siguen disponibles en tu dispositivo.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/estado"
            className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Ver estado</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Ocultar aviso de contingencia"
            className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded hover:bg-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
