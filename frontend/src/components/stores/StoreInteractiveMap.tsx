'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StoreBranchInfo } from '@/types/stores';
import {
  Navigation,
  Crosshair,
  Store,
  MapPin,
  ArrowRight,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface StoreInteractiveMapProps {
  userCoords: { lat: number; lng: number };
  branches: StoreBranchInfo[];
  radiusMeters: number;
  onSelectBranch?: (branch: StoreBranchInfo) => void;
  selectedBranchId?: number | null;
  isGpsActive?: boolean;
  onUpdateUserCoords?: (coords: { lat: number; lng: number }) => void;
}

type MapLayerType = 'google-roadmap' | 'google-satellite' | 'osm';

export default function StoreInteractiveMap({
  userCoords,
  branches,
  radiusMeters,
  onSelectBranch,
  selectedBranchId,
  isGpsActive = false,
  onUpdateUserCoords,
}: StoreInteractiveMapProps) {
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('google-roadmap');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const validBranches = branches.filter((b) => b.latitude && b.longitude);
  const closestBranch = validBranches.length > 0 ? validBranches[0] : null;

  // Generador inteligente de URL para Google Maps
  // Si no hay GPS activo o el punto origen es casi idéntico al destino,
  // omitir 'origin' hace que Google Maps use la ubicación nativa del dispositivo.
  const getDirectionsUrl = useCallback((destLat: number, destLng: number) => {
    const isSamePoint = Math.abs(userCoords.lat - destLat) < 0.0001 && Math.abs(userCoords.lng - destLng) < 0.0001;
    if (isGpsActive && !isSamePoint) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${destLat},${destLng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
  }, [userCoords, isGpsActive]);

  // Función para obtener la capa de mapa según selección
  const getTileLayer = useCallback((layerType: MapLayerType): L.TileLayer => {
    if (layerType === 'google-roadmap') {
      return L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; Google Maps',
      });
    }

    if (layerType === 'google-satellite') {
      return L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; Google Maps (Satélite)',
      });
    }

    // Fallback: OpenStreetMap Voyager
    return L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    });
  }, []);

  // Inicializar o actualizar el mapa
  useEffect(() => {
    if (!containerRef.current) return;

    // Crear mapa si no existe
    if (!leafletMapRef.current) {
      const map = L.map(containerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      const initialTile = getTileLayer(activeLayer);
      initialTile.addTo(map);
      currentTileLayerRef.current = initialTile;

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      leafletMapRef.current = map;

      // Permitir hacer clic en el mapa para ajustar la ubicación del usuario
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onUpdateUserCoords) {
          onUpdateUserCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });
    } else {
      // Si cambia el tipo de capa (Calles vs Satélite)
      if (currentTileLayerRef.current) {
        leafletMapRef.current.removeLayer(currentTileLayerRef.current);
      }
      const newTile = getTileLayer(activeLayer);
      newTile.addTo(leafletMapRef.current);
      currentTileLayerRef.current = newTile;
    }

    const map = leafletMapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Limpiar marcadores y rutas anteriores
    markersGroup.clearLayers();
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // 1. Marcador de Usuario (Radar GPS arrastrable - DLG-HYBRID Momento Wow 1)
    const userHtml = `
      <div class="relative flex items-center justify-center cursor-grab active:cursor-grabbing">
        <span class="absolute w-8 h-8 rounded-full bg-emerald-500/35 animate-ping"></span>
        <span class="relative w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-lg ring-2 ring-emerald-400/40"></span>
      </div>
    `;
    const userMarker = L.marker([userCoords.lat, userCoords.lng], {
      icon: L.divIcon({
        html: userHtml,
        className: 'custom-user-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
      title: 'Tu Ubicación Actual (Arrastra para ajustar)',
      draggable: true,
    }).bindPopup(`
      <div class="p-1.5 font-sans">
        <div class="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
          <span>📍</span> ${isGpsActive ? 'Tu Ubicación GPS (Activa)' : 'Ubicación Referencial'}
        </div>
        <div class="text-[11px] text-slate-500 mt-0.5">
          ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}
        </div>
        <p class="text-[10px] text-emerald-700 mt-1 font-medium">
          💡 Puedes arrastrar este punto o hacer clic en el mapa para ajustar tu posición.
        </p>
      </div>
    `);

    userMarker.on('dragend', (e) => {
      const marker = e.target as L.Marker;
      const pos = marker.getLatLng();
      if (onUpdateUserCoords) {
        onUpdateUserCoords({ lat: pos.lat, lng: pos.lng });
      }
    });

    markersGroup.addLayer(userMarker);

    // 2. Marcadores de Tiendas
    validBranches.forEach((branch) => {
      const isClosest = closestBranch && branch.id === closestBranch.id;
      const isSelected = selectedBranchId === branch.id;
      const directionsUrl = getDirectionsUrl(branch.latitude, branch.longitude);

      // Icono con insignia destacada para la más cercana (DLG-HYBRID Momento Wow 2)
      const markerHtml = isClosest
        ? `
          <div class="relative flex flex-col items-center group cursor-pointer">
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[9.5px] font-black shadow-md -mb-1.5 z-20 whitespace-nowrap animate-bounce border border-emerald-400">
              ★ MÁS CERCANA (${branch.distance_meters !== undefined ? `${branch.distance_meters}m` : 'Cerca'})
            </span>
            <div class="w-9 h-9 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-emerald-400/40">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
            </div>
          </div>
        `
        : `
          <div class="w-7 h-7 rounded-full ${isSelected ? 'bg-indigo-600 ring-4 ring-indigo-400/40' : 'bg-slate-900'} border-2 border-white shadow-md flex items-center justify-center text-white cursor-pointer hover:scale-110 transition">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
          </div>
        `;

      const branchMarker = L.marker([branch.latitude, branch.longitude], {
        icon: L.divIcon({
          html: markerHtml,
          className: 'custom-store-marker',
          iconSize: isClosest ? [150, 52] : [28, 28],
          iconAnchor: isClosest ? [75, 46] : [14, 14],
        }),
        title: branch.name,
      }).bindPopup(`
        <div class="p-3 text-slate-800 font-sans max-w-[260px]">
          <div class="flex items-center justify-between gap-1.5 mb-1.5">
            <span class="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              ${branch.distance_meters !== undefined ? `${branch.distance_meters}m` : 'En tu zona'}
            </span>
            ${isClosest ? '<span class="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">★ Más cercana</span>' : ''}
          </div>
          <h4 class="font-bold text-xs text-slate-900 leading-tight">${branch.name}</h4>
          <p class="text-[11px] text-slate-600 mt-1 leading-snug">${branch.address}</p>
          ${branch.reference_point ? `<p class="text-[10px] text-slate-400 italic mt-0.5">Ref: ${branch.reference_point}</p>` : ''}
          <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
            <a 
              href="${directionsUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="flex-1 py-2 px-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] text-center shadow-xs transition inline-flex items-center justify-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              Cómo llegar ↗
            </a>
            <a 
              href="/en-tienda/${branch.slug}" 
              class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] text-center transition"
            >
              Catálogo
            </a>
          </div>
        </div>
      `);

      branchMarker.on('click', () => {
        if (onSelectBranch) onSelectBranch(branch);
      });

      markersGroup.addLayer(branchMarker);
    });

    // 3. Trazado visual hacia la más cercana (DLG-HYBRID Momento Wow 3)
    if (closestBranch) {
      const line = L.polyline(
        [
          [userCoords.lat, userCoords.lng],
          [closestBranch.latitude, closestBranch.longitude],
        ],
        {
          color: '#059669',
          weight: 3.5,
          dashArray: '6, 8',
          opacity: 0.85,
        }
      ).addTo(map);
      polylineRef.current = line;
    }

    // Ajustar encuadre
    const allCoords: [number, number][] = [
      [userCoords.lat, userCoords.lng],
      ...validBranches.map((b) => [b.latitude, b.longitude] as [number, number]),
    ];
    if (allCoords.length > 1) {
      map.fitBounds(L.latLngBounds(allCoords), { padding: [55, 55], maxZoom: 16 });
    }
  }, [userCoords, validBranches, closestBranch, selectedBranchId, activeLayer, getTileLayer, onSelectBranch, onUpdateUserCoords, getDirectionsUrl, isGpsActive]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Controles del Mapa
  const handleCenterUser = () => {
    if (!leafletMapRef.current) return;
    leafletMapRef.current.flyTo([userCoords.lat, userCoords.lng], 16, { duration: 1.2 });
  };

  const handleFocusClosest = () => {
    if (!closestBranch || !leafletMapRef.current) return;
    leafletMapRef.current.flyTo([closestBranch.latitude, closestBranch.longitude], 16.5, { duration: 1.2 });
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-white">
      {/* Encabezado con selector de capas de Google Maps */}
      <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                Mapa Clínico de Sucursales
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {validBranches.length} sucursales activas
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {activeLayer === 'google-roadmap' && 'Google Maps Calles (Precisión verificada en Valle de la Pascua)'}
              {activeLayer === 'google-satellite' && 'Google Maps Satélite Híbrido'}
              {activeLayer === 'osm' && 'OpenStreetMap'}
            </p>
          </div>
        </div>

        {/* Acciones y selector de capa */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Selector de Capas */}
          <div className="flex items-center bg-white/10 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveLayer('google-roadmap')}
              type="button"
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                activeLayer === 'google-roadmap'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Google Calles
            </button>
            <button
              onClick={() => setActiveLayer('google-satellite')}
              type="button"
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                activeLayer === 'google-satellite'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Google Satélite
            </button>
            <button
              onClick={() => setActiveLayer('osm')}
              type="button"
              className={`px-2 py-1 rounded-lg font-medium text-[11px] transition ${
                activeLayer === 'osm'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              OSM
            </button>
          </div>

          <button
            onClick={handleCenterUser}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
            title="Centrar en mi ubicación GPS"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mi GPS</span>
          </button>

          {closestBranch && (
            <button
              onClick={handleFocusClosest}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
              title="Enfocar la más cercana"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Más Cercana ({closestBranch.distance_meters !== undefined ? `${closestBranch.distance_meters}m` : ''})</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de ayuda interactiva */}
      <div className="px-4 py-2 bg-emerald-50/90 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>
            {isGpsActive 
              ? '🟢 GPS de alta precisión activo. Las rutas se calculan desde tu punto exacto.'
              : '📍 Modo referencial: Puedes hacer clic en el mapa o arrastrar el punto verde para indicar dónde estás exactamente.'}
          </span>
        </div>
      </div>

      {/* Contenedor del Mapa */}
      <div
        ref={containerRef}
        className="w-full h-[450px] sm:h-[520px] z-0 focus:outline-none"
        style={{ background: '#f8fafc' }}
      />

      {/* Tarjeta inferior fija con la sucursal más cercana */}
      {closestBranch && (
        <div className="p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900">
                  {closestBranch.name}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {closestBranch.distance_meters !== undefined ? `A solo ${closestBranch.distance_meters} metros` : 'En tu zona'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {closestBranch.address} {closestBranch.reference_point ? `(${closestBranch.reference_point})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <a
              href={getDirectionsUrl(closestBranch.latitude, closestBranch.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Cómo llegar desde mi ubicación</span>
            </a>

            <Link
              href={`/en-tienda/${closestBranch.slug}`}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
            >
              <span>Ver Anaquel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
