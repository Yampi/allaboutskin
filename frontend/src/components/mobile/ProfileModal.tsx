'use client';

import React, { useState } from 'react';
import { X, User, SlidersHorizontal, Check, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { UserProfile } from './types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

const skinTypeOptions = [
  'Piel Mixta',
  'Piel Seca',
  'Piel Grasa',
  'Piel Normal',
  'Piel Sensible / Reactiva',
];

const conditionOptions = [
  'Sensible',
  'Zona T Reactiva',
  'Deshidratación Leve',
  'Sensibilidad a Fragancias',
  'Tendencia a Rosácea',
  'Poros Dilatados',
  'Foto-Envejecimiento',
];

export default function ProfileModal({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
}: ProfileModalProps) {
  const [selectedType, setSelectedType] = useState(
    userProfile.skinType && userProfile.skinType !== 'Sin calibrar' ? userProfile.skinType : 'Piel Mixta'
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>(userProfile.conditions || []);

  if (!isOpen) return null;

  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const handleSave = () => {
    onUpdateProfile({
      skinType: selectedType,
      conditions: selectedConditions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#FAF8F5] rounded-t-[28px] sm:rounded-[24px] border border-[#E8E1D7] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle on Mobile */}
        <div className="w-12 h-1 bg-[#D5CDC5] rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-[#E8E1D7] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#F2ECE4] border border-[#E2D9CD] flex items-center justify-center text-[#4A6B5B]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-[19px] font-semibold text-[#2D2825] leading-tight">
                Custom Perfil Setup
              </h2>
              <p className="text-[11px] font-sans text-[#7E756F]">
                Calibración del Biotipo Cutáneo & Algoritmo INCI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F2ECE4] text-[#7E756F] hover:text-[#2D2825] hover:bg-[#E2D9CD] transition cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="px-5 py-4 overflow-y-auto space-y-4 font-sans text-[#2D2825] text-[13.5px]">
          {/* User Badge Overview */}
          <div className="p-3.5 rounded-[20px] bg-[#F2ECE4] border border-[#E2D9CD] flex items-center gap-3">
            {userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name || 'Usuario'}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#EBF1EE] border-2 border-white shadow-xs flex items-center justify-center text-[#4A6B5B]">
                <User className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-[16px] font-semibold text-[#2D2825]">
                  {userProfile.name || 'Sin registrar'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[10px] font-bold">
                  Día {userProfile.cycleStreakDays || 0}
                </span>
              </div>
              <p className="text-[11.5px] text-[#7E756F]">
                Protocolo: Skin Cycling 4 Noches Clásico
              </p>
            </div>
          </div>

          {/* Skin Biotype Selector */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#7E756F] uppercase tracking-wider block">
              1. Selecciona tu Biotipo Cutáneo Principal
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {skinTypeOptions.map((type) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3.5 py-2.5 rounded-full text-left text-[12.5px] font-medium border transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#8FA89B] text-white border-[#8FA89B] shadow-xs'
                        : 'bg-white text-[#2D2825] border-[#E8E1D7] hover:border-[#8FA89B]'
                    }`}
                  >
                    <span>{type}</span>
                    {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skin Conditions & Sensitivities */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-[#7E756F] uppercase tracking-wider block">
              2. Focos Dermatológicos y Reactividades
            </span>
            <div className="flex flex-wrap gap-2">
              {conditionOptions.map((cond) => {
                const isSelected = selectedConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#4A6B5B] text-white border-[#4A6B5B]'
                        : 'bg-[#F2ECE4] text-[#4A433E] border-[#E2D9CD] hover:border-[#8FA89B]'
                    }`}
                  >
                    <span>{cond}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Protocol Calibration Explanation */}
          <div className="p-3.5 rounded-[18px] bg-[#EBF1EE] border border-[#8FA89B]/30 text-[12px] text-[#2D4A3E] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#4A6B5B]">
              <Sparkles className="w-4 h-4" />
              <span>Ajuste Dinámico de Fórmulas</span>
            </div>
            <p className="leading-relaxed">
              Al guardar tu biotipo, el escáner AR INCI recalculará automáticamente la compatibilidad de cada producto y adaptará la intensidad de las noches de exfoliación y retinoides.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#E8E1D7] bg-[#FAF8F5] flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full bg-[#F2ECE4] hover:bg-[#E2D9CD] text-[#7E756F] font-medium text-[13px] transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-2 py-2.5 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white font-medium text-[13px] shadow-diffuse transition cursor-pointer"
          >
            Guardar y Calibrar
          </button>
        </div>
      </div>
    </div>
  );
}