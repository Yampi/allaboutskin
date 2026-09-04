import { Metadata } from 'next';
import FormulaComparator from '@/components/FormulaComparator';

export const metadata: Metadata = {
  title: 'Comparador de Fórmulas | Allabout.skin',
  description: 'Compara dos fórmulas cosméticas lado a lado...',
};

export default function ComparadorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full space-y-8 animate-in fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[11px] font-sans font-bold text-[#4A6B5B] uppercase tracking-wider bg-[#EBF1EE] px-3 py-1 rounded-full inline-block">
          Comparativa Científica Frente a Frente
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#2D2825] tracking-tight">
          Comparador de <span className="text-[#4A6B5B]">Fórmulas</span>
        </h1>
        <p className="text-[13px] sm:text-[14px] text-[#7E756F] leading-relaxed max-w-xl mx-auto">
          Compara dos productos simultáneamente para evaluar concentración de activos, compatibilidad dérmica y relación calidad-ciencia.
        </p>
      </div>
      <FormulaComparator />
    </div>
  );
}
