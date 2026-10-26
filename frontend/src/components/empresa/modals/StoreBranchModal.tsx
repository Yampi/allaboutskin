'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { BusinessBranchItem } from '@/lib/api';

interface StoreBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBranch: BusinessBranchItem | null;
  onSubmit: (data: {
    name: string;
    city: string;
    state: string;
    address: string;
    reference_point?: string;
    phone?: string;
    whatsapp?: string;
    opening_hours?: string;
    latitude?: number;
    longitude?: number;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function StoreBranchModal({
  isOpen,
  onClose,
  editingBranch,
  onSubmit,
  isSubmitting,
}: StoreBranchModalProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Guárico');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [hours, setHours] = useState('Lunes a Sábado: 8:00 AM - 6:00 PM');

  useEffect(() => {
    if (editingBranch) {
      setName(editingBranch.name);
      setCity(editingBranch.city);
      setState(editingBranch.state);
      setAddress(editingBranch.address);
      setWhatsapp(editingBranch.whatsapp || '');
      setHours(editingBranch.opening_hours || 'Lunes a Sábado: 8:00 AM - 6:00 PM');
    } else {
      setName('');
      setCity('Valle de la Pascua');
      setState('Guárico');
      setAddress('');
      setWhatsapp('');
      setHours('Lunes a Sábado: 8:00 AM - 6:00 PM');
    }
  }, [editingBranch, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      city,
      state,
      address,
      whatsapp: whatsapp.trim() || undefined,
      opening_hours: hours.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-lg p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {editingBranch ? 'Editar Sucursal' : 'Nueva Sede / Sucursal'}
            </h3>
            <p className="text-[11px] text-slate-500">Configura ubicación física y WhatsApp de pedidos.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nombre de la Sede *</label>
            <input
              type="text"
              required
              placeholder="Ej. Sede Casco Central"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Ciudad *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Estado *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Dirección Detallada *</label>
            <input
              type="text"
              required
              placeholder="Av. Principal con Calle 4"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">WhatsApp de Pedidos</label>
              <input
                type="text"
                placeholder="+58 412 1234567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Horario</label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-md cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-[#4A6B5B] hover:bg-[#3d594b] text-white font-bold rounded-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Guardando...' : editingBranch ? 'Guardar Cambios' : 'Crear Sede'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
