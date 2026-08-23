import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FormulaComparator from '@/components/FormulaComparator';

export const metadata: Metadata = {
  title: 'Comparador de Fórmulas | Allabout.skin',
  description: 'Compara dos fórmulas cosméticas lado a lado...',
};

export default function ComparadorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1B1A]">
      <Navbar />
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-[10px] font-bold text-[#4F6D60] uppercase tracking-widest bg-[#EFF5F1] px-3 py-0.5 rounded-full inline-block">
            Comparativa Científica
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1B1A] tracking-tight">
            Comparador de <span className="text-[#4F6D60]">Fórmulas</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#66615C] leading-relaxed max-w-xl mx-auto">
            Compara dos productos simultáneamente para evaluar concentración de activos, compatibilidad dérmica y relación calidad-ciencia.
          </p>
        </div>
        <FormulaComparator />
      </main>
      <Footer />
    </div>
  );
}
