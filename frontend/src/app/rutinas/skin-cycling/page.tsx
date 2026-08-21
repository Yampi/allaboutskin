import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SkinCyclingWizard from '@/components/SkinCyclingWizard';

export const metadata: Metadata = {
  title: 'Generador Clínico de Skin Cycling Personalizado | Allabout.skin',
  description: 'Calcula tu protocolo de Skin Cycling adaptado a tu tipo de piel, fototipo, embarazo, acné o rosácea. Guarda tu rutina y activa tu calendario interactivo.',
};

export default function SkinCyclingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Header Introduction */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200 uppercase tracking-wider">
            Metodología Dermatológica & Algoritmo Adaptativo
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Protocolo Científico de <span className="text-teal-600">Skin Cycling</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Estrategia de ciclado nocturno diseñada para maximizar la eficacia de exfoliantes químicos y retinoides minimizando la irritación. Personaliza tu ciclo según tu biotipo y activa tu calendario de seguimiento diario.
          </p>
        </div>

        {/* Interactive Diagnostic Wizard */}
        <SkinCyclingWizard />
      </main>

      <Footer />
    </div>
  );
}
