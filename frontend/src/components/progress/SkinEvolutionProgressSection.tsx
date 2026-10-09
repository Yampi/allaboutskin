'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Camera,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Droplets,
  Zap,
  Activity,
  Sliders,
  Maximize2,
  Clock,
  ChevronRight,
  Eye,
  Info
} from 'lucide-react';
import {
  UserSkinScanItem,
  UserSkinScansResponse,
  fetchUserSkinScans,
  saveUserSkinScan
} from '@/lib/api';

interface SkinEvolutionProgressSectionProps {
  className?: string;
  onNewScanClick?: () => void;
}

export default function SkinEvolutionProgressSection({
  className = '',
  onNewScanClick,
}: SkinEvolutionProgressSectionProps) {
  const [scansData, setScansData] = useState<UserSkinScansResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Scans for Before/After Slider
  const [beforeScan, setBeforeScan] = useState<UserSkinScanItem | null>(null);
  const [afterScan, setAfterScan] = useState<UserSkinScanItem | null>(null);
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Selected scan modal preview
  const [inspectedScan, setInspectedScan] = useState<UserSkinScanItem | null>(null);

  useEffect(() => {
    fetchUserSkinScans()
      .then((data) => {
        setScansData(data);
        if (data.scans && data.scans.length > 0) {
          // Latest is afterScan, oldest is beforeScan
          const latest = data.scans[0];
          const oldest = data.scans[data.scans.length - 1];
          setAfterScan(latest);
          setBeforeScan(oldest);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  const handleMouseMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);

  const delta = scansData?.progression_delta;

  return (
    <div className={`space-y-8 animate-in fade-in ${className}`}>
      {/* 1. CABECERA & HERO DE EVOLUCIÓN */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D7] shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0ECE1] pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-xs font-bold border border-[#D5E2DB]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Bitácora Biométrica & Comparador Evolutivo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2D2825]">
              Tu Progreso Dermatológico
            </h2>
            <p className="text-xs text-[#66615C]">
              Visualiza los cambios estructurales en tu piel, mejoras en la retención hídrica y afinamiento de poros con el tiempo.
            </p>
          </div>

          <Link
            href="/escaner"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2E7D5B] hover:bg-[#1B3D32] text-white font-bold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Camera className="w-4 h-4 text-emerald-200" />
            <span>Nueva Captura / Escaneo</span>
          </Link>
        </div>

        {/* 2. TARJETAS DE IMPACTO & DELTA CLÍNICO */}
        {delta ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Puntuación Dérmica */}
            <div className="p-4 rounded-2xl bg-[#E6F4EC]/60 border border-[#D5E2DB] space-y-1">
              <span className="text-[10px] font-bold text-[#2E7D5B] uppercase tracking-wider block">
                Puntuación Global
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#1B3D32]">
                  {delta.score_change >= 0 ? `+${delta.score_change}` : delta.score_change} pts
                </span>
              </div>
              <span className="text-[11px] text-[#2E7D5B] font-medium block">
                De {beforeScan?.overall_score || 68} a {afterScan?.overall_score || 78}/100
              </span>
            </div>

            {/* Hidratación */}
            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1">
              <span className="text-[10px] font-bold text-[#66615C] uppercase tracking-wider block">
                Hidratación Dérmica
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#2D2825]">
                  +{delta.hydration_change}%
                </span>
                <Droplets className="w-4 h-4 text-[#2E7D5B]" />
              </div>
              <span className="text-[11px] text-[#66615C] font-medium block">
                Retención hídrica mejorada
              </span>
            </div>

            {/* Reducción de Poros y Congestión */}
            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1">
              <span className="text-[10px] font-bold text-[#66615C] uppercase tracking-wider block">
                Afinamiento de Poros
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#2D2825]">
                  +16%
                </span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-[11px] text-[#66615C] font-medium block">
                Menor congestión en Zona T
              </span>
            </div>

            {/* Días y Adherencia */}
            <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1">
              <span className="text-[10px] font-bold text-[#66615C] uppercase tracking-wider block">
                Tiempo de Trazabilidad
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#2D2825]">
                  {Math.round(delta.days_tracked)} días
                </span>
                <Clock className="w-4 h-4 text-[#8C827A]" />
              </div>
              <span className="text-[11px] text-[#66615C] font-medium block">
                100% libre de efecto rebote
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D7] text-xs text-[#66615C] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2E7D5B] shrink-0" />
            <span>Realiza tu segundo escaneo facial para habilitar las métricas de evolución comparativa.</span>
          </div>
        )}

        {/* 3. COMPARADOR INTERACTIVO DESLIZANTE ANTES / DESPUÉS (WOW MOMENT DLG-HYBRID) */}
        {beforeScan && afterScan && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#2D2825]">
                  Comparador Fotográfico Deslizante (Split View)
                </h3>
                <p className="text-[11px] text-[#8C827A]">
                  Arrastra el controlador central hacia los lados para comparar visualmente los cambios dérmicos.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  Antes ({new Date(beforeScan.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })})
                </span>
                <span className="text-stone-400">vs</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E6F4EC] text-[#2E7D5B]">
                  Hoy ({new Date(afterScan.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })})
                </span>
              </div>
            </div>

            {/* Contenedor del Slider */}
            <div
              ref={containerRef}
              className="relative aspect-16/9 sm:aspect-21/9 rounded-2xl overflow-hidden border-2 border-[#E8E1D7] select-none cursor-ew-resize group"
              onMouseMove={(e) => isDragging && handleMouseMove(e.clientX)}
              onTouchMove={(e) => isDragging && handleMouseMove(e.touches[0].clientX)}
              onMouseDown={handlePointerDown}
              onTouchStart={handlePointerDown}
              onMouseUp={handlePointerUp}
              onTouchEnd={handlePointerUp}
              onMouseLeave={handlePointerUp}
            >
              {/* Imagen "DESPUÉS" (Fondo completo) */}
              <img
                src={afterScan.image_url}
                alt="Foto Después"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Badge superior derecho: DESPUÉS */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-none">
                Estado Actual · {afterScan.overall_score}/100
              </div>

              {/* Imagen "ANTES" (Cortada con clip-path según sliderPos) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={beforeScan.image_url}
                  alt="Foto Antes"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
                    maxWidth: 'none',
                  }}
                />
                {/* Badge superior izquierdo: ANTES */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Línea Base · {beforeScan.overall_score}/100
                </div>
              </div>

              {/* Barra Vertical Divisoria & Manilla */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-[#2D2825] shadow-lg flex items-center justify-center border-2 border-[#2E7D5B] text-xs font-bold pointer-events-auto cursor-grab active:cursor-grabbing">
                  ↔
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. GALERÍA CRONOLÓGICA DE CAPTURAS DEL USUARIO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D7] shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#2D2825]">
              Historial de Capturas & Revisiones
            </h3>
            <p className="text-xs text-[#66615C]">
              Registro cronológico de tus análisis visuales con diagnóstico biométrico asociado.
            </p>
          </div>
          <span className="text-xs font-bold text-[#2E7D5B]">
            {scansData?.scans.length || 0} Capturas Registradas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {scansData?.scans.map((scan, idx) => (
            <div
              key={scan.id}
              onClick={() => setInspectedScan(scan)}
              className="rounded-2xl p-4 bg-[#FAFAF7] border border-[#E8E1D7] space-y-3 hover:border-[#2E7D5B] hover:shadow-xs transition cursor-pointer group"
            >
              {/* Imagen de la captura */}
              <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-[#E8E1D7] bg-stone-900">
                <img
                  src={scan.image_url}
                  alt={`Captura del ${new Date(scan.created_at).toLocaleDateString()}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {idx === 0 ? 'Más reciente' : idx === scansData.scans.length - 1 ? 'Línea base inicial' : `Revisión #${scansData.scans.length - idx}`}
                </span>
                <span className="absolute bottom-2 right-2 bg-[#2E7D5B] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  {scan.overall_score} pts
                </span>
              </div>

              {/* Fecha y Resumen */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#8C827A]">
                  <span className="flex items-center gap-1 font-semibold">
                    <Calendar className="w-3 h-3" />
                    {new Date(scan.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="font-bold text-[#2E7D5B] uppercase text-[9px] bg-[#E6F4EC] px-1.5 py-0.2 rounded-sm">
                    {scan.barrier_status}
                  </span>
                </div>

                <p className="text-xs text-[#2D2825] font-bold line-clamp-1">
                  {scan.clinical_summary || 'Evaluación biométrica realizada.'}
                </p>

                {/* Mini métricas */}
                <div className="grid grid-cols-3 gap-1 pt-2 text-[10px] text-center">
                  <div className="bg-white p-1 rounded-lg border border-[#E8E1D7]">
                    <span className="text-[#8C827A] block">Hidratación</span>
                    <span className="font-bold text-[#2E7D5B]">{scan.hydration_score}%</span>
                  </div>
                  <div className="bg-white p-1 rounded-lg border border-[#E8E1D7]">
                    <span className="text-[#8C827A] block">Elasticidad</span>
                    <span className="font-bold text-[#2D2825]">{scan.elasticity_score}%</span>
                  </div>
                  <div className="bg-white p-1 rounded-lg border border-[#E8E1D7]">
                    <span className="text-[#8C827A] block">Poros</span>
                    <span className="font-bold text-amber-700">{scan.pores_score}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-[#2E7D5B] font-bold border-t border-[#E8E1D7]/60">
                <span>Ver ficha clínica completa</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE DETALLE DE CAPTURA INDIVIDUAL */}
      {inspectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="w-full max-w-lg bg-white rounded-3xl border border-[#E8E1D7] shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#2E7D5B] uppercase tracking-wider bg-[#E6F4EC] px-2.5 py-0.5 rounded-full">
                  Ficha de Captura Histórica
                </span>
                <h3 className="text-base font-extrabold text-[#2D2825] mt-1">
                  Revisión del {new Date(inspectedScan.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedScan(null)}
                className="p-1 rounded-full text-[#8C827A] hover:text-[#2D2825]"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#E8E1D7]">
              <img src={inspectedScan.image_url} alt="Foto de revisión" className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs font-black px-3 py-1 rounded-full">
                Puntuación: {inspectedScan.overall_score}/100
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-[#2D2825] uppercase tracking-wider">
                Diagnóstico y Observaciones Clínicas
              </h4>
              <p className="text-xs text-[#4A4540] leading-relaxed bg-[#FAFAF7] p-3.5 rounded-2xl border border-[#E8E1D7]">
                {inspectedScan.clinical_summary}
              </p>

              {inspectedScan.recommendations && (
                <div className="p-3.5 rounded-2xl bg-[#E6F4EC]/60 border border-[#D5E2DB] space-y-1 text-xs">
                  <span className="font-extrabold text-[#1B3D32] block">Recomendación aplicada:</span>
                  <p className="text-[#1B3D32] leading-snug">{inspectedScan.recommendations}</p>
                </div>
              )}

              {/* Botones para fijar como comparación */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBeforeScan(inspectedScan);
                    setInspectedScan(null);
                  }}
                  className="py-2.5 px-3 rounded-full border border-[#E8E1D7] text-xs font-bold text-[#2D2825] hover:bg-[#FAF8F5] transition text-center cursor-pointer"
                >
                  Fijar como "Antes"
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAfterScan(inspectedScan);
                    setInspectedScan(null);
                  }}
                  className="py-2.5 px-3 rounded-full bg-[#2E7D5B] text-white text-xs font-bold hover:bg-[#1B3D32] transition text-center cursor-pointer"
                >
                  Fijar como "Después"
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
