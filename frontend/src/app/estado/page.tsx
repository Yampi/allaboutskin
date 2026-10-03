'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Database,
  BookOpen,
  Microscope,
  Wifi,
  ShieldCheck,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { checkSystemHealth, SystemHealthData } from '@/lib/api';

export default function EstadoSistemaPage() {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  const performHealthCheck = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await checkSystemHealth();
      setHealthData(data);
      setLastCheckTime(new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      setError(err.message || 'No fue posible comunicar con el nodo local');
      setHealthData(null);
      setLastCheckTime(new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performHealthCheck();
  }, []);

  const isOperational = healthData?.status === 'operational';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb DLG-EXEC */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-slate-800 transition-colors">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800">Monitor de Disponibilidad</span>
      </nav>

      {/* Header Documento Legal / Técnico */}
      <header className="border-b border-slate-200 pb-8 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Activity className="w-3.5 h-3.5 text-slate-700" />
              <span>Transparencia Operativa & Uptime</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
              Estado de la Plataforma & Contingencia
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Estado actual de la conexión con el servidor, la base de datos y la base de ingredientes.
            </p>
          </div>

          <div className="flex-shrink-0 sm:self-center">
            <button
              onClick={performHealthCheck}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
              <span>{isLoading ? 'Verificando...' : 'Comprobar Ahora'}</span>
            </button>
          </div>
        </div>

        {lastCheckTime && (
          <p className="mt-4 text-xs font-mono text-slate-400">
            Última verificación: {lastCheckTime} (GMT-4, Venezuela)
          </p>
        )}
      </header>

      {/* Estado Global Callout */}
      <div
        className={`rounded-lg border p-6 mb-10 shadow-sm ${
          isOperational
            ? 'border-emerald-200 bg-emerald-50/60 text-emerald-950'
            : 'border-amber-200 bg-amber-50/70 text-amber-950'
        }`}
      >
        <div className="flex items-start gap-4">
          {isOperational ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-700 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-700 mt-0.5 flex-shrink-0" />
          )}
          <div className="space-y-1.5">
            <h2 className="text-lg font-serif font-bold">
              {isOperational
                ? 'Todos los sistemas centrales operan normalmente'
                : 'Modo de contingencia o nodo en reposo'}
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed opacity-90">
              {isOperational
                ? 'La API REST, el motor de compatibilidad química, la base PostgreSQL y las conexiones documentales responden sin latencia anómala.'
                : error || 'El servidor local de sincronización se encuentra momentáneamente en reposo o restableciendo el túnel de red. Sus rutinas y guías se mantienen activas en su navegador.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Servicios DLG-EXEC */}
      <section className="space-y-4 mb-12">
        <h2 className="text-lg font-serif font-bold text-slate-900">
          Componentes de la Arquitectura
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Servidor Core */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Server className="w-4 h-4 text-slate-600" />
                <span>API REST & Motor PHP/Laravel</span>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium font-mono ${
                  healthData?.uptime_status === 'online'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {healthData?.uptime_status === 'online' ? 'OPERACIONAL' : 'EN ESPERA'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gestión de autenticación, control de perfiles dérmicos y portal de comercios B2B.
            </p>
          </div>

          {/* Base de Datos */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Database className="w-4 h-4 text-slate-600" />
                <span>Base de datos</span>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium font-mono ${
                  healthData?.services.database === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {healthData?.services.database === 'connected' ? 'CONECTADA' : 'SIN CONEXIÓN'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Productos, ingredientes, tiendas y ofertas.
            </p>
          </div>

          {/* Dataset de ingredientes */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <BookOpen className="w-4 h-4 text-slate-600" />
                <span>Base de ingredientes</span>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium font-mono ${
                  healthData?.services.ingredient_dataset === 'loaded'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {healthData?.services.ingredient_dataset === 'loaded' ? 'CARGADA' : 'NO DISPONIBLE'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fichas de ingredientes con fuente y nivel de evidencia.
            </p>
          </div>
        </div>
      </section>

      {/* Política de Resiliencia y Contingencia Local */}
      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg">
          <HardDrive className="w-5 h-5 text-teal-700" />
          <h2>Protocolo de Contingencia para el Entorno Local Venezolano</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          En consideración a las fluctuaciones eléctricas o interrupciones de conectividad que pueden suscitarse en nodos de desarrollo locales o túneles de red:
        </p>
        <div className="space-y-3 text-xs sm:text-sm text-slate-700">
          <div className="p-3.5 rounded bg-slate-50 border border-slate-200/80">
            <strong className="text-slate-900 block mb-1">1. Autonomía de Rutina & Calendario en Dispositivo (Client Storage)</strong>
            <span>Su rutina activa de Skin Cycling, productos del tocador y notas personales quedan preservados en el almacenamiento seguro de su navegador. Podrá continuar registrando su noche de exfoliación o retinización sin depender de una conexión activa con el servidor central.</span>
          </div>
          <div className="p-3.5 rounded bg-slate-50 border border-slate-200/80">
            <strong className="text-slate-900 block mb-1">2. Guía facial 2D y AR</strong>
            <span>La guía 2D usa contenido de la propia app. La función de AR con cámara descarga su motor y modelo desde servicios públicos externos, por lo que necesita conexión a internet la primera vez que se usa.</span>
          </div>
          <div className="p-3.5 rounded bg-slate-50 border border-slate-200/80">
            <strong className="text-slate-900 block mb-1">3. Al restablecerse la conexión</strong>
            <span>La app vuelve a consultar al servidor de forma periódica. Los datos que viven en el servidor (precios, tiendas, ofertas, análisis de productos) no están disponibles mientras no haya conexión.</span>
          </div>
        </div>
      </section>

      {/* Sello de Cumplimiento DLG-EXEC */}
      <footer className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>Monitor de Infraestructura • DLG-EXEC SLA Transparency</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/aviso-medico" className="hover:text-slate-800 underline underline-offset-2">Aviso Médico</Link>
          <Link href="/terminos" className="hover:text-slate-800 underline underline-offset-2">Términos de Uso</Link>
          <Link href="/privacidad" className="hover:text-slate-800 underline underline-offset-2">Política de Privacidad</Link>
        </div>
      </footer>
    </div>
  );
}
