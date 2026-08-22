import { Metadata } from 'next';
import Link from 'next/link';
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Droplets, 
  Activity, 
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Biblioteca de Activos Cosméticos & Dermatología | Allabout.skin',
  description: 'Explora fichas técnicas de activos cosméticos. Regulado por CosIng UE y respaldado por estudios clínicos en PubMed (NCBI).',
};

const INGREDIENTS = [
  {
    slug: 'niacinamide',
    name: 'Niacinamida (Vitamina B3)',
    category: 'Regulador de Sebo & Barrera',
    evidence: 'NIVEL A (RCTs)',
    ph: '5.0 - 7.0',
    comedogenic: '0 / 5 (Nulo)',
    layering: 'Sérum Acuoso (AM/PM)',
    description: 'Potente antioxidante y antiinflamatorio. Estimula la síntesis de ceramidas, reduce la apariencia de poros dilatados y calma rojeces.',
    compatibleWith: ['Ácido Hialurónico', 'Pantenol', 'Retinoides', 'Centella'],
    avoidWith: ['Vitamina C pura en pH extremo si tu piel es hipersensible'],
    badgeColor: 'bg-[#EFF5F1] text-[#4F6D60] border-[#7A9A8B]/30'
  },
  {
    slug: 'retinol',
    name: 'Retinol & Retinoides (Vitamina A)',
    category: 'Renovación Celular & Colágeno',
    evidence: 'NIVEL A (Gold Standard)',
    ph: '5.5 - 6.5',
    comedogenic: '0 / 5 (Nulo)',
    layering: 'Tratamiento Nocturno (PM)',
    description: 'El estándar de oro en dermatología antiedad. Acelera el recambio epidérmico, atenúa manchas y promueve la síntesis de nuevo colágeno dérmico.',
    compatibleWith: ['Ceramidas', 'Pantenol', 'Ácido Hialurónico', 'Escualano'],
    avoidWith: ['Ácidos AHA/BHA en la misma capa nocturna'],
    badgeColor: 'bg-[#F8EFEA] text-[#A46864] border-[#E8D5D0]'
  },
  {
    slug: 'salicylic-acid',
    name: 'Ácido Salicílico (BHA 2%)',
    category: 'Exfoliante Liposoluble',
    evidence: 'NIVEL A (RCTs)',
    ph: '3.0 - 4.0',
    comedogenic: '0 / 5 (Nulo)',
    layering: 'Exfoliante Químico (Noche 1)',
    description: 'Penetra en profundidad a través del sebo para disolver células muertas dentro del poro, reduciendo espinillas y puntos negros.',
    compatibleWith: ['Niacinamida', 'Ácido Hialurónico', 'Centella Asiática'],
    avoidWith: ['Retinoides o Vitamina C pura en la misma aplicación'],
    badgeColor: 'bg-[#F7F2EB] text-[#8F7253] border-[#C4A482]/40'
  },
  {
    slug: 'hyaluronic-acid',
    name: 'Ácido Hialurónico Multimolecular',
    category: 'Humectante & Hidratación Profunda',
    evidence: 'NIVEL A (RCTs)',
    ph: '5.0 - 7.0',
    comedogenic: '0 / 5 (Nulo)',
    layering: 'Piel Húmeda (AM/PM)',
    description: 'Retiene hasta 1000 veces su peso molecular en agua. Repulpa la matriz extracelular y previene la deshidratación transepidérmica.',
    compatibleWith: ['Todos los activos (Universal)'],
    avoidWith: ['Ninguna contraindicación conocida'],
    badgeColor: 'bg-[#EFF5F1] text-[#4F6D60] border-[#7A9A8B]/30'
  },
  {
    slug: 'panthenol',
    name: 'Pantenol (Provitamina B5)',
    category: 'Regenerador de Barrera & SOS',
    evidence: 'NIVEL A (Clínico)',
    ph: '4.5 - 7.0',
    comedogenic: '1 / 5 (Bajo)',
    layering: 'Emulsión / Bálsamo Reparador',
    description: 'Lípido biomimético calmante que acelera la reepitelización cutánea, alivia la tirantez y fortalece la barrera lipídica.',
    compatibleWith: ['Todos los activos, ideal en recuperación y modo SOS'],
    avoidWith: ['Ninguno'],
    badgeColor: 'bg-[#EFF5F1] text-[#4F6D60] border-[#7A9A8B]/30'
  },
  {
    slug: 'ascorbic-acid',
    name: 'Vitamina C Pura (Ácido L-Ascórbico)',
    category: 'Antioxidante & Luminosidad',
    evidence: 'NIVEL A (RCTs)',
    ph: '2.8 - 3.5',
    comedogenic: '0 / 5 (Nulo)',
    layering: 'Mañanas (AM) antes del Protector Solar',
    description: 'Inhibe la enzima tirosinasa para unificar el tono cutáneo, previene el daño oxidativo solar y sinergiza con tu protector FPS 50+.',
    compatibleWith: ['Ácido Ferúlico', 'Vitamina E', 'Ácido Hialurónico'],
    avoidWith: ['Retinoides o Cobre en la misma aplicación matutina'],
    badgeColor: 'bg-[#FAF8F5] text-[#8F7253] border-[#EFECE6]'
  }
];

export default function IngredientesIndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2B2A29]">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-10">
        {/* Header Introduction */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-[#EFF5F1] text-[#4F6D60] text-xs font-bold px-4 py-1 rounded-full border border-[#7A9A8B]/30 uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5 text-[#7A9A8B]" />
            <span>Guía Botánica & Clínica Oficial CosIng UE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#2B2A29] tracking-tight">
            Biblioteca de <span className="text-[#7A9A8B]">Activos Cosméticos</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A66] leading-relaxed max-w-2xl mx-auto">
            Fichas científicas de compatibilidad, pH de formulación y nivel de evidencia médica en ensayos clínicos de PubMed (NCBI).
          </p>
        </div>

        {/* Ingredients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INGREDIENTS.map((ing) => (
            <Link
              key={ing.slug}
              href={`/ingrediente/${ing.slug}`}
              className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#EFECE6] shadow-beauty hover:border-[#7A9A8B]/50 transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full border uppercase tracking-wider ${ing.badgeColor}`}>
                    {ing.evidence}
                  </span>
                  <span className="text-[10px] text-[#9C9790] font-semibold">
                    pH: {ing.ph}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#2B2A29] group-hover:text-[#4F6D60] transition-colors">
                  {ing.name}
                </h2>
                
                <p className="text-xs text-[#6E6A66] leading-relaxed line-clamp-3">
                  {ing.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EFECE6] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#9C9790] font-medium">
                  {ing.layering}
                </span>
                <span className="font-bold text-[#7A9A8B] group-hover:text-[#4F6D60] flex items-center gap-1">
                  <span>Ver Ficha</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
