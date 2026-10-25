'use client';

import React, { useState } from 'react';
import { Store, ArrowRight, Loader2 } from 'lucide-react';

interface StoreRegisterFormProps {
  onSubmit: (data: {
    store_name: string;
    city: string;
    state: string;
    address: string;
    whatsapp: string;
    instagram_handle?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function StoreRegisterForm({ onSubmit, isSubmitting }: StoreRegisterFormProps) {
  const [storeName, setStoreName] = useState('');
  const [city, setCity] = useState('Valle de la Pascua');
  const [state, setState] = useState('Guárico');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      store_name: storeName,
      city,
      state,
      address,
      whatsapp,
      instagram_handle: instagram.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4 text-left">
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">
          Nombre del Comercio o Farmacia *
        </label>
        <input
          type="text"
          required
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Ej. Farmacia La Fe / Dermacenter"
          className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4A6B5B]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Ciudad *</label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Estado *</label>
          <input
            type="text"
            required
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Dirección de Sede Principal *</label>
        <input
          type="text"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ej. Av. Rómulo Gallegos cruce con Calle Real"
          className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4A6B5B]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp de Pedidos *</label>
          <input
            type="text"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+58 412 1234567"
            className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4A6B5B]"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Instagram (Opcional)</label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@tufarmacia"
            className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4A6B5B]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-2 py-2.5 bg-[#4A6B5B] hover:bg-[#3d594b] text-white font-bold text-xs rounded-md transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Store className="w-4 h-4" />
            <span>Crear Comercio & Empezar</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
