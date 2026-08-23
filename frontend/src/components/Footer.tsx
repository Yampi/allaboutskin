import Link from 'next/link';
import { Microscope, ShieldAlert, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1E2822] text-[#B8C2BC] text-xs border-t border-[#2D3C33] mt-24 mb-16 md:mb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 mb-10">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-7 h-7 rounded-full bg-[#2D3C33] flex items-center justify-center text-[#7A9A8B]">
                <Sparkles className="w-3.5 h-3.5 text-[#A2BAAD]" />
              </div>
              <span className="text-lg font-serif font-bold tracking-tight">
                Allabout<span className="text-[#A2BAAD]">.skin</span>
              </span>
            </div>
            <p className="text-[#8E9C93] text-xs leading-relaxed max-w-sm">
              Plataforma editorial de análisis dermatológico y ciencia cosmética. Normalización frente al inventario europeo CosIng (Reg. CE 1223/2009) e indexación directa con la literatura médica de PubMed (NCBI).
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-white font-serif font-bold text-xs uppercase tracking-wider">Navegación</h4>
            <ul className="space-y-2 text-xs text-[#8E9C93]">
              <li><Link href="/" className="hover:text-white transition-colors">Analizador de Fórmulas & OCR</Link></li>
              <li><Link href="/comparador" className="hover:text-white transition-colors">Comparador de Fórmulas</Link></li>
              <li><Link href="/mi-rutina" className="hover:text-white transition-colors">Mi Rutina & Calendario</Link></li>
              <li><Link href="/rutinas/skin-cycling" className="hover:text-white transition-colors">Protocolo Skin Cycling</Link></li>
              <li><Link href="/ingrediente" className="hover:text-white transition-colors">Biblioteca de Activos</Link></li>
              <li><Link href="/ofertas" className="hover:text-white transition-colors">Catálogo Curado</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2.5">
            <h4 className="text-white font-serif font-bold text-xs uppercase tracking-wider">Rigor Científico</h4>
            <div className="bg-[#161F1A] p-3.5 rounded-2xl border border-[#2D3C33] text-xs text-[#8E9C93] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#A2BAAD] font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Aviso Divulgativo</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#7C8A81]">
                La información provista es de carácter divulgativo y no reemplaza el diagnóstico o prescripción médica personalizada de un especialista en dermatología.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#2D3C33] text-[11px] flex flex-col sm:flex-row justify-between items-center text-[#6E7B73] gap-3">
          <p>© {new Date().getFullYear()} Allabout.skin. Ciencia, formulación y bienestar dérmico.</p>
          <div className="flex space-x-6 text-[10px] tracking-wider uppercase">
            <span>CosIng EU Database</span>
            <span>PubMed NCBI E-Utilities</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
