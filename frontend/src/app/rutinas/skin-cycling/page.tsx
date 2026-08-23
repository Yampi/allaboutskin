import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SkinCyclingWizard from '@/components/SkinCyclingWizard';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rituales de Skin Cycling Personalizados | Allabout.skin',
  description: 'Calcula tu protocolo de Skin Cycling adaptado a tu tipo de piel, fototipo y nivel de sensibilidad. Guarda tu rutina y sigue tu calendario diario.',
};

export default function SkinCyclingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1B1A]">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-10">
        {/* Header Introduction */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[10px] font-bold text-[#4F6D60] uppercase tracking-widest bg-[#EFF5F1] px-3 py-0.5 rounded-full inline-block">
            Metodología Dermatológica & Algoritmo Adaptativo
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1C1B1A] tracking-tight">
            Protocolo Científico de <span className="text-[#4F6D60]">Skin Cycling</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#66615C] leading-relaxed max-w-xl mx-auto">
            Estrategia de ciclado nocturno para optimizar la renovación celular y proteger la barrera cutánea. Obtén los máximos beneficios sin comprometer tu piel.
          </p>
        </div>

        {/* Interactive Diagnostic Wizard */}
        <SkinCyclingWizard />
      </main>

      <Footer />
    </div>
  );
}

