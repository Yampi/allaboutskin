import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FormulaAuditor from '@/components/FormulaAuditor';
import { Microscope, ShieldCheck, Database, FileText, Bot, Zap, ArrowDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SkinEvidence - Auditoría Científica de Skincare y Misceláneas',
  description: 'Audita cualquier cosmético, toallita o miscelánea con rigor científico. Verificado contra CosIng UE, PubMed y Copilot IA con Guardrails Clínicos.',
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
      <Navbar />

      <main className="flex-grow">
        {/* App-Centric Hero & Direct Interactive Evaluation Zone */}
        <section className="relative overflow-hidden pt-8 sm:pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50/80 via-slate-50 to-slate-50">
          
          {/* Subtle Ambient Background Accents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-teal-200/20 via-cyan-100/30 to-emerald-200/20 blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-teal-900 text-xs font-bold px-3.5 py-1.5 rounded-full border border-teal-200/80 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Plataforma Científica de Skincare & Misceláneas</span>
            </div>

            {/* Direct & Impactful Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
              Audita tu Skincare con <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Evidencia Médica e IA
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Escribe un producto, pega ingredientes o toma una foto para evaluar fricción mecánica, conflictos químicos y estudios clínicos indexados.
            </p>
          </div>

          {/* Interactive Single-Input Evaluation Box (Directly in Viewport) */}
          <div className="max-w-4xl mx-auto">
            <FormulaAuditor />
          </div>

          {/* Trust & Scientific Sources Bar */}
          <div className="pt-10 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-left">
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">CosIng UE</h4>
                  <p className="text-[10px] text-slate-500">Regulación Oficial</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">PubMed</h4>
                  <p className="text-[10px] text-slate-500">Ensayos Clínicos RCT</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Copilot Clínico</h4>
                  <p className="text-[10px] text-slate-500">Guardrails Estrictos</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Foso de Datos</h4>
                  <p className="text-[10px] text-slate-500">Caché & Zero Latencia</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
