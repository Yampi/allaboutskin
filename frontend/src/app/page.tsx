import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FormulaAuditor from '@/components/FormulaAuditor';
import { Microscope, ShieldCheck, Database, FileText, Layers, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SkinEvidence - Auditoría Científica de Fórmulas Cosméticas e INCI',
  description: 'Audita cualquier producto o lista INCI contrastada contra la base de datos CosIng de la UE y la literatura médica de PubMed (NCBI). Conflictos químicos, evidencia clínica y orden de capas.',
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50/70 via-slate-50 to-slate-50 border-b border-slate-200/60">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-teal-100/80 text-teal-900 text-xs font-bold px-3.5 py-1.5 rounded-full border border-teal-300/60 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Motor de Auditoría Dermatológica & Evidencia Científica</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Ciencia y Evidencia Médica detrás de tu <span className="bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">Skincare</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Analiza fórmulas cosméticas, detecta conflictos químicos entre activos, verifica estudios clínicos indexados en PubMed y optimiza el orden de aplicación por pH y biotipo cutáneo.
            </p>

            {/* Quick stats */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
                  <Database className="w-4 h-4" />
                  <span>CosIng UE</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Normalización oficial</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
                  <FileText className="w-4 h-4" />
                  <span>PubMed (NCBI)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">PMIDs y ensayos RCT</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
                  <Layers className="w-4 h-4" />
                  <span>Layering Inteligente</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Orden por pH y textura</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
                  <RefreshCw className="w-4 h-4" />
                  <span>Monitor PAO</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Agotamiento y reposición</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Auditor Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <FormulaAuditor />
        </section>
      </main>

      <Footer />
    </div>
  );
}
