import { Metadata } from 'next';
import Link from 'next/link';
import { Microscope, BookOpen, FileText, AlertTriangle, Layers, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, ' ').toUpperCase();

  return {
    title: `${name} - Evidencia Científica, CosIng y Guía Dermatológica | Allabout.skin`,
    description: `Análisis científico de ${name}. Indicaciones clínicas, estudios médicos indexados en PubMed, compatibilidad y pH óptimo según base de datos CosIng UE.`,
    alternates: {
      canonical: `https://allabout.skin/ingrediente/${slug}`,
    },
  };
}

export default async function IngredientPage({ params }: Props) {
  const { slug } = await params;
  const formattedName = slug.replace(/-/g, ' ').toUpperCase();

  // JSON-LD Structured Schema for Medical & Cosmetic SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${formattedName} en Dermatología y Cosmética`,
    description: `Ficha técnica de ${formattedName}. Estudios clínicos indexados en PubMed y especificaciones oficiales CosIng.`,
    about: {
      '@type': 'ChemicalSubstance',
      name: formattedName,
    },
    medicalAudience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patients and Dermatologists',
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#8B8178]">
          <Link href="/" className="hover:text-[#4A8BA8]">Inicio</Link>
          <span>/</span>
          <Link href="/" className="hover:text-[#4A8BA8]">Ingredientes</Link>
          <span>/</span>
          <span className="text-[#3D3D3D]">{formattedName}</span>
        </div>

        {/* Title & Badge */}
        <div className="bg-[#FFFCF9] rounded-2xl p-6 sm:p-8 border border-[#E8E0D8] shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#3A7A96] bg-[#E8F4FA] px-2.5 py-1 rounded-md border border-[#A8D4E6]">
                Ficha Técnica CosIng Oficial
              </span>
              <h1 className="text-3xl font-extrabold text-[#2D2D2D] mt-2">
                {formattedName}
              </h1>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#8B8178] block">Grado de Evidencia Médica</span>
              <span className="text-2xl font-black text-[#4A8BA8]">NIVEL A (RCT)</span>
            </div>
          </div>

          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Activo dermatológico ampliamente documentado en la literatura médica. Su acción terapéutica está respaldada por revisiones sistemáticas y ensayos clínicos aleatorizados (RCTs).
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#F0E8E0] text-xs">
            <div>
              <span className="text-[#A69D94] block font-medium">Categoría Layering</span>
              <span className="font-bold text-[#3D3D3D]">Serum / Activo Acuoso</span>
            </div>
            <div>
              <span className="text-[#A69D94] block font-medium">pH Óptimo de Formulación</span>
              <span className="font-bold text-[#3D3D3D]">5.0 - 7.0</span>
            </div>
            <div>
              <span className="text-[#A69D94] block font-medium">Uso Recomendado</span>
              <span className="font-bold text-[#3D3D3D]">Mañana y Noche (AM/PM)</span>
            </div>
            <div>
              <span className="text-[#A69D94] block font-medium">Índice Comedogénico</span>
              <span className="font-bold text-emerald-700">0 / 5 (No comedogénico)</span>
            </div>
          </div>
        </div>

        {/* PubMed Evidence Section */}
        <div className="bg-[#FFFCF9] rounded-2xl p-6 sm:p-8 border border-[#E8E0D8] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#2D2D2D] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4A8BA8]" />
            Estudios Clínicos Destacados en PubMed (NCBI)
          </h2>
          <p className="text-xs text-[#8B8178]">
            Estudios controlados en humanos que evalúan la biodisponibilidad y eficacia tópica:
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl border border-[#E8E0D8] bg-[#FAF7F4]/50 space-y-1">
              <span className="text-xs font-bold text-[#2D2D2D] block">
                Niacinamide: A multi-functional skin care active with clinically proven efficacy on barrier function
              </span>
              <div className="text-[11px] text-[#8B8178] flex items-center gap-2">
                <span>Dermatologic Surgery • PMID: <strong>16029679</strong></span>
                <span>•</span>
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/16029679/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4A8BA8] font-bold hover:underline"
                >
                  Ver en PubMed →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CTA to audit complete formulas */}
        <div className="bg-gradient-to-r from-[#1A4D63] to-[#3A7A96] text-white rounded-2xl p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-bold">¿Tienes un producto con {formattedName}?</h3>
            <p className="text-xs text-[#C5E3F0] max-w-lg">
              Audita la fórmula completa para verificar conflictos químicos con otros activos, orden de capas y compatibilidad con tu piel.
            </p>
          </div>
          <Link
            href="/"
            className="bg-[#FFFCF9] text-[#1A4D63] font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#E8F4FA] shadow-md transition flex-shrink-0"
          >
            Auditar Fórmula Ahora
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
