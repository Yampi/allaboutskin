import { Metadata } from 'next';
import Link from 'next/link';
import { Microscope, BookOpen, FileText, Sparkles, ShieldCheck, ArrowRight, Layers, Droplets } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Biblioteca de Ingredientes Cosméticos | Allabout.skin',
  description: 'Explora fichas técnicas de ingredientes activos en cosmética y dermatología. Regulado por CosIng UE y respaldado por estudios clínicos en PubMed.',
};

const INGREDIENTS = [
  {
    slug: 'niacinamide',
    name: 'Niacinamida (Vitamina B3)',
    category: 'Regulador de Sebo & Barrera',
    evidence: 'NIVEL A (RCT)',
    ph: '5.0 - 7.0',
    layering: 'Serum Acuoso',
    description: 'Potente antiinflamatorio, reduce la apariencia de poros, refuerza la síntesis de ceramidas y unifica el tono.',
    color: 'teal'
  },
  {
    slug: 'retinol',
    name: 'Retinol (Vitamina A)',
    category: 'Renovación Celular & Antiedad',
    evidence: 'NIVEL A (RCT)',
    ph: '5.5 - 6.5',
    layering: 'Tratamiento Nocturno',
    description: 'Estimula la producción de colágeno, acelera el recambio epidérmico y combate signos de fotoenvejecimiento.',
    color: 'purple'
  },
  {
    slug: 'salicylic-acid',
    name: 'Ácido Salicílico (BHA)',
    category: 'Exfoliante Liposoluble',
    evidence: 'NIVEL A (RCT)',
    ph: '3.0 - 4.0',
    layering: 'Exfoliante Químico',
    description: 'Penetra profundamente en los folículos pilosebáceos para disolver grasa atrapada y descongestionar puntos negros.',
    color: 'amber'
  },
  {
    slug: 'hyaluronic-acid',
    name: 'Ácido Hialurónico',
    category: 'Humectante & Hidratación',
    evidence: 'NIVEL A (RCT)',
    ph: '5.0 - 7.0',
    layering: 'Serum Hidratante',
    description: 'Retiene hasta 1000 veces su peso en agua, mejorando la elasticidad y reduciendo la pérdida transepidérmica.',
    color: 'sky'
  },
  {
    slug: 'ascorbic-acid',
    name: 'Vitamina C (Ácido L-Ascórbico)',
    category: 'Antioxidante & Luminosidad',
    evidence: 'NIVEL A (RCT)',
    ph: '2.8 - 3.5',
    layering: 'Serum Matutino (AM)',
    description: 'Neutraliza radicales libres inducidos por radiación UV, inhibe la tirosinasa y aporta luminosidad.',
    color: 'orange'
  },
  {
    slug: 'panthenol',
    name: 'Pantenol (Provitamina B5)',
    category: 'Regenerador & Calmante',
    evidence: 'NIVEL A',
    ph: '4.5 - 7.0',
    layering: 'Crema / Emulsión',
    description: 'Acelera la cicatrización epitelial, calma la irritación y repara la barrera cutánea dañada.',
    color: 'emerald'
  }
];

export default function IngredientesIndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 text-xs font-bold px-3 py-1 rounded-full border border-teal-200 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            <span>Catálogo Oficial CosIng UE & PubMed</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Biblioteca de Activos Cosméticos
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Fichas técnicas con base científica. Conoce el pH óptimo, orden de aplicación en tu rutina, nivel de evidencia médica e interacciones de cada ingrediente.
          </p>
        </div>

        {/* Ingredients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {INGREDIENTS.map((ing) => (
            <Link
              key={ing.slug}
              href={`/ingrediente/${ing.slug}`}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                    {ing.evidence}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    pH {ing.ph}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {ing.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">
                    {ing.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {ing.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:text-teal-800">
                <span>Ver Ficha Técnica Completa</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Audit CTA */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-bold">¿Quieres auditar una fórmula completa?</h3>
            <p className="text-xs text-teal-100 max-w-lg">
              Introduce el nombre de un cosmético o sube una foto de la etiqueta para analizar compatibilidad química, orden de capas y grado comedogénico.
            </p>
          </div>
          <Link
            href="/"
            className="bg-white text-teal-900 font-bold text-sm px-6 py-3 rounded-xl hover:bg-teal-50 shadow-md transition flex-shrink-0"
          >
            Auditar Fórmula Ahora
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
