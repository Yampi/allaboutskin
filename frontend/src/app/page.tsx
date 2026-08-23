import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import FormulaAuditor from '@/components/FormulaAuditor';
import ActiveCategoryPills from '@/components/home/ActiveCategoryPills';
import SkinCyclingPreview from '@/components/home/SkinCyclingPreview';
import SkinTypeSelector from '@/components/home/SkinTypeSelector';

export const metadata: Metadata = {
  title: 'Allabout.skin — Asesoría Científica & Verificador de Cosméticos',
  description: 'Audita fórmulas cosméticas, descubre si es solo publicidad o ciencia real, y construye tu rutina inteligente.',
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1B1A]">
      <Navbar />
      <main className="flex-grow">
        {/* Hero with embedded Formula Search */}
        <HeroSection>
          <FormulaAuditor />
        </HeroSection>
        
        {/* Active ingredient pills */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ActiveCategoryPills />
        </section>
        
        {/* Skin Cycling preview */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SkinCyclingPreview />
        </section>
        
        {/* Skin type selector */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SkinTypeSelector />
        </section>
      </main>
      <Footer />
    </div>
  );
}
