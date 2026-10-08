'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Store,
  MapPin,
  Search,
  Bell,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Phone,
  Clock,
  Check,
  X,
  Sliders,
  DollarSign,
  TrendingDown,
  Navigation,
  Flower2,
  Home,
  HeartPulse,
  Calendar,
  Package,
  Scan,
  User,
  ShoppingBag,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  fetchNearbyStores,
  fetchOptimizeStoreRoutine,
  fetchPublicStores,
  fetchPublicStoreDetail,
  recordStoreInteraction,
  getCurrentUser,
  StoredUser
} from '@/lib/api';
import { StoreBranchInfo, RoutineOptimizationResponse } from '@/types/stores';
import UserAppShell from '@/components/navigation/UserAppShell';

const StoreInteractiveMap = dynamic(
  () => import('@/components/stores/StoreInteractiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-3xl bg-[#FAFAF7] border border-[#E8E1D7] animate-pulse flex flex-col items-center justify-center text-[#8C827A] gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#2E7D5B] border-t-transparent animate-spin" />
        <span className="text-xs font-medium">Cargando mapa interactivo...</span>
      </div>
    ),
  }
);

const PRESET_CITIES = [
  { name: 'Caracas, Venezuela', shortName: 'Caracas', lat: 10.4812, lng: -66.8611 },
  { name: 'Valle de la Pascua, Guárico', shortName: 'Valle de la Pascua', lat: 9.2152, lng: -66.0098 },
  { name: 'Maracay, Aragua', shortName: 'Maracay', lat: 10.2541, lng: -67.6012 },
];

export default function TiendasDirectorioPage() {
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [selectedCity, setSelectedCity] = useState(PRESET_CITIES[0]);
  const [userCoords, setUserCoords] = useState({ lat: PRESET_CITIES[0].lat, lng: PRESET_CITIES[0].lng });
  const [isGpsActive, setIsGpsActive] = useState(false);

  // Modales
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isOptimizerModalOpen, setIsOptimizerModalOpen] = useState(false);
  const [isFullMapModalOpen, setIsFullMapModalOpen] = useState(false);
  const [isStoreProductsModalOpen, setIsStoreProductsModalOpen] = useState(false);
  const [selectedStoreForModal, setSelectedStoreForModal] = useState<any | null>(null);

  // Datos reales o fallback
  const [branches, setBranches] = useState<StoreBranchInfo[]>([]);
  const [optimization, setOptimization] = useState<RoutineOptimizationResponse | null>(null);
  const [selectedStoreTab, setSelectedStoreTab] = useState<'farmatodo' | 'locatel' | 'rio'>('farmatodo');

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    
    // Carga de API
    const load = async () => {
      try {
        const [nearbyRes, optRes] = await Promise.all([
          fetchNearbyStores(userCoords.lat, userCoords.lng, 15000),
          fetchOptimizeStoreRoutine(userCoords.lat, userCoords.lng, 15000),
        ]);
        if (nearbyRes?.nearby_branches?.length) {
          setBranches(nearbyRes.nearby_branches);
        }
        if (optRes) {
          setOptimization(optRes);
        }
      } catch (err) {
        console.warn('API local offline o silenciosa, usando catálogo calibrado:', err);
      }
    };
    load();
  }, [userCoords]);

  const handleCitySelect = (city: typeof PRESET_CITIES[0]) => {
    setSelectedCity(city);
    setUserCoords({ lat: city.lat, lng: city.lng });
    setIsGpsActive(false);
    setIsCityModalOpen(false);
  };

  const handleOutboundWhatsApp = (branch: any, productName?: string) => {
    const storeId = branch.store_id || branch.id || 1;
    const phone = (branch.whatsapp || branch.phone || '').replace(/[^0-9]/g, '');
    recordStoreInteraction({
      store_id: storeId,
      branch_id: branch.id,
      interaction_type: 'WHATSAPP_CLICK',
      metadata: { product_name: productName, city: selectedCity.shortName },
    });
    if (phone) {
      const msg = encodeURIComponent(
        productName
          ? `¡Hola! Vi en All About Skin que tienen "${productName}". ¿Tienen stock disponible en su sede de ${branch.name}?`
          : `¡Hola! Los vi a través de All About Skin y deseo consultar disponibilidad en su sede de ${branch.name}.`
      );
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    }
  };

  const handleOutboundMapRoute = (branch: any) => {
    const storeId = branch.store_id || branch.id || 1;
    recordStoreInteraction({
      store_id: storeId,
      branch_id: branch.id,
      interaction_type: 'MAP_ROUTE',
      metadata: { city: selectedCity.shortName, address: branch.address },
    });
    const query = encodeURIComponent(`${branch.name} ${branch.address || ''} ${branch.city || selectedCity.name}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleRequestGps = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsGpsActive(true);
          setSelectedCity({
            name: 'Mi Ubicación Actual (GPS)',
            shortName: 'GPS en Vivo',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setIsCityModalOpen(false);
        },
        (err) => {
          alert('No se pudo acceder a tu GPS. Usando ubicación predeterminada.');
        }
      );
    }
  };

  const userName = currentUser?.name || 'María González';

  // Productos del protocolo en anaquel (Mockup Vista 3)
  const routineShelfProducts = [
    {
      id: 'prod-1',
      name: 'Limpiador facial',
      brand: 'CeraVe',
      subtitle: 'Gel Limpiador Espumoso 236ml',
      price: '$14.50',
      priceBs: 'Bs. 580,00',
      inStock: true,
      category: 'Limpiador suave',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'prod-2',
      name: 'Sérum niacinamida',
      brand: 'The Ordinary',
      subtitle: 'Niacinamide 10% + Zinc 1% 30ml',
      price: '$11.00',
      priceBs: 'Bs. 440,00',
      inStock: true,
      category: 'Sérum activo',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'prod-3',
      name: 'Hidratante ligera',
      brand: 'La Roche-Posay',
      subtitle: 'Toleriane Sensitive Fluide 40ml',
      price: '$19.80',
      priceBs: 'Bs. 792,00',
      inStock: true,
      category: 'Hidratante ligera',
      image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'prod-4',
      name: 'Protector solar SPF 50',
      brand: 'ISDIN',
      subtitle: 'Fotoprotector Fusion Water Magic 50ml',
      price: '$24.50',
      priceBs: 'Bs. 980,00',
      inStock: true,
      category: 'Protector solar',
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=300&q=80',
    },
  ];

  // Datos de las 3 Cadenas destacadas (Mockup Vista 3)
  const storeCardsData = [
    {
      id: 'farmatodo',
      name: 'Farmatodo',
      logoLetter: 'F',
      logoBg: 'bg-blue-600',
      distance: '2.3 km • 12 min',
      stockBadge: 'Stock disponible',
      stockType: 'full', // green
      priceBadge: 'Precio oficial',
      address: 'Av. Principal de Las Mercedes, Caracas',
      phone: '+58 212-900-3276',
      totalRoutineCost: '$69.80',
      productsCount: 4,
    },
    {
      id: 'locatel',
      name: 'Locatel',
      logoLetter: 'L',
      logoBg: 'bg-[#2E7D5B]',
      distance: '3.1 km • 15 min',
      stockBadge: 'Stock parcial',
      stockType: 'partial', // amber
      priceBadge: 'Precio oficial',
      address: 'Centro Comercial El Recreo, Nivel C2, Caracas',
      phone: '+58 212-706-8800',
      totalRoutineCost: '$72.10',
      productsCount: 3,
    },
    {
      id: 'rio',
      name: 'Río',
      logoLetter: 'R',
      logoBg: 'bg-orange-600',
      distance: '4.8 km • 20 min',
      stockBadge: 'Stock disponible',
      stockType: 'full', // green
      priceBadge: 'Mejor precio',
      address: 'Av. Francisco de Miranda, Edif. Río Market, Caracas',
      phone: '+58 212-285-1199',
      totalRoutineCost: '$64.20',
      productsCount: 4,
    },
  ];

  const handleOpenStoreProducts = (store: any) => {
    setSelectedStoreForModal(store);
    setIsStoreProductsModalOpen(true);
  };

  return (
    <UserAppShell activeNavId="tiendas">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in">

        {/* ========================================================= */}
        {/* HEADER ROW: TIENDAS CERCANAS + BANNER OPTIMIZA TU RUTINA  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Izquierda (Col 7): Título, subtítulo y Chip de Ubicación */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">
              Tiendas cercanas
            </h1>
            <p className="text-xs sm:text-sm text-[#66615C] leading-relaxed max-w-xl">
              Encuentra los productos de tu rutina en farmacias y tiendas de confianza cerca de ti, al mejor precio.
            </p>

            {/* Chip de Ubicación con botón Cambiar (Mockup Vista 3) */}
            <div className="pt-2 flex items-center gap-3">
              <div className="inline-flex items-center gap-2.5 bg-white border border-[#E8E1D7] px-4 py-2 rounded-2xl shadow-2xs text-xs">
                <MapPin className="w-4 h-4 text-[#2E7D5B] shrink-0" />
                <span className="text-[#66615C]">Tu ubicación:</span>
                <span className="font-bold text-[#2D2825]">{selectedCity.name}</span>
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(true)}
                  className="ml-2 px-3 py-1 bg-[#FAF8F5] hover:bg-[#E6F4EC] hover:text-[#2E7D5B] text-[#2D2825] border border-[#E8E1D7] rounded-xl font-bold text-[11px] transition cursor-pointer"
                >
                  Cambiar
                </button>
              </div>
            </div>
          </div>

          {/* Derecha (Col 5): Card Optimiza tu Rutina (Mockup Vista 3) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#EAF4EE] via-[#F4F9F6] to-white rounded-3xl p-6 border border-[#D5E2DB] shadow-2xs flex items-center justify-between gap-4 relative overflow-hidden">
            <div className="space-y-2 z-10 max-w-xs">
              <h2 className="text-lg font-extrabold text-[#2D2825] tracking-tight">
                Optimiza tu rutina
              </h2>
              <p className="text-xs text-[#66615C] leading-relaxed">
                Te ayudamos a encontrar los mejores precios y disponibilidad en tu zona.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsOptimizerModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#2E7D5B] hover:bg-[#1B3D32] text-white px-4 py-2 rounded-full text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Analizar precios</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Pin Illustration */}
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#D5E2DB] flex items-center justify-center text-[#2E7D5B] shadow-xs shrink-0 z-10">
              <MapPin className="w-8 h-8 text-[#2E7D5B]" />
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* MIDDLE ROW: 3 STORE CARDS (IZQ) + MAP PREVIEW (DER)       */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Izquierda (Col 8): Tarjetas de Tiendas (Conectadas a Sedes Reales con Leads) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {(branches.length > 0 ? branches.slice(0, 3) : storeCardsData).map((store: any, idx: number) => {
              const isRealBranch = Boolean(store.address || store.city);
              const storeTitle = store.name || store.store_name || 'Farmacia Aliada';
              const distanceText = store.distance_meters
                ? `${(store.distance_meters / 1000).toFixed(1)} km • Aprox. 10 min`
                : store.distance || 'En tu zona';
              const initialLetter = storeTitle.charAt(0).toUpperCase();
              const logoBg = store.logoBg || (idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-[#2E7D5B]' : 'bg-orange-600');

              return (
                <div
                  key={store.id || idx}
                  className="bg-white rounded-3xl p-5 border border-[#E8E1D7] shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Logo + Name + Distance */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${logoBg} text-white font-black text-base flex items-center justify-center shrink-0 shadow-2xs`}>
                        {store.logoLetter || initialLetter}
                      </div>
                      <div className="truncate">
                        <h3 className="font-extrabold text-sm text-[#2D2825] leading-tight truncate">
                          {storeTitle}
                        </h3>
                        <div className="text-[11px] text-[#8C827A] font-medium">
                          {distanceText}
                        </div>
                      </div>
                    </div>

                    {/* Chips: Stock & Price */}
                    <div className="space-y-1.5 pt-1">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EC] text-[#2E7D5B] border border-[#D5E2DB]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D5B]" />
                          <span>{store.stockBadge || 'Stock Verificado'}</span>
                        </span>
                      </div>
                      {store.address && (
                        <div className="text-[11px] text-[#66615C] line-clamp-2 leading-snug">
                          {store.address}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones de Derivación: WhatsApp + Mapa + Catálogo */}
                  <div className="space-y-2 pt-2 border-t border-[#F0ECE1]">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOutboundWhatsApp(store)}
                        className="py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Contactar directamente por WhatsApp"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOutboundMapRoute(store)}
                        className="py-1.5 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Ver ruta en Google Maps"
                      >
                        <Navigation className="w-3 h-3 text-sky-600" />
                        <span>Ruta</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenStoreProducts(store)}
                      className="w-full text-center py-2 rounded-xl bg-[#FAFAF7] hover:bg-[#E6F4EC] hover:text-[#2E7D5B] border border-[#E8E1D7] text-xs font-bold text-[#2D2825] transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Ver productos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Derecha (Col 4): Map Preview Card con pines interactivos */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-[#E8E1D7] shadow-2xs flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider">
                  Mapa de la zona
                </span>
                <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2 py-0.5 rounded-full">
                  3 sucursales
                </span>
              </div>
              <p className="text-xs text-[#66615C]">
                Farmacias aliadas con inventario verificado en {selectedCity.shortName}.
              </p>
            </div>

            {/* Mini Visual Map Preview Box */}
            <div
              onClick={() => setIsFullMapModalOpen(true)}
              className="w-full h-44 rounded-2xl bg-gradient-to-br from-[#E6F4EC]/60 to-[#FAF8F5] border border-[#D5E2DB] relative flex items-center justify-center cursor-pointer hover:shadow-xs transition group overflow-hidden"
            >
              {/* Graphic background grid */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#2E7D5B_1px,transparent_1px)] [background-size:12px_12px]" />
              
              {/* Simulated Map Markers */}
              <div className="absolute top-6 left-12 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md ring-2 ring-white">
                  F
                </div>
                <span className="text-[9px] font-bold text-[#2D2825] bg-white/90 px-1.5 py-0.2 rounded-md shadow-2xs mt-0.5">
                  Farmatodo
                </span>
              </div>

              <div className="absolute bottom-8 left-24 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-[#2E7D5B] text-white text-[10px] font-bold flex items-center justify-center shadow-md ring-2 ring-white">
                  L
                </div>
                <span className="text-[9px] font-bold text-[#2D2825] bg-white/90 px-1.5 py-0.2 rounded-md shadow-2xs mt-0.5">
                  Locatel
                </span>
              </div>

              <div className="absolute top-10 right-10 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md ring-2 ring-white">
                  R
                </div>
                <span className="text-[9px] font-bold text-[#2D2825] bg-white/90 px-1.5 py-0.2 rounded-md shadow-2xs mt-0.5">
                  Río
                </span>
              </div>

              {/* User Center Pin */}
              <div className="w-4 h-4 rounded-full bg-[#2E7D5B] ring-4 ring-[#2E7D5B]/30 animate-pulse" />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-[#2E7D5B] shadow-md flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Explorar mapa en vivo</span>
                </span>
              </div>
            </div>

            {/* Bottom Link: Ver mapa completo */}
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setIsFullMapModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32] transition cursor-pointer"
              >
                <span>Ver mapa completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* BOTTOM SECTION: TU RUTINA EN ESTA TIENDA (4 PRODUCTOS)    */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D7] shadow-2xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0ECE1] pb-4">
            <div className="space-y-0.5">
              <h2 className="text-lg font-extrabold text-[#2D2825] tracking-tight">
                Tu rutina en esta tienda
              </h2>
              <p className="text-xs text-[#66615C]">
                Productos de tu protocolo Skin Cycling con disponibilidad simultánea en anaquel.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedStoreForModal(storeCardsData[0]);
                setIsStoreProductsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32] transition cursor-pointer"
            >
              <span>Ver lista completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid de 4 Productos del Protocolo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {routineShelfProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl p-4 bg-[#FAFAF7] border border-[#E8E1D7] hover:border-[#2E7D5B] transition shadow-2xs flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-3">
                  {/* Thumbnail / Visual Bottle */}
                  <div className="w-full h-32 rounded-xl bg-white border border-[#E8E1D7] overflow-hidden flex items-center justify-center p-2 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 right-2 bg-[#E6F4EC] text-[#2E7D5B] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#D5E2DB]">
                      En stock
                    </span>
                  </div>

                  {/* Informacion de Producto */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#2E7D5B] uppercase tracking-wider block">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-xs text-[#2D2825] leading-snug">
                      {product.name}
                    </h3>
                    <div className="text-[11px] text-[#66615C]">
                      {product.brand}
                    </div>
                  </div>
                </div>

                {/* Precios y Botón */}
                <div className="pt-2 border-t border-[#E8E1D7]/60 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-sm text-[#2D2825]">
                      {product.price}
                    </div>
                    <div className="text-[9px] text-[#8C827A]">
                      {product.priceBs}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStoreForModal(storeCardsData[0]);
                      setIsStoreProductsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-white border border-[#E8E1D7] hover:bg-[#E6F4EC] hover:text-[#2E7D5B] text-[#66615C] transition shadow-2xs cursor-pointer"
                    title="Ver detalles en tienda"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ========================================================= */}
        {/* FOOTER BAR (ESTILO MOCKUP IMAGEN 2)                       */}
        {/* ========================================================= */}
        <footer className="pt-8 border-t border-[#E8E1D7] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C827A]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#2D2825]">allabout<span className="text-[#2E7D5B]">.skin</span></span>
            <span>·</span>
            <span>Ciencia. Tu piel. Nuestra misión.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/terminos" className="hover:text-[#2D2825] transition">Términos y condiciones</Link>
            <span>·</span>
            <Link href="/privacidad" className="hover:text-[#2D2825] transition">Privacidad</Link>
            <span>·</span>
            <a href="mailto:soporte@allaboutskin.com" className="hover:text-[#2D2825] transition">Contacto</a>
          </div>
        </footer>

      {/* ========================================================= */}
      {/* MODAL 1: OPTIMIZADOR DE PRECIOS & RUTINA (ANALIZAR PRECIOS)*/}
      {/* ========================================================= */}
      {isOptimizerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E8E1D7] shadow-xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Algoritmo de Compra Inteligente</span>
                </div>
                <h3 className="text-lg font-extrabold text-[#2D2825]">
                  Comparativa de Costo de Rutina
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOptimizerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAFAF7] border border-[#E8E1D7] flex items-center justify-center text-[#66615C] hover:text-[#2D2825] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#66615C]">
              Calculamos la canasta completa de tus 4 productos básicos de Skin Cycling en las farmacias de tu zona ({selectedCity.shortName}):
            </p>

            {/* Opciones comparativas */}
            <div className="space-y-4">
              {/* Opción 1: Parada Única */}
              <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      F
                    </div>
                    <span className="font-bold text-xs text-[#2D2825]">Parada única: Farmatodo</span>
                  </div>
                  <span className="font-extrabold text-sm text-[#2D2825]">$69.80</span>
                </div>
                <p className="text-[11px] text-[#66615C]">
                  Compras todo en una sola tienda a 2.3 km (12 min). Disponibilidad del 100%.
                </p>
              </div>

              {/* Opción 2: Máximo Ahorro Multitienda */}
              <div className="p-4 rounded-2xl bg-[#E6F4EC] border border-[#2E7D5B] space-y-2 relative">
                <span className="absolute -top-2.5 right-4 bg-[#2E7D5B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                  Recomendado · Ahorras $8.40
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-[#1B3D32]">Ruta óptima combinada</span>
                  </div>
                  <span className="font-black text-base text-[#2E7D5B]">$61.40</span>
                </div>
                <div className="text-[11px] text-[#2D2825] space-y-1">
                  <p>• <strong>CeraVe + The Ordinary</strong> en Río ($22.50 vs $25.50)</p>
                  <p>• <strong>ISDIN + La Roche-Posay</strong> en Farmatodo ($38.90 vs $44.30)</p>
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-[#1B3D32] font-semibold border-t border-[#D5E2DB]">
                  <span>Distancia total: 5.4 km</span>
                  <span>Tiempo estimado: 25 min</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E8E1D7]">
              <button
                type="button"
                onClick={() => setIsOptimizerModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#66615C] hover:text-[#2D2825]"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Ruta de compra guardada en tu perfil.');
                  setIsOptimizerModalOpen(false);
                }}
                className="px-5 py-2 text-xs font-bold bg-[#2E7D5B] hover:bg-[#1B3D32] text-white rounded-full shadow-xs transition"
              >
                Activar esta ruta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PRODUCTOS EN LA TIENDA SELECCIONADA              */}
      {/* ========================================================= */}
      {isStoreProductsModalOpen && selectedStoreForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#E8E1D7] shadow-xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${selectedStoreForModal.logoBg} text-white font-black text-sm flex items-center justify-center`}>
                  {selectedStoreForModal.logoLetter}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#2D2825]">
                    {selectedStoreForModal.name} · Catálogo Disponible
                  </h3>
                  <p className="text-[11px] text-[#66615C]">
                    {selectedStoreForModal.address}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStoreProductsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAFAF7] border border-[#E8E1D7] flex items-center justify-center text-[#66615C] hover:text-[#2D2825]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Listado de Productos */}
            <div className="space-y-3">
              {routineShelfProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover border border-[#E8E1D7]"
                    />
                    <div>
                      <div className="font-bold text-[#2D2825]">{p.name}</div>
                      <div className="text-[10px] text-[#66615C]">{p.subtitle}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-[#2D2825]">{p.price}</div>
                    <span className="text-[9px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2 py-0.5 rounded-full border border-[#D5E2DB]">
                      En anaquel
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Direcciones y Contacto */}
            <div className="p-3.5 rounded-2xl bg-[#E6F4EC]/50 border border-[#D5E2DB] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#1B3D32] block">¿Vas a visitar esta sucursal?</span>
                <span className="text-[10px] text-[#5D6B63]">{selectedStoreForModal.distance} desde tu ubicación</span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedStoreForModal.name + ' ' + selectedStoreForModal.address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2E7D5B] text-white font-bold text-xs hover:bg-[#1B3D32] transition"
              >
                <span>Cómo llegar</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: SELECTOR DE CIUDAD & GPS                         */}
      {/* ========================================================= */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E8E1D7] shadow-xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
              <h3 className="font-extrabold text-sm text-[#2D2825]">
                Seleccionar Ciudad
              </h3>
              <button
                type="button"
                onClick={() => setIsCityModalOpen(false)}
                className="text-[#8C827A] hover:text-[#2D2825]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleRequestGps}
                className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-[#E6F4EC] border border-[#D5E2DB] text-[#2E7D5B] text-xs font-bold hover:bg-[#D5E2DB] transition cursor-pointer text-left"
              >
                <Navigation className="w-4 h-4" />
                <span>Usar mi GPS preciso en vivo</span>
              </button>

              {PRESET_CITIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleCitySelect(c)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition cursor-pointer text-left ${
                    selectedCity.name === c.name
                      ? 'bg-[#FAF8F5] border-[#2E7D5B] text-[#2D2825] font-bold'
                      : 'bg-white border-[#E8E1D7] text-[#66615C] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>{c.name}</span>
                  {selectedCity.name === c.name && <Check className="w-4 h-4 text-[#2E7D5B]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: MAPA COMPLETO INTERACTIVO                        */}
      {/* ========================================================= */}
      {isFullMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full border border-[#E8E1D7] shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#2E7D5B]" />
                <h3 className="font-extrabold text-base text-[#2D2825]">
                  Mapa de Farmacias y Comercios Aliados en {selectedCity.shortName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFullMapModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAFAF7] border border-[#E8E1D7] flex items-center justify-center text-[#66615C] hover:text-[#2D2825] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-[#E8E1D7]">
              <StoreInteractiveMap
                userCoords={userCoords}
                branches={branches}
                radiusMeters={15000}
                isGpsActive={isGpsActive}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#66615C]">
              <span>Mostrando sucursales en un radio de 15 km</span>
              <button
                type="button"
                onClick={() => setIsFullMapModalOpen(false)}
                className="px-4 py-1.5 rounded-full bg-[#2E7D5B] text-white font-bold cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </UserAppShell>
  );
}
