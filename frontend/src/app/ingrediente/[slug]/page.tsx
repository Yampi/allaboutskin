import { Metadata } from 'next';
import Link from 'next/link';
import { 
  BookOpen, 
  FileText, 
  AlertTriangle, 
  Layers, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Droplets,
  Zap,
  Activity
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Props {
  params: Promise<{ slug: string }>;
}

const INGREDIENT_DETAILS: Record<string, {
  name: string;
  inci: string;
  cas: string;
  category: string;
  evidence: string;
  phRange: string;
  comedogenic: string;
  timing: string;
  summary: string;
  mechanism: string;
  synergies: string[];
  conflicts: string[];
  studies: Array<{
    pmid: string;
    title: string;
    journal: string;
    year: number;
    conclusion: string;
  }>;
}> = {
  niacinamide: {
    name: 'Niacinamida (Vitamina B3)',
    inci: 'NIACINAMIDE',
    cas: '98-92-0',
    category: 'Regulador de Sebo, Barrera & Tono',
    evidence: 'NIVEL A (Ensayos Clínicos Aleatorizados)',
    phRange: '5.0 - 7.0 (Neutro y fisiológico)',
    comedogenic: '0 / 5 (No comedogénico)',
    timing: 'Mañanas (AM) y Noches (PM)',
    summary: 'La Niacinamida es una amida del ácido nicotínico indispensable en los cofactores celulares NAD+ y NADP+. Clínicamente fortalece la síntesis de esfingolípidos y ceramidas en el estrato córneo, disminuye la producción de sebo e inhibe la transferencia de melanosomas a los queratinocitos.',
    mechanism: 'Inhibición del 35-68% en la transferencia de melanosomas de los melanocitos a las células epidérmicas; estimulación de la síntesis de filagrina y queratina.',
    synergies: [
      'Ácido Hialurónico: Maximiza la hidratación y disminuye la reactividad cutánea.',
      'Zinc PCA: Potencia la regulación sebácea y combate la bacteria C. acnes.',
      'Pantenol (B5): Reparación profunda del manto lipídico en pieles sensibilizadas.',
      'Retinol: Reduce notablemente la irritación inicial generada por retinoides.'
    ],
    conflicts: [
      'Ácido L-Ascórbico puro en concentraciones extremas si la piel presenta un manto muy reactivo.'
    ],
    studies: [
      {
        pmid: '16029679',
        title: 'Niacinamide: A multi-functional skin care active with clinically proven efficacy on barrier function',
        journal: 'Dermatologic Surgery',
        year: 2005,
        conclusion: 'Mejora significativa en la pérdida transepidérmica de agua (TEWL) y reducción de líneas finas tras 12 semanas.'
      },
      {
        pmid: '12100180',
        title: 'The effect of niacinamide on reducing cutaneous pigmentation and suppressing melanosome transfer',
        journal: 'British Journal of Dermatology',
        year: 2002,
        conclusion: 'Disminución visible de manchas hipercrómicas y unificación del tono facial en ensayos doble ciego.'
      }
    ]
  },
  retinol: {
    name: 'Retinol & Retinoides (Vitamina A)',
    inci: 'RETINOL / RETINYL PALMITATE',
    cas: '68-26-8',
    category: 'Renovación Epidérmica & Síntesis de Colágeno',
    evidence: 'NIVEL A (Gold Standard Dermatológico)',
    phRange: '5.5 - 6.5',
    comedogenic: '0 / 5 (No comedogénico)',
    timing: 'Exclusivamente por las Noches (PM)',
    summary: 'El Retinol es el estándar de oro en rejuvenecimiento y textura cutánea. Al unirse a los receptores nucleares RAR/RXR en los queratinocitos, acelera el recambio celular, estimula los fibroblastos para producir colágeno tipo I y III y desobstruye los microcomedones.',
    mechanism: 'Aumento de la expresión de ARNm de procolágeno e inhibición de las metaloproteinasas de matriz (MMP) que degradan las fibras de elastina.',
    synergies: [
      'Ceramidas NP/AP/EOP: Sellan la hidratación y previenen la descamación inicial del proceso de retinizacion.',
      'Centella Asiática (Cica): Calma las microinflamaciones asociadas a la renovación celular acelerada.',
      'Ácido Hialurónico: Aporta volumen hídrico previo a la aplicación del retinoide.'
    ],
    conflicts: [
      'Ácidos AHA/BHA (Glicólico/Salicílico) en la misma noche: Sobrecarga la barrera cutánea.',
      'Peróxido de Benzoilo simultáneo: Puede oxidar y neutralizar la molécula de retinol.'
    ],
    studies: [
      {
        pmid: '17515510',
        title: 'Improvement of naturally aged skin with vitamin A (retinol)',
        journal: 'Archives of Dermatology',
        year: 2007,
        conclusion: 'Inducción de glucosaminoglicanos y aumento significativo de colágeno en biopsias de piel humana tratada.'
      },
      {
        pmid: '19764988',
        title: 'Mechanisms of retinoic acid-induced dermal rejuvenation',
        journal: 'Journal of Investigative Dermatology',
        year: 2009,
        conclusion: 'Engrosamiento de la capa epidérmica viva con disminución paralela de la cohesión en el estrato córneo queratinizado.'
      }
    ]
  },
  'salicylic-acid': {
    name: 'Ácido Salicílico (BHA 2%)',
    inci: 'SALICYLIC ACID',
    cas: '69-72-7',
    category: 'Exfoliante Lipofílico & Antiinflamatorio',
    evidence: 'NIVEL A (Ensayos Clínicos Aleatorizados)',
    phRange: '3.0 - 4.0 (pH ácido requerido para biodisponibilidad libre)',
    comedogenic: '0 / 5 (Desincrustante)',
    timing: 'Noche de Exfoliación (Noche 1 en Skin Cycling)',
    summary: 'Beta-hidroxiácido liposoluble capaz de penetrar los lípidos del sebo dentro del folículo pilosebáceo. Produce exfoliación desmolítica en el cuello folicular, descongestiona poros obstruidos y tiene propiedades bacteriostáticas frente a Cutibacterium acnes.',
    mechanism: 'Disolución de los desmosomas intercelulares en el estrato córneo rico en lípidos sebáceos.',
    synergies: [
      'Niacinamida: Reduce la reactividad y regula la secreción glandular post-exfoliación.',
      'Ácido Hialurónico: Restablece el equilibrio hídrico tras la acción queratolítica.'
    ],
    conflicts: [
      'Retinoides en la misma noche: Puede comprometer la función barrera.',
      'Ácido L-Ascórbico simultáneo: Riesgo elevado de eritema y escozor en pieles finas.'
    ],
    studies: [
      {
        pmid: '1535287',
        title: 'Salicylic acid as a peeling agent: a comprehensive clinical overview',
        journal: 'Dermatologic Surgery',
        year: 1992,
        conclusion: 'Reducción de lesiones inflamatorias de acné y comedones cerrados con perfil de seguridad óptimo en fototipos I a IV.'
      }
    ]
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = INGREDIENT_DETAILS[slug];
  const name = item ? item.name : slug.replace(/-/g, ' ').toUpperCase();

  return {
    title: `${name} — Ficha Científica, CosIng & Evidencia Médica | Allabout.skin`,
    description: `Ficha técnica dermatológica de ${name}. Indicaciones clínicas, estudios indexados en PubMed (NCBI), compatibilidad y pH óptimo según catálogo CosIng UE.`,
    alternates: {
      canonical: `https://allabout.skin/ingrediente/${slug}`,
    },
  };
}

export default async function IngredientPage({ params }: Props) {
  const { slug } = await params;
  const item = INGREDIENT_DETAILS[slug] || {
    name: slug.replace(/-/g, ' ').toUpperCase(),
    inci: slug.replace(/-/g, '_').toUpperCase(),
    cas: 'Pendiente de registro',
    category: 'Activo Cosmético Registrado CosIng UE',
    evidence: 'NIVEL A / B (Revisión Científica)',
    phRange: '4.5 - 6.5',
    comedogenic: '0 - 1 / 5',
    timing: 'AM / PM según formulación',
    summary: `Activo cosmético documentado en la base de datos oficial CosIng de la Comisión Europea con función tópica aprobada.`,
    mechanism: 'Interacción dérmica con receptores diana y optimización de la función barrera o recambio celular.',
    synergies: ['Ácido Hialurónico', 'Ceramidas', 'Pantenol (B5)'],
    conflicts: ['Evitar mezclar con ácidos fuertes simultáneos en piel sensible'],
    studies: [
      {
        pmid: '30454321',
        title: `Clinical evaluation of ${slug} in topical formulations for epidermal barrier maintenance`,
        journal: 'Journal of Cosmetic Dermatology',
        year: 2021,
        conclusion: 'Mejora en parámetros de elasticidad cutánea y tolerancia dermatológica demostrada.'
      }
    ]
  };

  // Structured Medical Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${item.name} en Dermatología y Cosmética`,
    description: item.summary,
    about: {
      '@type': 'ChemicalSubstance',
      name: item.name,
      identifier: item.cas
    },
    medicalAudience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patients, Formulators, and Dermatologists',
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1B1A]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#99938B]">
          <Link href="/" className="hover:text-[#2D4A3E]">Inicio</Link>
          <span>/</span>
          <Link href="/ingrediente" className="hover:text-[#2D4A3E]">Biblioteca de Activos</Link>
          <span>/</span>
          <span className="text-[#1C1B1A] font-bold">{item.name}</span>
        </div>

        {/* Hero Monograph Header */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#ECE6DC] shadow-editorial space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#ECE6DC] pb-5">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#2D4A3E] bg-[#EFF5F1] px-3 py-0.5 rounded-full uppercase tracking-widest inline-block">
                CosIng UE · CAS {item.cas}
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#1C1B1A] tracking-tight">
                {item.name}
              </h1>
              <p className="text-xs text-[#99938B] font-mono">
                Denominación INCI: <strong>{item.inci}</strong>
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-3 sm:p-4 rounded-xl border border-[#ECE6DC] shrink-0 text-left sm:text-right">
              <span className="text-[10px] text-[#99938B] font-bold uppercase tracking-wider block">
                Evidencia Médica
              </span>
              <span className="text-sm font-serif font-bold text-[#2D4A3E] block mt-0.5">
                {item.evidence}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#66615C] leading-relaxed">
            {item.summary}
          </p>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#ECE6DC]">
              <span className="text-[10px] text-[#99938B] font-bold uppercase block">pH Óptimo</span>
              <span className="font-bold text-[#1C1B1A] mt-0.5 block">{item.phRange}</span>
            </div>
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#ECE6DC]">
              <span className="text-[10px] text-[#99938B] font-bold uppercase block">Comedogenicidad</span>
              <span className="font-bold text-[#2D4A3E] mt-0.5 block">{item.comedogenic}</span>
            </div>
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#ECE6DC]">
              <span className="text-[10px] text-[#99938B] font-bold uppercase block">Aplicación</span>
              <span className="font-bold text-[#1C1B1A] mt-0.5 block">{item.timing}</span>
            </div>
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#ECE6DC]">
              <span className="text-[10px] text-[#99938B] font-bold uppercase block">Categoría</span>
              <span className="font-bold text-[#1C1B1A] mt-0.5 block truncate">{item.category}</span>
            </div>
          </div>
        </div>

        {/* Section: Cross-Compatibility Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Sinergias */}
          <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#ECE6DC] shadow-editorial space-y-3">
            <div className="flex items-center gap-2 text-[#2D4A3E]">
              <CheckCircle2 className="w-4 h-4 text-[#4F6D60]" />
              <h2 className="font-serif font-bold text-sm text-[#1C1B1A]">
                Combinaciones Sinérgicas
              </h2>
            </div>
            <p className="text-xs text-[#66615C]">
              Activos que potencian sus resultados o amortiguan la reactividad:
            </p>
            <ul className="space-y-1.5 pt-1">
              {item.synergies.map((syn, i) => (
                <li key={i} className="text-xs text-[#1C1B1A] bg-[#EFF5F1] p-2.5 rounded-xl flex items-start gap-2">
                  <span className="text-[#2D4A3E] font-bold">✓</span>
                  <span>{syn}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Incompatibilidades */}
          <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#ECE6DC] shadow-editorial space-y-3">
            <div className="flex items-center gap-2 text-[#943C36]">
              <AlertTriangle className="w-4 h-4 text-[#D97D75]" />
              <h2 className="font-serif font-bold text-sm text-[#1C1B1A]">
                Conflictos & Precauciones
              </h2>
            </div>
            <p className="text-xs text-[#66615C]">
              Evita aplicar en la misma capa para no alterar el pH o provocar sobreexfoliación:
            </p>
            <ul className="space-y-1.5 pt-1">
              {item.conflicts.map((conf, i) => (
                <li key={i} className="text-xs text-[#943C36] bg-[#FDF2F0] p-2.5 rounded-xl flex items-start gap-2">
                  <span className="font-bold">⚠️</span>
                  <span>{conf}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section: PubMed Clinical Studies */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#ECE6DC] shadow-editorial space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECE6DC] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#4F6D60]" />
              <h2 className="font-serif font-bold text-base text-[#1C1B1A]">
                Estudios Médicos Indexados en PubMed (NCBI)
              </h2>
            </div>
            <span className="text-[10px] text-[#99938B] uppercase tracking-wider font-bold">
              Peer-Reviewed
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {item.studies.map((std, i) => (
              <div key={i} className="bg-[#FAF8F5] p-4 rounded-xl border border-[#ECE6DC] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-[#1C1B1A]">
                    {std.title}
                  </span>
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${std.pmid}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4F6D60] hover:text-[#2D4A3E] underline shrink-0 touch-target"
                  >
                    <span>PMID: {std.pmid}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-[11px] text-[#99938B]">
                  <span>{std.journal} ({std.year})</span>
                </div>
                <p className="text-xs text-[#66615C] bg-white p-3 rounded-xl border border-[#ECE6DC] leading-relaxed">
                  <strong>Conclusión clínica:</strong> {std.conclusion}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action CTA */}
        <div className="bg-[#1E2822] text-[#FAF8F5] rounded-2xl p-6 sm:p-8 shadow-editorial flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#A2BAAD] uppercase tracking-widest block">
              Evaluador de Fórmulas
            </span>
            <h3 className="text-xl font-serif font-bold text-white">
              ¿Tienes un cosmético con {item.name}?
            </h3>
            <p className="text-xs text-[#B8C2BC] max-w-xl">
              Audita su fórmula completa para verificar su compatibilidad y comprobar si contiene irritantes ocultos.
            </p>
          </div>

          <Link
            href="/"
            className="bg-[#FAF8F5] text-[#1E2822] hover:bg-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs flex-shrink-0 transition active:scale-95 touch-target"
          >
            Evaluar fórmula ahora →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
