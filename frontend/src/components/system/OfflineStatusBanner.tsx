'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WifiOff, X, ArrowRight } from 'lucide-react';
import { checkSystemHealth } from '@/lib/api';

const POLL_INTERVAL_MS = 30000;
const FAILURES_BEFORE_ALERT = 2;

export default function OfflineStatusBanner() {
  const [isDeviceOffline, setIsDeviceOffline] = useState(false);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let failures = 0;
    let cancelled = false;

    const updateOnlineStatus = () => setIsDeviceOffline(!navigator.onLine);

    const pollServer = async () => {
      if (!navigator.onLine) return;
      try {
        await checkSystemHealth();
        failures = 0;
        if (!cancelled) {
          setIsServerDown(false);
          setIsDismissed(false);
        }
      } catch (err) {
        failures += 1;
        if (!cancelled && failures >= FAILURES_BEFORE_ALERT) {
          setIsServerDown(true);
        }
      }
    };

    updateOnlineStatus();
    pollServer();
    const timer = window.setInterval(pollServer, POLL_INTERVAL_MS);

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if ((!isDeviceOffline && !isServerDown) || isDismissed) {
    return null;
  }

  const message = isDeviceOffline
    ? 'Tu dispositivo no tiene conexión. Tu rutina y las guías faciales guardadas en este dispositivo siguen disponibles.'
    : 'No podemos comunicarnos con el servidor en este momento. Reintentaremos automáticamente; tu rutina guardada en este dispositivo sigue disponible.';

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs py-2 px-4 sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <p className="text-slate-300">{message}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/estado"
            className="text-teal-300 hover:text-teal-200 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Ver estado</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Ocultar aviso"
            className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
