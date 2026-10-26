'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { BusinessStoreProfile } from '@/lib/api';

interface StoreProfileFormProps {
  store: BusinessStoreProfile | null;
  onSave: (data: {
    name: string;
    website_url?: string | null;
    instagram_handle?: string | null;
    whatsapp_contact?: string | null;
    logo_url?: string | null;
  }) => Promise<void>;
  isSaving: boolean;
}

export default function StoreProfileForm({ store, onSave, isSaving }: StoreProfileFormProps) {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (store) {
      setName(store.name || '');
      setWebsite(store.website_url || '');
      setInstagram(store.instagram_handle || '');
      setWhatsapp(store.whatsapp_contact || '');
      setLogoUrl(store.logo_url || '');
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      name,
      website_url: website.trim() || null,
      instagram_handle: instagram.trim() || null,
      whatsapp_contact: whatsapp.trim() || null,
      logo_url: logoUrl.trim() || null,
    });
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Configuración Comercial</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Esta información se muestra a los usuarios en las recomendaciones de rutinas y en tu vitrina.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Nombre del Comercio o Farmacia *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Sitio Web Oficial (Opcional)
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://tutienda.com"
            className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Usuario de Instagram
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="tufarmacia"
                className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md pl-7 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              WhatsApp de Contacto Central
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+58 412 1234567"
              className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            URL del Logo / Imagen de Tienda (Opcional)
          </label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://ejemplo.com/logo.png"
            className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-[#4A6B5B] hover:bg-[#3d594b] text-white font-bold text-xs rounded-md transition shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>{isSaving ? 'Guardando...' : 'Guardar Perfil'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
