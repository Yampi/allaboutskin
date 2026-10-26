import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SkinProfileData, updateUserProfile } from '@/lib/api';
import { BARRIER_LABELS, SKIN_TYPE_LABELS } from '@/components/dashboard/usuario/labels';

interface EditProfileModalProps {
  current: SkinProfileData | null;
  onClose: () => void;
  onSaved: () => void;
}

const FITZPATRICK = [1, 2, 3, 4, 5, 6];
const fieldClass = 'w-full p-2.5 rounded-xl border border-[#E8E1D7] bg-[#FAFAF7] text-xs';

export default function EditProfileModal({ current, onClose, onSaved }: EditProfileModalProps) {
  const [skinType, setSkinType] = useState<SkinProfileData['skin_type']>(current?.skin_type ?? 'NORMAL');
  const [fitzpatrick, setFitzpatrick] = useState<number | ''>(current?.fitzpatrick_type ?? '');
  const [barrier, setBarrier] = useState<SkinProfileData['barrier_status']>(current?.barrier_status ?? 'HEALTHY');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateUserProfile({
        skin_type: skinType,
        fitzpatrick_type: fitzpatrick === '' ? null : fitzpatrick,
        barrier_status: barrier,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el perfil');
      setIsSaving(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Actualizar perfil" className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#2D2825]">Actualizar perfil dermatológico</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <label className="block font-bold text-[#2D2825]">Biotipo de piel
          <select className={fieldClass} value={skinType} onChange={(e) => setSkinType(e.target.value as SkinProfileData['skin_type'])}>
            {Object.entries(SKIN_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        <label className="block font-bold text-[#2D2825]">Fototipo Fitzpatrick
          <select className={fieldClass} value={fitzpatrick} onChange={(e) => setFitzpatrick(e.target.value ? Number(e.target.value) : '')}>
            <option value="">No indicado</option>
            {FITZPATRICK.map((n) => <option key={n} value={n}>Fototipo {n}</option>)}
          </select>
        </label>

        <label className="block font-bold text-[#2D2825]">Estado de la barrera cutánea
          <select className={fieldClass} value={barrier} onChange={(e) => setBarrier(e.target.value as SkinProfileData['barrier_status'])}>
            {Object.entries(BARRIER_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        {error && <p role="alert" className="text-rose-700 font-semibold">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full bg-slate-100 font-bold text-slate-700 cursor-pointer">Cancelar</button>
          <button type="button" disabled={isSaving} onClick={save} className="flex-1 py-2.5 rounded-full bg-[#2E7D5B] text-white font-bold disabled:opacity-60 cursor-pointer">
            {isSaving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
