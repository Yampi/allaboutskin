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
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2B2A29]">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-10">
        {/* Header Introduction */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-[#EFF5F1] text-[#4F6D60] text-xs font-bold px-4 py-1 rounded-full border border-[#7A9A8B]/30 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#7A9A8B]" />
            <span>Ritual de Renovación Cutánea</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#2B2A29] tracking-tight leading-tight">
            Protocolo de <span className="text-[#7A9A8B]">Skin Cycling</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A66] leading-relaxed max-w-2xl mx-auto">
            Metodología de noches alternas para obtener la máxima luminosidad de exfoliantes y retinoides sin comprometer la barrera de tu piel.
          </p>
        </div>

        {/* Interactive Diagnostic Wizard */}
        <SkinCyclingWizard />
      </main>

      <Footer />
    </div>
  );
}

