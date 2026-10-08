'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Sliders,
  Check,
  X,
  HeartPulse,
  Activity,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import UserAppShell from '@/components/navigation/UserAppShell';
import { getCurrentUser, StoredUser, fetchUserProfile, updateUserProfile } from '@/lib/api';

const FITZPATRICK_SWATCHES = [
  { type: 'I', label: 'Muy clara (se quema siempre)', color: '#FBF0E4' },
  { type: 'II', label: 'Clara (se quema con facilidad)', color: '#F3DCBE' },
  { type: 'III', label: 'Morena clara (se quema moderadamente)', color: '#DFB28B' },
  { type: 'IV', label: 'Morena (se quema mínimamente)', color: '#BC865A' },
  { type: 'V', label: 'Oscura (raramente se quema)', color: '#8D5832' },
  { type: 'VI', label: 'Muy oscura (nunca se quema)', color: '#4D2C1D' },
];

export default function MiPielPage() {
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [biotipo, setBiotipo] = useState('Graso / Sensible');
  const [biotipoChips, setBiotipoChips] = useState(['Graso', 'Sensible']);
  const [fitzpatrick, setFitzpatrick] = useState('III');
  const [tewlValue, setTewlValue] = useState(12.4);
  const [tewlStatus, setTewlStatus] = useState('En rango normal');

  const [focosActivos] = useState([
    { id: 'acne', label: 'Acné (leve)', color: 'bg-amber-500' },
    { id: 'poros', label: 'Poros dilatados', color: 'bg-purple-500' },
    { id: 'rojez', label: 'Enrojecimiento (leve)', color: 'bg-rose-500' },
    { id: 'manchas', label: 'Manchas post-acné', color: 'bg-amber-700' },
  ]);

  const [historialAnalisis] = useState([
    { date: '15 abr 2026', type: 'Escaneo facial', score: 78, status: 'Buena' },
    { date: '02 mar 2026', type: 'Escaneo facial', score: 72, status: 'Estable' },
    { date: '18 ene 2026', type: 'Escaneo facial', score: 68, status: 'Atención' },
  ]);

  const [recomendaciones] = useState([
    'Mantener rutina de control de sebo y equilibrio lipídico',
    'Usar activos calmantes de alta pureza (niacinamida 5%, cica)',
    'Evitar sobre-exfoliación química o frotado abrasivo',
    'Protección solar mineral o fluido ultraligero SPF 50+ diario',
  ]);

  // Modal para calibrar perfil
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editBiotipo, setEditBiotipo] = useState(biotipo);
  const [editFitzpatrick, setEditFitzpatrick] = useState(fitzpatrick);
  const [editTewl, setEditTewl] = useState(tewlValue);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    fetchUserProfile()
      .then((res) => {
        if (res?.data) {
          const typeMap: Record<string, string> = {
            'OILY': 'Graso',
            'DRY': 'Seco',
            'COMBINATION': 'Mixto',
            'NORMAL': 'Equilibrado',
            'SENSITIVE': 'Sensible',
          };
          const mainType = typeMap[res.data.skin_type] || res.data.skin_type || 'Graso / Sensible';
          setBiotipo(mainType);
          setEditBiotipo(mainType);
          if (res.data.fitzpatrick_type) {
            const fitz = ['I', 'II', 'III', 'IV', 'V', 'VI'][res.data.fitzpatrick_type - 1] || 'III';
            setFitzpatrick(fitz);
            setEditFitzpatrick(fitz);
          }
          if (res.data.barrier_status) {
            setTewlStatus(res.data.barrier_status === 'HEALTHY' ? 'En rango normal' : 'Barrera comprometida');
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setBiotipo(editBiotipo);
    setFitzpatrick(editFitzpatrick);
    setTewlValue(editTewl);

    const chips = editBiotipo.split('/').map((s) => s.trim());
    setBiotipoChips(chips.length > 0 ? chips : [editBiotipo]);

    if (currentUser?.token) {
      const skinTypeMapping: Record<string, string> = {
        'Graso': 'OILY',
        'Graso / Sensible': 'COMBINATION',
        'Seco': 'DRY',
        'Mixto': 'COMBINATION',
        'Sensible': 'SENSITIVE',
      };
      const fitzMapping: Record<string, number> = {
        'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6
      };

      try {
        await updateUserProfile({
          skin_type: (skinTypeMapping[editBiotipo] || 'COMBINATION') as 'DRY' | 'NORMAL' | 'OILY' | 'COMBINATION' | 'SENSITIVE',
          fitzpatrick_type: fitzMapping[editFitzpatrick] || 3,
        });
      } catch (err) {
        console.error('Error al guardar en backend:', err);
      }
    }

    setIsUpdateModalOpen(false);
  };

  return (
    <UserAppShell activeNavId="mi-piel">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in">
        
        {/* HEADER DEL PERFIL DERMATOLÓGICO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E1D7] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-xs font-bold uppercase tracking-wider mb-1 border border-[#D5E2DB]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Biometría & Diagnóstico Clínico</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">
              Mi perfil dermatológico
            </h1>
            <p className="text-sm text-[#66615C]">
              Tu información personalizada para una rutina más efectiva y segura.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/mi-rutina"
              className="px-4 py-2 rounded-full bg-white hover:bg-[#F2F7F4] border border-[#E8E1D7] text-xs font-bold text-[#2D2825] transition shadow-2xs flex items-center gap-2"
            >
              <span>Ver mi rutina activa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => {
                setEditBiotipo(biotipo);
                setEditFitzpatrick(fitzpatrick);
                setEditTewl(tewlValue);
                setIsUpdateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-[#2E7D5B] hover:bg-[#1B3D32] text-white px-4 py-2 rounded-full text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Actualizar perfil</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6 TARJETAS DERMATOLÓGICAS (Mockup Pantalla 5)              */}
        {/* ========================================================= */}
        <div className="space-y-6">
          
          {/* FILA 1: 3 TARJETAS SUPERIORES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* TARJETA 1: BIOTIPO DE PIEL (BAUMANN) */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider block">
                  Biotipo de piel (Baumann)
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-[#2D2825] tracking-tight">
                  {biotipo}
                </div>
                <p className="text-xs text-[#66615C] leading-relaxed">
                  Produce más sebo, es propensa a brillos en zona T y puede reaccionar a fragancias o exfoliantes abrasivos.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {biotipoChips.map((chip, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] border border-[#D5E2DB] text-xs font-semibold shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B]" />
                    <span>{chip}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* TARJETA 2: FOTOTIPO (FITZPATRICK) */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider block">
                  Fototipo (Fitzpatrick)
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-[#2D2825] tracking-tight">
                  Fototipo {fitzpatrick}
                </div>
                <p className="text-xs text-[#66615C] leading-relaxed">
                  Piel morena clara: se quema moderadamente y broncea bien. Requiere protección diaria contra hiperpigmentación post-inflamatoria.
                </p>
              </div>

              {/* Muestras de la Escala Fitzpatrick */}
              <div className="flex items-center gap-2 pt-2">
                {FITZPATRICK_SWATCHES.map((swatch) => (
                  <div
                    key={swatch.type}
                    title={`Fototipo ${swatch.type}: ${swatch.label}`}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      fitzpatrick === swatch.type
                        ? 'border-[#2E7D5B] scale-110 shadow-xs'
                        : 'border-[#E8E1D7] opacity-60'
                    }`}
                    style={{ backgroundColor: swatch.color }}
                  />
                ))}
              </div>
            </div>

            {/* TARJETA 3: ESTADO DE LA BARRERA */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider block">
                  Estado de la barrera cutánea
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-[#2D2825] tracking-tight">
                  TEWL: {tewlValue} g/m²h
                </div>
                <p className="text-xs text-[#66615C] leading-relaxed">
                  Pérdida transepidérmica de agua controlada. La integridad lipídica es capaz de retener humedad fisiológica.
                </p>
              </div>

              <div className="pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] border border-[#D5E2DB] text-xs font-semibold shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B]" />
                  <span>{tewlStatus}</span>
                </div>
              </div>
            </div>

          </div>

          {/* FILA 2: 3 TARJETAS INFERIORES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* TARJETA 4: FOCOS ACTIVOS */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs hover:shadow-xs transition space-y-4">
              <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider block">
                Focos activos
              </span>
              <div className="space-y-2.5">
                {focosActivos.map((foco) => (
                  <div key={foco.id} className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${foco.color}`} />
                    <span className="text-xs font-semibold text-[#2D2825]">
                      {foco.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* TARJETA 5: HISTORIAL DE ANÁLISIS */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs hover:shadow-xs transition space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider">
                  Historial de análisis
                </span>
                <Link href="/escaner" className="text-[11px] font-bold text-[#2E7D5B] hover:underline">
                  Ver todos →
                </Link>
              </div>
              <div className="space-y-3">
                {historialAnalisis.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-[#F4F1EC] pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-semibold text-[#2D2825] block">{item.date}</span>
                      <span className="text-[10px] text-[#66615C]">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#2E7D5B]">{item.score}/100</span>
                      <span className="text-[10px] text-[#66615C]">({item.status})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TARJETA 6: RECOMENDACIONES CLÍNICAS */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs hover:shadow-xs transition space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider">
                  Recomendaciones
                </span>
                <Link href="/mi-rutina" className="text-[11px] font-bold text-[#2E7D5B] hover:underline">
                  Ver rutina →
                </Link>
              </div>
              <ul className="space-y-2">
                {recomendaciones.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#2D2825]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B] mt-1.5 shrink-0" />
                    <span className="leading-snug">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL: ACTUALIZAR PERFIL CLÍNICO                          */}
      {/* ========================================================= */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8E1D7] shadow-2xl p-6 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
              <h3 className="text-base font-extrabold text-[#2D2825]">
                Calibrar Biotipo y Diagnóstico
              </h3>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1 rounded-full text-[#66615C] hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#2D2825] block mb-1">
                  Biotipo de piel (Baumann)
                </label>
                <select
                  value={editBiotipo}
                  onChange={(e) => setEditBiotipo(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8E1D7] bg-[#FAFAF7]"
                >
                  <option value="Graso / Sensible">Graso / Sensible</option>
                  <option value="Graso">Graso (Seborrea controlada)</option>
                  <option value="Mixto / Sensible">Mixto / Sensible</option>
                  <option value="Seco / Alípico">Seco / Alípico</option>
                  <option value="Equilibrado">Equilibrado / Normal</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#2D2825] block mb-1">
                  Fototipo Fitzpatrick
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {['I', 'II', 'III', 'IV', 'V', 'VI'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditFitzpatrick(t)}
                      className={`p-2 rounded-xl font-bold border transition ${
                        editFitzpatrick === t
                          ? 'bg-[#E6F4EC] text-[#2E7D5B] border-[#2E7D5B]'
                          : 'bg-[#FAFAF7] border-[#E8E1D7]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#2D2825] block mb-1">
                  Índice TEWL Estimado (g/m²h)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editTewl}
                  onChange={(e) => setEditTewl(parseFloat(e.target.value) || 12)}
                  className="w-full p-2.5 rounded-xl border border-[#E8E1D7] bg-[#FAFAF7]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="flex-1 py-2.5 rounded-full bg-slate-100 font-bold text-xs text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex-1 py-2.5 rounded-full bg-[#2E7D5B] hover:bg-[#1B3D32] text-white font-bold text-xs shadow-xs"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

    </UserAppShell>
  );
}
