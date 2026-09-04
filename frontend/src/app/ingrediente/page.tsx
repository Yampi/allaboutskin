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
    category: 'Regenerador de Barrera & Reparación',
    evidence: 'NIVEL A (Clínico)',
    ph: '4.5 - 7.0',
    comedogenic: '1 / 5 (Bajo)',
    layering: 'Emulsión / Bálsamo Reparador',
    description: 'Lípido biomimético calmante que acelera la reepitelización cutánea, alivia la tirantez y fortalece la barrera lipídica.',
    compatibleWith: ['Todos los activos, ideal en fases de recuperación dérmica'],
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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 animate-in fade-in">
      {/* Header Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pb-2">
        <span className="text-[11px] font-sans font-bold text-[#4A6B5B] uppercase tracking-wider bg-[#EBF1EE] px-3 py-1 rounded-full inline-block">
          Inventario CosIng UE & PubMed NCBI
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-[#2D2825] tracking-tight">
          Biblioteca de <span className="text-[#4A6B5B]">Activos Cosméticos</span>
        </h1>
        <p className="text-[13.5px] sm:text-[14.5px] text-[#7E756F] leading-relaxed max-w-xl mx-auto">
          Fichas técnicas y evidencia clínica de las principales moléculas utilizadas en formulación dermocosmética.
        </p>
      </div>

      {/* Grid of Ingredients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INGREDIENTS.map((ing) => (
          <Link
            key={ing.slug}
            href={`/ingrediente/${ing.slug}`}
            className="group card-white p-6 rounded-[22px] border border-[#E8E1D7] hover:border-[#8FA89B] hover:shadow-diffuse-elevated transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full border ${ing.badgeColor}`}>
                  {ing.evidence}
                </span>
                <span className="text-xs font-mono text-[#7E756F]">
                  pH: {ing.ph}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-serif font-semibold text-[#2D2825] group-hover:text-[#4A6B5B] transition">
                  {ing.name}
                </h3>
                <span className="text-xs font-medium text-[#7E756F] block mt-0.5">
                  {ing.category}
                </span>
              </div>

              <p className="text-[13px] text-[#4A433E] line-clamp-3 leading-relaxed">
                {ing.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8E1D7] flex items-center justify-between text-sm mt-4">
              <span className="text-xs text-[#7E756F]">
                {ing.layering}
              </span>
              <span className="font-semibold text-[#4A6B5B] group-hover:text-[#3D5A4C] flex items-center gap-1">
                <span>Ver Ficha Clínica</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
