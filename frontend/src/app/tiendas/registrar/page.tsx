'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  MapPin,
  Compass,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  Phone,
  AtSign,
  Mail,
  Building2,
  Sparkles,
} from 'lucide-react';
import { StoreSuggestionInput } from '@/types/stores';

export default function RegisterStorePage() {
  const [formData, setFormData] = useState<StoreSuggestionInput>({
    store_name: '',
    category: 'PHARMACY',
    state: 'Guárico',
    city: 'Valle de la Pascua',
    address: '',
    reference_point: '',
    latitude: 9.215,
    longitude: -66.01,
    phone: '',
    whatsapp: '',
    instagram_handle: '',
    submitted_by_email: '',
    notes: '',
  });

  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [locationSuccess, setLocationSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización GPS.');
      return;
    }

    setIsGettingLocation(true);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
        }));
        setIsGettingLocation(false);
        setLocationSuccess(true);
      },
      (err) => {
        setIsGettingLocation(false);
        alert('No se pudo obtener la ubicación: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/stores/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitSuccess(true);
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || 'Error al registrar el establecimiento.');
      }
    } catch {
      setErrorMessage('Error de conexión al enviar los datos. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2825] px-4 py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#2D2825] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm">
        {submitSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#2D2825]">
              ¡Establecimiento Registrado con Éxito!
            </h2>

            <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Hemos recibido la información de <strong>{formData.store_name}</strong> en {formData.city}, {formData.state}.
              Nuestro equipo verificará las coordenadas y el catálogo para activarlo en el <strong>Modo En Tienda</strong>.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-[#2D2825] text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                Volver a la plataforma
              </Link>
              <button
                onClick={() => {
                  setSubmitSuccess(false);
                  setFormData({
                    store_name: '',
                    category: 'PHARMACY',
                    state: 'Guárico',
                    city: 'Valle de la Pascua',
                    address: '',
                    reference_point: '',
                    latitude: 9.215,
                    longitude: -66.01,
                    phone: '',
                    whatsapp: '',
                    instagram_handle: '',
                    submitted_by_email: '',
                    notes: '',
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition-colors"
              >
                Registrar otro comercio
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-stone-150 pb-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#526B5D] uppercase tracking-wider mb-1">
                <Store className="w-4 h-4" />
                <span>Directorio de Comercios de Venezuela</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#2D2825]">
                Registrar Comercio o Tienda Independiente
              </h1>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Permite que los usuarios de tu ciudad descubran los productos de skincare de tu anaquel evaluados científicamente al visitar tu tienda física.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Datos Generales */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                1. Información del Local
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nombre del Establecimiento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Farmacia La Pascua, DermoBella, Cosméticos Infante..."
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#2D2825] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8FA89B]/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tipo de Comercio *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#2D2825] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8FA89B]/50"
                  >
                    <option value="PHARMACY">Farmacia / Botiquería</option>
                    <option value="SUPERMARKET">Supermercado</option>
                    <option value="BEAUTY_SHOP">Tienda de Cosméticos / Belleza</option>
                    <option value="INDEPENDENT">Comercio Independiente</option>
                    <option value="OTHER">Tienda por Departamento / Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Valle de la Pascua"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#2D2825] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8FA89B]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Dirección Exacta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Av. Rómulo Gallegos cruce con Calle González Padrón, Local 2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#2D2825] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8FA89B]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Punto de Referencia (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Frente a la Plaza Bolívar, al lado de Traki..."
                  value={formData.reference_point}
                  onChange={(e) => setFormData({ ...formData, reference_point: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#2D2825] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8FA89B]/50"
                />
              </div>
            </div>

            {/* 2. Coordenadas GPS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  2. Ubicación Geográfica (Geocerca)
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-600">
                    Captura automática desde tu teléfono si estás en el local:
                  </span>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#526B5D] hover:bg-[#41554a] text-white text-xs font-semibold transition-all disabled:opacity-60 shadow-sm"
                  >
                    <Compass className={`w-3.5 h-3.5 ${isGettingLocation ? 'animate-spin' : ''}`} />
                    <span>{isGettingLocation ? 'Obteniendo...' : '📍 Usar mi ubicación actual'}</span>
                  </button>
                </div>

                {locationSuccess && (
                  <p className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Coordenadas GPS capturadas con precisión.</span>
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs text-stone-600">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-500">Latitud</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-500">Longitud</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Contacto & Redes */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                3. Contacto y Redes del Local
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-stone-400" />
                    <span>WhatsApp / Teléfono</span>
                  </label>
                  <input
                    type="text"
                    placeholder="+58 412 1234567"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#2D2825] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8FA89B]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <AtSign className="w-3 h-3 text-stone-400" />
                    <span>Instagram del Comercio</span>
                  </label>
                  <input
                    type="text"
                    placeholder="@tu_tienda"
                    value={formData.instagram_handle}
                    onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#2D2825] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8FA89B]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-stone-400" />
                  <span>Tu Correo Electrónico (para confirmar la activación)</span>
                </label>
                <input
                  type="email"
                  placeholder="contacto@tutienda.com"
                  value={formData.submitted_by_email}
                  onChange={(e) => setFormData({ ...formData, submitted_by_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#2D2825] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8FA89B]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Marcas de skincare disponibles o notas adicionales
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Vendemos CeraVe, Nivea, The Ordinary, protectores solares y cosmética coreana."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#2D2825] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8FA89B]/50"
                />
              </div>
            </div>

            {/* Botón de Enviar */}
            <div className="pt-4 border-t border-stone-150 flex items-center justify-end gap-3">
              <Link
                href="/"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-[#2D2825] transition-colors"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D2825] text-white text-xs font-semibold hover:bg-stone-800 transition-all disabled:opacity-50 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Enviando...' : 'Registrar Establecimiento'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
