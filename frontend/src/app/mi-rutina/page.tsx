'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ShieldCheck,
  Activity,
  Bot,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Info,
  Clock,
  Layers,
  ChevronRight,
  Sliders,
  Check,
  X,
  RefreshCw,
  Sun,
  Moon,
  Home,
  HeartPulse,
  Package,
  Scan,
  Store,
  User,
  Search,
  Bell,
  Flower2,
  Camera,
  Video,
  VideoOff,
  CheckCheck
} from 'lucide-react';
import {
  getCurrentUser,
  getSavedCustomProtocol,
  getStoredRoutineProducts,
  setStoredRoutineProducts,
  getSavedDailyRoutine,
  saveDailyRoutine,
  StoredUser,
  UserDailyRoutine,
  auditFullRoutineAi,
  fetchUserProfile,
  updateUserProfile,
  logUserRoutineAdherence
} from '@/lib/api';
import { SkinCyclingProtocol, UserRoutineProduct } from '@/types/skinCycling';
import { generateCustomProtocol } from '@/lib/skinCyclingEngine';

// Swatches de fototipos Fitzpatrick I a VI
const FITZPATRICK_SWATCHES = [
  { type: 'I', label: 'Muy clara (se quema siempre, nunca broncea)', color: '#FBF0E4' },
  { type: 'II', label: 'Clara (se quema con facilidad, broncea mínimo)', color: '#F3DCBE' },
  { type: 'III', label: 'Morena clara (se quema moderadamente, broncea bien)', color: '#DFB28B' },
  { type: 'IV', label: 'Morena (se quema mínimamente, broncea fácilmente)', color: '#BC865A' },
  { type: 'V', label: 'Oscura (raramente se quema, broncea profusamente)', color: '#8D5832' },
  { type: 'VI', label: 'Muy oscura (nunca se quema, altamente pigmentada)', color: '#4D2C1D' },
];

export default function MiPerfilDermatologicoPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [activeTab, setActiveTab] = useState<'perfil' | 'rutina'>('perfil');

  // Datos del Perfil Dermatológico (Vista 5 de Mockup)
  const [biotipo, setBiotipo] = useState('Graso / Sensible');
  const [biotipoChips, setBiotipoChips] = useState(['Graso', 'Sensible']);
  const [fitzpatrick, setFitzpatrick] = useState('III');
  const [tewlValue, setTewlValue] = useState(12.4);
  const [tewlStatus, setTewlStatus] = useState('En rango normal');
  
  const [focosActivos, setFocosActivos] = useState([
    { id: 'acne', label: 'Acné (leve)', color: 'bg-amber-500', text: 'text-amber-800' },
    { id: 'poros', label: 'Poros dilatados', color: 'bg-purple-500', text: 'text-purple-800' },
    { id: 'rojez', label: 'Enrojecimiento (leve)', color: 'bg-rose-500', text: 'text-rose-800' },
    { id: 'manchas', label: 'Manchas post-acné', color: 'bg-amber-700', text: 'text-amber-900' },
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

  // Modal para actualizar perfil
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editBiotipo, setEditBiotipo] = useState(biotipo);
  const [editFitzpatrick, setEditFitzpatrick] = useState(fitzpatrick);
  const [editTewl, setEditTewl] = useState(tewlValue);

  // Estados de productos y auditoría IA
  const [products, setProducts] = useState<UserRoutineProduct[]>([]);
  const [isAiAuditingRoutine, setIsAiAuditingRoutine] = useState(false);
  const [aiRoutineAudit, setAiRoutineAudit] = useState<any | null>(null);
  const [aiRoutineAuditError, setAiRoutineAuditError] = useState<string | null>(null);

  // Modal para agregar producto a rutina
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<UserRoutineProduct['category']>('SERUM');
  const [selectedPhase, setSelectedPhase] = useState<number>(2);

  // Estados para Asistente Inteligente de Rutina por Cámara (QoL Automatización)
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanningFrame, setIsScanningFrame] = useState(false);
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());
  const [detectedRoutineProduct, setDetectedRoutineProduct] = useState<UserRoutineProduct | null>(null);
  const [detectedStepIndex, setDetectedStepIndex] = useState<number | null>(null);
  const [missingPreviousSteps, setMissingPreviousSteps] = useState<UserRoutineProduct[]>([]);
  const [scientificOrderNotice, setScientificOrderNotice] = useState<string | null>(null);
  const [scannerSuccessNotice, setScannerSuccessNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Carga inicial
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const storedProducts = getStoredRoutineProducts();
    if (storedProducts && storedProducts.length > 0) {
      setProducts(storedProducts);
    } else {
      setProducts([
        { id: '1', productName: 'Gel Limpiador Espumoso', brand: 'CeraVe', category: 'CLEANSER', phaseId: 1 },
        { id: '2', productName: 'Niacinamide 10% + Zinc 1%', brand: 'The Ordinary', category: 'SERUM', phaseId: 2 },
        { id: '3', productName: 'Cicaplast Baume B5+', brand: 'La Roche-Posay', category: 'MOISTURIZER', phaseId: 3 },
        { id: '4', productName: 'Fusion Water Magic SPF 50', brand: 'ISDIN', category: 'SPF', phaseId: 0 },
      ]);
    }

    // Carga de perfil desde Base de Datos o localStorage
    if (currentUser?.token) {
      fetchUserProfile().then((res) => {
        if (res?.data) {
          const typeMap: Record<string, string> = {
            'OILY': 'Graso',
            'DRY': 'Seco',
            'COMBINATION': 'Mixto',
            'NORMAL': 'Equilibrado',
            'SENSITIVE': 'Sensible',
          };
          const mainType = typeMap[res.data.skin_type] || res.data.skin_type;
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
      }).catch((e) => console.warn('Aviso perfil offline:', e));
    } else {
      const savedProfile = localStorage.getItem('allabout_user_dermal_profile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed.biotipo) setBiotipo(parsed.biotipo);
          if (parsed.fitzpatrick) setFitzpatrick(parsed.fitzpatrick);
          if (parsed.tewlValue) setTewlValue(parsed.tewlValue);
          if (parsed.biotipoChips) setBiotipoChips(parsed.biotipoChips);
        } catch (e) {
          console.error(e);
        }
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('No se pudo acceder a la cámara:', err);
      setCameraError('No se pudo activar la cámara web. Puedes realizar la prueba seleccionando tu producto abajo.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleOpenSmartScanner = () => {
    setIsCameraScannerOpen(true);
    setDetectedRoutineProduct(null);
    setDetectedStepIndex(null);
    setMissingPreviousSteps([]);
    setScientificOrderNotice(null);
    setScannerSuccessNotice(null);
    startCamera();
  };

  const handleCloseSmartScanner = () => {
    stopCamera();
    setIsCameraScannerOpen(false);
  };

  const handleDetectProduct = (product: UserRoutineProduct) => {
    setIsScanningFrame(true);
    setTimeout(() => {
      setIsScanningFrame(false);
      const prodIndex = products.findIndex((p) => p.id === product.id);
      setDetectedRoutineProduct(product);
      setDetectedStepIndex(prodIndex >= 0 ? prodIndex + 1 : 1);

      const priorIncomplete = products.slice(0, prodIndex).filter((p) => !completedStepIds.has(p.id));
      setMissingPreviousSteps(priorIncomplete);

      if (product.category === 'SPF' && new Date().getHours() >= 19) {
        setScientificOrderNotice('Recomendación científica: El protector solar es un escudo diurno contra rayos UV. En la noche, tu piel respira y se regenera mejor con hidratante o activo calmante.');
      } else if (prodIndex > 0 && priorIncomplete.length > 0 && (product.category === 'SERUM' || product.category === 'EXFOLIANT')) {
        setScientificOrderNotice('Importante: Se recomienda aplicar sérums y exfoliantes sobre la piel previamente limpia para optimizar la penetración dérmica y evitar irritación.');
      } else {
        setScientificOrderNotice(null);
      }
    }, 600);
  };

  const handleConfirmStepCheck = (includePrevious: boolean) => {
    if (!detectedRoutineProduct) return;

    const newCompleted = new Set(completedStepIds);
    newCompleted.add(detectedRoutineProduct.id);

    if (includePrevious && missingPreviousSteps.length > 0) {
      missingPreviousSteps.forEach((p) => newCompleted.add(p.id));
    }

    setCompletedStepIds(newCompleted);

    if (user?.token) {
      logUserRoutineAdherence({
        slot: new Date().getHours() >= 17 ? 'PM' : 'AM',
        notes: `Completado asistido por escaneo de producto: ${detectedRoutineProduct.productName}`,
      }).catch((e) => console.warn('Silent adherence log notice:', e));
    }

    setScannerSuccessNotice(
      includePrevious && missingPreviousSteps.length > 0
        ? `¡Excelente! Se tacharon de tu rutina los ${missingPreviousSteps.length + 1} pasos completados.`
        : `¡Paso tachado con éxito! Tu rutina avanza correctamente.`
    );

    setTimeout(() => {
      setDetectedRoutineProduct(null);
      setScannerSuccessNotice(null);
    }, 2000);
  };

  const handleSaveProfile = () => {
    setBiotipo(editBiotipo);
    setFitzpatrick(editFitzpatrick);
    setTewlValue(editTewl);
    
    // Determinar chips
    const chips = [];
    if (editBiotipo.toLowerCase().includes('graso')) chips.push('Graso');
    if (editBiotipo.toLowerCase().includes('sensible')) chips.push('Sensible');
    if (editBiotipo.toLowerCase().includes('seco')) chips.push('Seco');
    if (editBiotipo.toLowerCase().includes('mixto')) chips.push('Mixto');
    if (chips.length === 0) chips.push('Equilibrado');
    setBiotipoChips(chips);

    const status = editTewl <= 14 ? 'En rango normal' : editTewl <= 20 ? 'Moderado' : 'Barrera comprometida';
    setTewlStatus(status);

    localStorage.setItem(
      'allabout_user_dermal_profile',
      JSON.stringify({
        biotipo: editBiotipo,
        fitzpatrick: editFitzpatrick,
        tewlValue: editTewl,
        biotipoChips: chips,
      })
    );

    if (user?.token) {
      const dbSkinType = editBiotipo.toLowerCase().includes('graso') ? 'OILY' : editBiotipo.toLowerCase().includes('seco') ? 'DRY' : editBiotipo.toLowerCase().includes('sensible') ? 'SENSITIVE' : 'COMBINATION';
      const fitzNum = ['I', 'II', 'III', 'IV', 'V', 'VI'].indexOf(editFitzpatrick) + 1 || 3;
      updateUserProfile({
        skin_type: dbSkinType as any,
        fitzpatrick_type: fitzNum,
        barrier_status: editTewl <= 14 ? 'HEALTHY' : 'COMPROMISED',
      }).catch((e) => console.warn('Error syncing profile with DB:', e));
    }

    setIsUpdateModalOpen(false);
  };

  const handleAddProduct = () => {
    if (!newProductName.trim()) return;

    const newProd: UserRoutineProduct = {
      id: Date.now().toString(),
      phaseId: selectedPhase,
      productName: newProductName.trim(),
      brand: newProductBrand.trim() || undefined,
      category: newProductCategory,
    };

    const updated = [...products, newProd];
    setProducts(updated);
    setStoredRoutineProducts(updated);

    setNewProductName('');
    setNewProductBrand('');
    setIsAddProductOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    setStoredRoutineProducts(updated);
  };

  const handleRunAiRoutineAudit = async () => {
    if (products.length === 0) {
      setAiRoutineAuditError('Añade al menos un producto a tu rutina para poder auditarla.');
      return;
    }

    setIsAiAuditingRoutine(true);
    setAiRoutineAuditError(null);

    try {
      const routinePayload = products.map((p) => ({
        name: p.productName,
        brand: p.brand,
        category: p.category,
      }));

      const audit = await auditFullRoutineAi(routinePayload, biotipo.includes('Graso') ? 'OILY' : 'COMBINATION');
      setAiRoutineAudit(audit);
    } catch (err: any) {
      setAiRoutineAuditError(err?.message || 'Error al conectar con el motor de IA de Gemini.');
    } finally {
      setIsAiAuditingRoutine(false);
    }
  };

  const userName = user?.name || 'María González';

  return (
    <div className="w-full min-h-screen bg-[#FAFAF7] text-[#2D2825] py-8 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in">
        
        {/* ========================================================= */}
        {/* TOPBAR / HERO DEL PERFIL DERMATOLÓGICO                    */}
        {/* ========================================================= */}
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
              Tu información personalizada para una rutina más efectiva.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de Pestañas Perfil vs Rutina */}
            <div className="flex bg-[#EFECE6] p-1 rounded-full border border-[#E8E1D7]">
              <button
                type="button"
                onClick={() => setActiveTab('perfil')}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${
                  activeTab === 'perfil'
                    ? 'bg-white text-[#2E7D5B] shadow-2xs'
                    : 'text-[#66615C] hover:text-[#2D2825]'
                }`}
              >
                Perfil Clínico
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rutina')}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${
                  activeTab === 'rutina'
                    ? 'bg-white text-[#2E7D5B] shadow-2xs'
                    : 'text-[#66615C] hover:text-[#2D2825]'
                }`}
              >
                Mis Productos ({products.length})
              </button>
            </div>

            {/* Botón Actualizar Perfil (Mockup Vista 5) */}
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
        {/* VISTA 5 MOCKUP: 6 TARJETAS DERMATOLÓGICAS                 */}
        {/* ========================================================= */}
        {activeTab === 'perfil' && (
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
                    Produce más sebo, es propensa a brillos y puede reaccionar a ciertos ingredientes.
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
                    {fitzpatrick}
                  </div>
                  <p className="text-xs text-[#66615C] leading-relaxed">
                    Piel morena clara, se quema moderadamente y broncea bien.
                  </p>
                </div>

                {/* 6 Color Swatches */}
                <div className="pt-2">
                  <div className="flex items-center gap-2.5">
                    {FITZPATRICK_SWATCHES.map((swatch) => {
                      const isSelected = swatch.type === fitzpatrick;
                      return (
                        <button
                          key={swatch.type}
                          type="button"
                          onClick={() => setFitzpatrick(swatch.type)}
                          title={`Fototipo ${swatch.type}: ${swatch.label}`}
                          className={`w-6 h-6 rounded-full border border-black/10 transition cursor-pointer relative ${
                            isSelected
                              ? 'ring-2 ring-[#2E7D5B] ring-offset-2 scale-110 shadow-xs'
                              : 'hover:scale-105 opacity-80'
                          }`}
                          style={{ backgroundColor: swatch.color }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-[#8C827A] mt-2 block font-medium">
                    Escala I a VI · Fototipo actual: Tipo {fitzpatrick}
                  </span>
                </div>
              </div>

              {/* TARJETA 3: ESTADO DE LA BARRERA */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider block">
                    Estado de la barrera
                  </span>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#2D2825] tracking-tight">
                    TEWL: {tewlValue} g/m²h
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B] animate-pulse" />
                      {tewlStatus}
                    </span>
                  </div>
                </div>

                {/* Gauge bar de TEWL */}
                <div className="pt-2 space-y-1.5">
                  <div className="w-full bg-[#E8E1D7]/50 rounded-full h-2.5 overflow-hidden p-0.5 border border-[#E8E1D7]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2E7D5B] to-[#10B981] transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(10, ((25 - tewlValue) / 25) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#8C827A] font-semibold">
                    <span>Retención Óptima</span>
                    <span>Pérdida transepidérmica baja</span>
                  </div>
                </div>
              </div>

            </div>

            {/* FILA 2: 3 TARJETAS INFERIORES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* TARJETA 4: FOCOS ACTIVOS */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                    <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider block">
                      Focos activos
                    </span>
                    <span className="text-xs font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2 py-0.5 rounded-full">
                      {focosActivos.length} identificados
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {focosActivos.map((foco) => (
                      <div
                        key={foco.id}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7]/60"
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${foco.color} shrink-0 shadow-2xs`} />
                        <span className="text-xs font-bold text-[#2D2825]">
                          {foco.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32] transition"
                  >
                    <span>Editar focos clínicos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* TARJETA 5: HISTORIAL DE ANÁLISIS */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                    <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider block">
                      Historial de análisis
                    </span>
                    <Clock className="w-3.5 h-3.5 text-[#8C827A]" />
                  </div>

                  <div className="space-y-2.5">
                    {historialAnalisis.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7]/60 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-[#2D2825]">{item.date}</div>
                          <div className="text-[10px] text-[#8C827A]">{item.type}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                            item.score >= 75
                              ? 'bg-[#E6F4EC] text-[#2E7D5B] border border-[#D5E2DB]'
                              : item.score >= 70
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {item.score}/100
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/escaner"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32] transition"
                  >
                    <span>Ver todos los análisis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* TARJETA 6: RECOMENDACIONES */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                    <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider block">
                      Recomendaciones
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D5B]" />
                  </div>

                  <div className="space-y-2.5">
                    {recomendaciones.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#2D2825] leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B] mt-1.5 shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/calendario"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32] transition"
                  >
                    <span>Ver recomendaciones completas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>

            {/* BANNER INFERIOR DERMATOLÓGICO: CONEXIÓN CON ESCÁNER IA */}
            <div className="bg-gradient-to-r from-[#1B3D32] to-[#2E7D5B] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#E6F4EC] text-xs font-bold uppercase tracking-wider border border-white/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Seguimiento Periódico</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  ¿Quieres evaluar tu evolución dérmica hoy?
                </h3>
                <p className="text-xs sm:text-sm text-[#E6F4EC]/90 max-w-xl">
                  Realiza un escaneo clínico con tu cámara o sube una foto con luz natural. La IA detectará niveles de hidratación, poros y tolerancia.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/escaner"
                  className="bg-white hover:bg-[#FAFAF7] text-[#1B3D32] px-6 py-3 rounded-full text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Scan className="w-4 h-4" />
                  <span>Nuevo escaneo facial</span>
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* PESTAÑA 2: PRODUCTOS EN USO & AUDITORÍA IA               */}
        {/* ========================================================= */}
        {activeTab === 'rutina' && (
          <div className="space-y-6">
            
            {/* Header de Gestión de Productos */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D7] shadow-2xs">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-[#2D2825]">
                  Productos en tu Tocador Digital
                </h2>
                <p className="text-xs text-[#66615C]">
                  Organiza las fórmulas que aplicas durante tus fases de Skin Cycling y detecta incompatibilidades químicas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenSmartScanner}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#1B3D32] to-[#2E7D5B] hover:opacity-95 text-white px-4 py-2 rounded-full text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Escanear Frasco</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-[#E6F4EC] hover:bg-[#D5E2DB] text-[#2E7D5B] px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Producto</span>
                </button>

                <button
                  type="button"
                  onClick={handleRunAiRoutineAudit}
                  disabled={isAiAuditingRoutine}
                  className="inline-flex items-center gap-1.5 bg-[#2E7D5B] hover:bg-[#1B3D32] disabled:opacity-50 text-white px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer"
                >
                  {isAiAuditingRoutine ? (
                    <>
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      <span>Auditando con Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auditar con IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error de Auditoría IA */}
            {aiRoutineAuditError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-start gap-3 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{aiRoutineAuditError}</span>
              </div>
            )}

            {/* Resultados de Auditoría IA */}
            {aiRoutineAudit && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E1D7] shadow-xs space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#2E7D5B]" />
                    <h3 className="font-bold text-sm text-[#2D2825]">
                      Diagnóstico Clínico de Fórmulas por IA
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#2E7D5B] bg-[#E6F4EC] px-3 py-1 rounded-full border border-[#D5E2DB]">
                    Seguridad {aiRoutineAudit.routineSafetyScore || 95}%
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#2D2825] leading-relaxed">
                  {aiRoutineAudit.verdict}
                </p>

                {aiRoutineAudit.severeConflicts && aiRoutineAudit.severeConflicts.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 text-xs text-amber-900">
                    <span className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Precauciones detectadas entre activos:
                    </span>
                    {aiRoutineAudit.severeConflicts.map((c: any, i: number) => (
                      <p key={i} className="pl-5">
                        • {c.productsInvolved?.join(' + ')}: {c.risk}. <em className="font-medium text-amber-800">{c.actionableFix}</em>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Grid de Productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 border border-[#E8E1D7] shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2 py-0.5 rounded-full border border-[#D5E2DB]">
                        {p.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                        title="Eliminar de mi tocador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="font-bold text-xs text-[#2D2825] pt-1">
                      {p.productName}
                    </div>
                    {p.brand && (
                      <div className="text-[10px] text-[#66615C]">
                        {p.brand}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between text-[10px] text-[#8C827A]">
                    <span>Fase asignada:</span>
                    <span className="font-bold text-[#2E7D5B]">
                      {p.phaseId === 0 ? 'Rutina AM' : `Noche ${p.phaseId}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL: ACTUALIZAR PERFIL DERMATOLÓGICO                    */}
      {/* ========================================================= */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E8E1D7] shadow-xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-4">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-[#2D2825]">
                  Actualizar Perfil Dermatológico
                </h3>
                <p className="text-xs text-[#66615C]">
                  Ajusta los parámetros para recalibrar tus recomendaciones.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAFAF7] border border-[#E8E1D7] flex items-center justify-center text-[#66615C] hover:text-[#2D2825] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Biotipo Baumann */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D2825]">
                  Biotipo Dérmico
                </label>
                <select
                  value={editBiotipo}
                  onChange={(e) => setEditBiotipo(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#E8E1D7] rounded-xl px-3 py-2 text-xs text-[#2D2825] focus:outline-none focus:ring-2 focus:ring-[#2E7D5B]"
                >
                  <option value="Graso / Sensible">Graso / Sensible (OSPW / OSPT)</option>
                  <option value="Graso / Resistente">Graso / Resistente (ORPW / ORNT)</option>
                  <option value="Seco / Sensible">Seco / Sensible (DSPW / DSPT)</option>
                  <option value="Seco / Resistente">Seco / Resistente (DRPW / DRNT)</option>
                  <option value="Mixto / Sensible">Mixto / Sensible</option>
                  <option value="Normal / Equilibrado">Normal / Equilibrado</option>
                </select>
              </div>

              {/* Fototipo Fitzpatrick */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D2825]">
                  Fototipo (Fitzpatrick)
                </label>
                <div className="grid grid-cols-6 gap-2 pt-1">
                  {FITZPATRICK_SWATCHES.map((s) => (
                    <button
                      key={s.type}
                      type="button"
                      onClick={() => setEditFitzpatrick(s.type)}
                      className={`h-10 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition cursor-pointer ${
                        editFitzpatrick === s.type
                          ? 'border-[#2E7D5B] ring-2 ring-[#2E7D5B] shadow-2xs font-extrabold'
                          : 'border-[#E8E1D7] opacity-80'
                      }`}
                      style={{ backgroundColor: s.color }}
                    >
                      <span className="text-[#2D2825] drop-shadow-xs">{s.type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* TEWL Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-[#2D2825]">
                  <label>Pérdida Transepidérmica (TEWL)</label>
                  <span className="text-[#2E7D5B]">{editTewl} g/m²h</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="0.5"
                  value={editTewl}
                  onChange={(e) => setEditTewl(parseFloat(e.target.value))}
                  className="w-full accent-[#2E7D5B]"
                />
                <div className="flex justify-between text-[10px] text-[#8C827A]">
                  <span>5 (Barrera hermética)</span>
                  <span>14 (Límite normal)</span>
                  <span>35 (Comprometida)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E1D7]">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#66615C] hover:text-[#2D2825] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-5 py-2 text-xs font-bold bg-[#2E7D5B] hover:bg-[#1B3D32] text-white rounded-full shadow-xs cursor-pointer transition active:scale-95"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: AGREGAR PRODUCTO A TOCADOR                         */}
      {/* ========================================================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E8E1D7] shadow-xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
              <h3 className="text-base font-bold text-[#2D2825]">
                Agregar Producto a tu Rutina
              </h3>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="text-[#8C827A] hover:text-[#2D2825] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D2825]">Nombre del Producto</label>
                <input
                  type="text"
                  placeholder="Ej. Niacinamide 10% + Zinc 1%"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#E8E1D7] rounded-xl px-3 py-2 text-xs text-[#2D2825] focus:outline-none focus:ring-2 focus:ring-[#2E7D5B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D2825]">Marca o Laboratorio</label>
                <input
                  type="text"
                  placeholder="Ej. The Ordinary, CeraVe, ISDIN"
                  value={newProductBrand}
                  onChange={(e) => setNewProductBrand(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#E8E1D7] rounded-xl px-3 py-2 text-xs text-[#2D2825] focus:outline-none focus:ring-2 focus:ring-[#2E7D5B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D2825]">Categoría</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as any)}
                    className="w-full bg-[#FAFAF7] border border-[#E8E1D7] rounded-xl px-3 py-2 text-xs text-[#2D2825] focus:outline-none focus:ring-2 focus:ring-[#2E7D5B]"
                  >
                    <option value="CLEANSER">Limpiador</option>
                    <option value="TONER">Tónico</option>
                    <option value="SERUM">Sérum</option>
                    <option value="EXFOLIANT">Exfoliante</option>
                    <option value="RETINOID">Retinoide</option>
                    <option value="MOISTURIZER">Hidratante</option>
                    <option value="SPF">Protector Solar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D2825]">Fase</label>
                  <select
                    value={selectedPhase}
                    onChange={(e) => setSelectedPhase(parseInt(e.target.value, 10))}
                    className="w-full bg-[#FAFAF7] border border-[#E8E1D7] rounded-xl px-3 py-2 text-xs text-[#2D2825] focus:outline-none focus:ring-2 focus:ring-[#2E7D5B]"
                  >
                    <option value={0}>Rutina AM (Día)</option>
                    <option value={1}>Noche 1 (Exfoliación)</option>
                    <option value={2}>Noche 2 (Retinoides)</option>
                    <option value={3}>Noche 3 (Recuperación)</option>
                    <option value={4}>Noche 4 (Recuperación)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E1D7]">
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#66615C] hover:text-[#2D2825] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!newProductName.trim()}
                className="px-5 py-2 text-xs font-bold bg-[#2E7D5B] hover:bg-[#1B3D32] disabled:opacity-50 text-white rounded-full shadow-xs cursor-pointer transition"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ASISTENTE INTELIGENTE POR CÁMARA (AUTOMATIZACIÓN RUTINA) ================= */}
      {isCameraScannerOpen && (
        <div className="fixed inset-0 z-50 bg-[#2D2825]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E1D7] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E6F4EC] text-[#2E7D5B] flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#2D2825]">
                    Escáner Inteligente de Frasco
                  </h3>
                  <p className="text-[11px] text-[#7E756F]">
                    Apunta la cámara al frasco o etiqueta de tu producto para auto-marcar el paso
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseSmartScanner}
                className="p-1.5 rounded-xl hover:bg-[#FAF8F5] text-[#7E756F] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewfinder Video Stream / Simulation */}
            <div className="relative w-full h-56 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-[#E8E1D7]">
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-white/70 space-y-2">
                  <VideoOff className="w-8 h-8 mx-auto text-white/40" />
                  <p className="text-xs">
                    {cameraError || 'Cámara inactiva'}
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="text-xs text-emerald-400 font-bold hover:underline"
                  >
                    Reintentar conexión de cámara
                  </button>
                </div>
              )}

              {/* Optical Reticle Overlay (DLG-INNOV) */}
              <div className="absolute inset-4 border border-dashed border-white/50 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between text-[10px] text-white/80 font-mono">
                  <span>[VISIÓN CLÍNICA AGY]</span>
                  <span>{isScanningFrame ? 'ANALIZANDO...' : 'ENFOCANDO'}</span>
                </div>
                {isScanningFrame && (
                  <div className="w-full h-0.5 bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,1)]" />
                )}
                <div className="flex justify-between text-[10px] text-white/60 font-mono">
                  <span>RESOLUCIÓN HD</span>
                  <span>AUTOFOCUS</span>
                </div>
              </div>
            </div>

            {/* Quick Product Detection Picker */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider block">
                Tus productos de rutina (Toca para simular o verificar frasco):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {products.map((p, idx) => {
                  const isDone = completedStepIds.has(p.id);
                  const isDetected = detectedRoutineProduct?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleDetectProduct(p)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between text-xs cursor-pointer ${
                        isDetected
                          ? 'bg-[#E6F4EC] border-[#2E7D5B] text-[#1B3D32] font-bold shadow-2xs'
                          : isDone
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                          : 'bg-[#FAFAF7] hover:bg-white border-[#E8E1D7] text-[#2D2825]'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate font-semibold">{p.productName}</div>
                        <div className="text-[10px] text-[#8C827A]">Paso {idx + 1} &bull; {p.category}</div>
                      </div>
                      {isDone && <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smart Detection Prompt & Order Check */}
            {detectedRoutineProduct && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#E6F4EC] to-[#FAF8F5] border border-[#D5E2DB] space-y-3 animate-in fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#2E7D5B] tracking-wider">
                      ¡Frasco Identificado!
                    </span>
                    <h4 className="text-sm font-bold text-[#1B3D32]">
                      {detectedRoutineProduct.productName} (Paso {detectedStepIndex})
                    </h4>
                    <p className="text-xs text-[#2E7D5B]">
                      {detectedRoutineProduct.brand || 'Dermoespecífico'} &bull; {detectedRoutineProduct.category}
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-[#2E7D5B]" />
                </div>

                {/* Pregunta Asistida: ¿Ya hiciste los pasos anteriores? */}
                {missingPreviousSteps.length > 0 && (
                  <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-[#1B3D32] space-y-1">
                    <p className="font-semibold">
                      Los pasos anteriores aún no están marcados hoy:
                    </p>
                    <ul className="list-disc list-inside text-[11px] text-slate-600">
                      {missingPreviousSteps.map((m) => (
                        <li key={m.id}>{m.productName} ({m.category})</li>
                      ))}
                    </ul>
                    <p className="text-[11px] font-bold text-[#2E7D5B] pt-1">
                      ¿Ya aplicaste estos productos antes de este frasco?
                    </p>
                  </div>
                )}

                {/* Alerta de Orden Científico */}
                {scientificOrderNotice && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{scientificOrderNotice}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  {missingPreviousSteps.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleConfirmStepCheck(true)}
                        className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-[#2E7D5B] hover:bg-[#1B3D32] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Sí, marcar anteriores y este</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmStepCheck(false)}
                        className="w-full sm:w-auto py-2.5 px-3 bg-white hover:bg-slate-50 border border-[#E8E1D7] text-[#2D2825] rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Solo este producto
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConfirmStepCheck(false)}
                      className="w-full py-2.5 px-4 bg-[#2E7D5B] hover:bg-[#1B3D32] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Marcar paso como completado</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Success Toast */}
            {scannerSuccessNotice && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{scannerSuccessNotice}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
