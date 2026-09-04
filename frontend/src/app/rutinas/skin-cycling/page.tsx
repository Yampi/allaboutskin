import { Metadata } from 'next';
import SkinCyclingWizard from '@/components/SkinCyclingWizard';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rituales de Skin Cycling Personalizados | Allabout.skin',
  description: 'Calcula tu protocolo de Skin Cycling adaptado a tu tipo de piel, fototipo y nivel de sensibilidad. Guarda tu rutina y sigue tu calendario diario.',
};

export default function SkinCyclingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full space-y-10 animate-in fade-in">
      {/* Header Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[11px] font-sans font-bold text-[#4A6B5B] uppercase tracking-wider bg-[#EBF1EE] px-3 py-1 rounded-full inline-block">
          Metodología Dermatológica & Algoritmo Adaptativo
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-[#2D2825] tracking-tight">
          Protocolo Científico de <span className="text-[#4A6B5B]">Skin Cycling</span>
        </h1>
        <p className="text-[13px] sm:text-[14px] text-[#7E756F] leading-relaxed max-w-xl mx-auto">
          Estrategia de ciclado nocturno para optimizar la renovación celular y proteger la barrera cutánea. Obtén los máximos beneficios sin comprometer tu piel.
        </p>
      </div>

      {/* Interactive Diagnostic Wizard */}
      <SkinCyclingWizard />
    </div>
  );
}

