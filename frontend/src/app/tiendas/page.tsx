'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Navigation,
  Store,
  DollarSign,
  TrendingDown,
  ShoppingBag,
  ExternalLink,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Compass,
  Search,
  X,
  Package,
} from 'lucide-react';
import {
  fetchNearbyStores,
  fetchOptimizeStoreRoutine,
  fetchPublicStores,
  fetchPublicStoreDetail,
} from '@/lib/api';
import { StoreBranchInfo, RoutineOptimizationResponse } from '@/types/stores';

const StoreInteractiveMap = dynamic(
  () => import('@/components/stores/StoreInteractiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] rounded-3xl bg-slate-100 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span className="text-xs font-medium">Cargando mapa interactivo y rutas...</span>
      </div>
    ),
  }
);

const PRESET_CITIES = [
  { name: 'Valle de la Pascua (Guárico)', lat: 9.2152, lng: -66.0098 },
  { name: 'Caracas (Distrito Capital)', lat: 10.4812, lng: -66.8611 },
  { name: 'Maracay (Aragua)', lat: 10.2541, lng: -67.6012 },
];

export default function TiendasExplorerPage() {
  const [activeTab, setActiveTab] = useState<'map' | 'optimizer' | 'directory'>('map');
  const [selectedCity, setSelectedCity] = useState(PRESET_CITIES[0]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: PRESET_CITIES[0].lat,
    lng: PRESET_CITIES[0].lng,
  });
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [radiusMeters, setRadiusMeters] = useState(15000);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  // Estados de datos
  const [branches, setBranches] = useState<StoreBranchInfo[]>([]);
  const [optimization, setOptimization] = useState<RoutineOptimizationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Estados de Directorio de Tiendas Online & Cadenas
  const [directoryStores, setDirectoryStores] = useState<any[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryCountry, setDirectoryCountry] = useState<string>('ALL');
  const [directorySearch, setDirectorySearch] = useState<string>('');

  // Modal para ver datos de la tienda y sus productos en público
  const [viewingStore, setViewingStore] = useState<any | null>(null);
  const [viewingStoreLoading, setViewingStoreLoading] = useState(false);
  const [viewingStoreProducts, setViewingStoreProducts] = useState<any[]>([]);
  const [viewingStoreSearch, setViewingStoreSearch] = useState('');

  // Cargar datos al cambiar coordenadas o radio
  const loadData = async (lat: number, lng: number, radius: number) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [nearbyRes, optRes] = await Promise.all([
        fetchNearbyStores(lat, lng, radius),
        fetchOptimizeStoreRoutine(lat, lng, radius),
      ]);

      setBranches(nearbyRes.nearby_branches || []);
      setOptimization(optRes);
    } catch (err: any) {
      console.error('Error al cargar datos de tiendas:', err);
      setErrorMsg('No se pudo conectar con el servicio local de tiendas. Asegúrate de que la API REST esté activa en localhost:8000.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDirectoryStores = async () => {
    setDirectoryLoading(true);
    try {
      const res = await fetchPublicStores();
      setDirectoryStores(res.stores || []);
    } catch (err) {
      console.error('Error al cargar directorio de tiendas:', err);
    } finally {
      setDirectoryLoading(false);
    }
  };

  const handleOpenStore = async (store: any) => {
    setViewingStore(store);
    setViewingStoreProducts([]);
    setViewingStoreSearch('');
    setViewingStoreLoading(true);
    try {
      const res = await fetchPublicStoreDetail(store.slug || store.id);
      if (res?.products) {
        setViewingStoreProducts(res.products);
      }
      if (res?.store) {
        setViewingStore(res.store);
      }
    } catch (err) {
      console.error('Error al cargar detalle de tienda:', err);
    } finally {
      setViewingStoreLoading(false);
    }
  };

  useEffect(() => {
    loadData(userCoords.lat, userCoords.lng, radiusMeters);
  }, [userCoords, radiusMeters]);

  useEffect(() => {
    if (activeTab === 'directory' && directoryStores.length === 0) {
      loadDirectoryStores();
    }
  }, [activeTab]);

  // Intentar geolocalización automática al cargar
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsGpsActive(true);
        },
        (err) => {
          console.warn('GPS no otorgado al inicio, usando ciudad referencial:', err.message);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    }
  }, []);

  // Manejador manual de GPS del navegador
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setIsGpsActive(true);
      },
      (err) => {
        console.warn('GPS Denegado o fallido:', err);
        alert('No se pudo obtener tu ubicación precisa. Usaremos la ciudad seleccionada.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCityChange = (city: typeof PRESET_CITIES[0]) => {
    setSelectedCity(city);
    setUserCoords({ lat: city.lat, lng: city.lng });
    setIsGpsActive(false);
  };

  // Generador inteligente de ruta para Google Maps
  const getDirectionsUrl = (destLat: number, destLng: number) => {
    const isSamePoint = Math.abs(userCoords.lat - destLat) < 0.0001 && Math.abs(userCoords.lng - destLng) < 0.0001;
    if (isGpsActive && !isSamePoint) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${destLat},${destLng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
  };

  // Filtrar sucursales
  const filteredBranches = branches.filter((b) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'INDEPENDENT') return b.is_independent;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ENCABEZADO Y CONTROL DE UBICACIÓN */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                Geolocalización & Precios en Tiempo Real
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Directorio Multitienda & Optimizador de Rutina
              </h1>
              <p className="text-sm md:text-base text-slate-600 mt-1 max-w-2xl">
                Compara dónde conseguir los productos de tu rutina de skincare al menor precio o en la tienda física más cercana con disponibilidad confirmada.
              </p>
            </div>

            {/* Controles de Ubicación */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <button
                onClick={handleRequestGps}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  isGpsActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                {isGpsActive ? 'GPS Activo' : 'Usar mi GPS'}
              </button>

              <div className="h-6 w-px bg-slate-300 hidden sm:block" />

              <div className="flex items-center gap-1">
                {PRESET_CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleCityChange(city)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      !isGpsActive && selectedCity.name === city.name
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {city.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selector de Pestañas */}
          <div className="flex items-center justify-between border-t border-slate-100 mt-6 pt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('optimizer')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'optimizer'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Optimizador de Rutina (Mejor Precio)
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'map'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Mapa de Sucursales ({branches.length})
              </button>
              <button
                onClick={() => setActiveTab('directory')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'directory'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <Store className="w-4 h-4" />
                Cadenas & Tiendas Online
              </button>
            </div>

            {/* Radio de Búsqueda */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Radio:</span>
              {[5000, 15000, 30000].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusMeters(r)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    radiusMeters === r ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {r / 1000} km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ALERTA DE ERROR SI EL SERVIDOR LOCAL NO RESPONDE */}
        {errorMsg && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
            <button
              onClick={() => loadData(userCoords.lat, userCoords.lng, radiusMeters)}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Consultando tiendas e inventario en PostgreSQL...</p>
          </div>
        ) : activeTab === 'optimizer' ? (
          /* ============================================================== */
          /* PESTAÑA 1: OPTIMIZADOR DE RUTINA (MEJOR PRECIO VS. CERCANÍA)   */
          /* ============================================================== */
          <div className="space-y-8">
            {/* Tarjeta de Recomendación de Parada Única */}
            {optimization?.recommended_single_trip_store && (
              <div className="bg-linear-to-br from-emerald-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                      Mejor Opción Consolidada (Parada Única)
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {optimization.recommended_single_trip_store.branch.name}
                    </h2>
                    <p className="text-emerald-100/80 text-sm mt-1 max-w-xl">
                      {optimization.recommended_single_trip_store.branch.address}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-emerald-200">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        A solo {optimization.recommended_single_trip_store.branch.distance_meters} metros de ti
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {optimization.recommended_single_trip_store.products_available_count} productos de tu rutina en stock
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 flex flex-col sm:items-end shrink-0">
                    <span className="text-xs text-emerald-200 font-medium">Total Estimado de la Rutina</span>
                    <div className="text-3xl font-extrabold text-white mt-1">
                      ${optimization.recommended_single_trip_store.total_usd.toFixed(2)}{' '}
                      <span className="text-xs font-semibold text-emerald-300">USD</span>
                    </div>
                    <div className="text-xs text-emerald-200/80 mt-0.5">
                      ≈ Bs. {optimization.recommended_single_trip_store.total_ves.toFixed(2)} VES
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      {optimization.recommended_single_trip_store.branch.whatsapp && (
                        <a
                          href={`https://wa.me/${optimization.recommended_single_trip_store.branch.whatsapp.replace(/[^0-9]/g, '')}?text=Hola!%20Vi%20sus%20productos%20en%20Allabout.skin%20y%20quisiera%20consultar%20disponibilidad.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Consultar por WhatsApp
                        </a>
                      )}
                      <Link
                        href={`/en-tienda/${optimization.recommended_single_trip_store.branch.slug}`}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-xs transition"
                      >
                        Ver Anaquel
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Listado Comparativo Producto por Producto */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Comparativa de Productos en tu Rutina ({optimization?.products_comparison.length || 0})
                </h3>
                <span className="text-xs text-slate-500">
                  Precios actualizados automáticamente vía Scraper & Cron
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {optimization?.products_comparison.map((item) => (
                  <div
                    key={item.product_id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            {item.category}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 mt-2">
                            {item.product_name}
                          </h4>
                          {item.brand && (
                            <p className="text-xs text-slate-500 mt-0.5">Marca: {item.brand}</p>
                          )}
                        </div>

                        {item.savings_usd > 0 && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/60 text-xs font-bold shrink-0">
                            <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                            Ahorras ${item.savings_usd.toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Comparación: Más Cercano vs. Mejor Precio */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                        {/* Tienda Más Cercana */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            🏪 Más Cercana
                          </span>
                          {item.closest_store ? (
                            <div className="mt-1">
                              <span className="text-xs font-bold text-slate-800 block truncate">
                                {item.closest_store.store_name}
                              </span>
                              <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-sm font-extrabold text-slate-900">
                                  ${item.closest_store.price_usd.toFixed(2)}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  • {item.closest_store.distance_meters}m
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 mt-1 block">Agotado cerca</span>
                          )}
                        </div>

                        {/* Mejor Precio */}
                        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                            💰 Mejor Precio
                          </span>
                          {item.best_price_store ? (
                            <div className="mt-1">
                              <span className="text-xs font-bold text-emerald-950 block truncate">
                                {item.best_price_store.store_name}
                              </span>
                              <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-sm font-extrabold text-emerald-700">
                                  ${item.best_price_store.price_usd.toFixed(2)}
                                </span>
                                <span className="text-[11px] text-emerald-800/70">
                                  • {item.best_price_store.distance_meters}m
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 mt-1 block">Sin ofertas</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">
                        Disponible en {item.available_stores_count} tiendas
                      </span>
                      {item.best_price_store?.whatsapp && (
                        <a
                          href={`https://wa.me/${item.best_price_store.whatsapp.replace(/[^0-9]/g, '')}?text=Hola!%20Quisiera%20consultar%20precio%20y%20stock%20de%20${encodeURIComponent(item.product_name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          Consultar
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'map' ? (
          /* ============================================================== */
          /* PESTAÑA 2: MAPA Y DIRECTORIO FÍSICO DE SUCURSALES              */
          /* ============================================================== */
          <div className="space-y-6">
            {/* Visualizador del Mapa Interactivo con Trazado de Rutas (DLG-HYBRID) */}
            <StoreInteractiveMap
              userCoords={userCoords}
              branches={filteredBranches}
              radiusMeters={radiusMeters}
              selectedBranchId={selectedBranchId}
              isGpsActive={isGpsActive}
              onSelectBranch={(branch) => setSelectedBranchId(branch.id)}
              onUpdateUserCoords={(coords) => {
                setUserCoords(coords);
                setIsGpsActive(true);
              }}
            />

            {/* Listado Detallado de Sucursales */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Establecimientos Disponibles en la Zona ({filteredBranches.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Ordenadas de la más cercana a la más lejana
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBranches.map((branch, index) => {
                  const isClosest = index === 0;
                  const isSelected = selectedBranchId === branch.id;

                  return (
                    <div
                      key={branch.id}
                      onClick={() => setSelectedBranchId(branch.id)}
                      className={`bg-white rounded-3xl p-6 border transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 shadow-md ring-2 ring-indigo-400/20'
                          : isClosest
                          ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/15'
                          : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {isClosest && (
                          <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/60">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>Opción más cercana a tu ubicación</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {branch.store_name}
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            isClosest
                              ? 'text-emerald-800 bg-emerald-100 font-bold'
                              : 'text-slate-700 bg-slate-100'
                          }`}>
                            {branch.distance_meters !== undefined ? `${branch.distance_meters} metros` : 'En tu zona'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 mt-2">
                          {branch.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {branch.address}
                        </p>
                        {branch.reference_point && (
                          <p className="text-[11px] text-slate-400 mt-0.5 italic">
                            Ref: {branch.reference_point}
                          </p>
                        )}
                        {branch.opening_hours && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-3">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{branch.opening_hours}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100">
                        {branch.whatsapp && (
                          <a
                            href={`https://wa.me/${branch.whatsapp.replace(/[^0-9]/g, '')}?text=Hola!%20Vi%20su%20sucursal%20en%20Allabout.skin.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition shrink-0"
                            title="Contactar por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}

                        <a
                          href={getDirectionsUrl(branch.latitude, branch.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl ${
                            isClosest
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs'
                              : 'bg-slate-900 hover:bg-slate-800 text-white font-semibold'
                          } text-xs transition`}
                          title="Abrir navegación GPS desde mi ubicación actual"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Cómo llegar</span>
                        </a>

                        <Link
                          href={`/en-tienda/${branch.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs text-center transition"
                        >
                          Catálogo
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* PESTAÑA 3: DIRECTORIO DE CADENAS & TIENDAS ONLINE              */
          /* ============================================================== */
          <div className="space-y-6">
            {/* Filtros de País y Búsqueda */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    placeholder="Buscar tienda por nombre (Locatel, Bazar Natural, Farmacia...)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
                <div className="text-xs font-semibold text-slate-500 shrink-0">
                  {directoryStores.length} tiendas registradas
                </div>
              </div>

              {/* Filtro por País */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-400 mr-1">Filtrar por región:</span>
                {[
                  { code: 'ALL', label: 'Todas' },
                  { code: 'VE', label: '🇻🇪 Venezuela' },
                  { code: 'CL', label: '🇨🇱 Chile' },
                  { code: 'MX', label: '🇲🇽 México' },
                  { code: 'CO', label: '🇨🇴 Colombia' },
                  { code: 'US', label: '🇺🇸 Estados Unidos' },
                  { code: 'GLOBAL', label: '🌐 Internacional' },
                ].map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setDirectoryCountry(c.code)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                      directoryCountry === c.code
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Listado de Tiendas en Cards */}
            {directoryLoading ? (
              <div className="py-20 text-center text-slate-400 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs sm:text-sm font-medium">Cargando directorio de comercios y farmacias...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {directoryStores
                  .filter((st) => {
                    if (directoryCountry !== 'ALL' && st.country_code !== directoryCountry) return false;
                    if (!directorySearch.trim()) return true;
                    const q = directorySearch.toLowerCase();
                    return st.name.toLowerCase().includes(q) || (st.slug || '').toLowerCase().includes(q);
                  })
                  .map((st) => (
                    <div
                      key={st.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between gap-4 group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 overflow-hidden font-bold">
                            {st.logo_url ? (
                              <img src={st.logo_url} alt={st.name} className="w-full h-full object-cover" />
                            ) : (
                              <Store className="w-6 h-6" />
                            )}
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                            <span>{st.country_flag || '🌐'}</span>
                            <span>{st.country_name || st.country_code}</span>
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition">
                            {st.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              {st.crawler_platform || st.store_type || 'ONLINE'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {st.in_stock_offers_count || st.total_offers_count || 0} ofertas en catálogo
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleOpenStore(st)}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                          title="Ver inventario y catálogo de productos de esta tienda"
                        >
                          <Package className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ver Productos</span>
                        </button>

                        {st.website_url ? (
                          <a
                            href={st.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                            title="Visitar el sitio web oficial de la tienda"
                          >
                            <span>Ir a la tienda</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-50 text-slate-400 font-medium text-xs cursor-not-allowed text-center"
                          >
                            Solo Física
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL PÚBLICO: PRODUCTOS Y DETALLES DE LA TIENDA */}
        {viewingStore && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 border border-slate-200">
              {/* Header Modal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 font-bold">
                    {viewingStore.logo_url ? (
                      <img src={viewingStore.logo_url} alt={viewingStore.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <Store className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-900">{viewingStore.name}</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                        <span>{viewingStore.country_flag || '🌐'}</span>
                        <span>{viewingStore.country_name || viewingStore.country_code}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {viewingStore.crawler_platform || viewingStore.store_type || 'ONLINE'} &bull; {viewingStoreProducts.length} productos verificados
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {viewingStore.website_url && (
                    <a
                      href={viewingStore.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
                      title="Visitar sitio web oficial"
                    >
                      <span>Ir a la tienda oficial</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => setViewingStore(null)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Búsqueda dentro de la tienda */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={viewingStoreSearch}
                  onChange={(e) => setViewingStoreSearch(e.target.value)}
                  placeholder="Buscar en el catálogo de esta tienda por nombre o marca..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* Productos de la Tienda */}
              {viewingStoreLoading ? (
                <div className="py-16 text-center text-slate-400 space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs font-medium">Cargando productos y precios duales...</p>
                </div>
              ) : viewingStoreProducts.length === 0 ? (
                <div className="py-16 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-2">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">No hay productos registrados en este momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {viewingStoreProducts
                    .filter((offer: any) => {
                      if (!viewingStoreSearch.trim()) return true;
                      const q = viewingStoreSearch.toLowerCase();
                      const prodName = (offer.product?.name || '').toLowerCase();
                      const brandName = (offer.product?.brand?.name || '').toLowerCase();
                      return prodName.includes(q) || brandName.includes(q);
                    })
                    .map((offer: any) => {
                      const product = offer.product;
                      const usdPrice = offer.formatted_price_usd || (offer.price_usd ? `$${Number(offer.price_usd).toFixed(2)} USD` : (offer.price ? `$${Number(offer.price).toFixed(2)} USD` : 'N/D'));
                      const localPrice = offer.formatted_price_local || (offer.price_local ? `${offer.currency_local || ''} ${Number(offer.price_local).toLocaleString('es-ES')}` : null);
                      const targetUrl = offer.product_url || viewingStore.website_url;

                      return (
                        <div
                          key={offer.id}
                          className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:bg-white transition flex flex-col justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {product?.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                                {product?.brand?.name || 'Marca'}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5" title={product?.name}>
                                {product?.name || 'Producto sin nombre'}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 text-sm">{usdPrice}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                  offer.in_stock
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {offer.in_stock ? 'En Stock' : 'Agotado'}
                                </span>
                              </div>
                              {localPrice && (
                                <div className="text-[11px] text-emerald-700 font-semibold">
                                  &asymp; {localPrice}
                                </div>
                              )}
                            </div>

                            {targetUrl && (
                              <a
                                href={targetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition shrink-0 shadow-xs"
                                title="Ir a ver este producto en la tienda oficial"
                              >
                                <span>Ir a la tienda</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setViewingStore(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
