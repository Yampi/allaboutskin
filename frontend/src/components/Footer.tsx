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
              <li className="pt-1.5 border-t border-[#2D3C33]/60"><Link href="/dashboard/empresa" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors flex items-center gap-1"><span>Portal Comercios & Vitrinas</span></Link></li>
              <li><Link href="/admin" className="text-slate-400 hover:text-white text-[11px] transition-colors">Administración Central</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="text-white font-serif font-bold text-xs uppercase tracking-wider">Marco Legal & Rigor</h4>
            <div className="bg-[#161F1A] p-3.5 rounded-lg border border-[#2D3C33] text-xs text-[#8E9C93] space-y-2">
              <div className="flex items-center gap-1.5 text-[#A2BAAD] font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Deslinde Médico & Sanitario</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#7C8A81]">
                Información de orientación dermocosmética sin carácter prescriptivo ni diagnóstico clínico. Conforme a la Ley de Ejercicio de la Medicina de Venezuela.
              </p>
            </div>

            <ul className="grid grid-cols-2 gap-2 text-[11px] text-[#8E9C93] pt-1">
              <li>
                <Link href="/aviso-medico" className="hover:text-white transition-colors underline-offset-2 hover:underline">
                  Aviso Médico Oficial
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-white transition-colors underline-offset-2 hover:underline">
                  Términos y Portal B2B
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-white transition-colors underline-offset-2 hover:underline">
                  Privacidad & OCR/AR
                </Link>
              </li>
              <li>
                <Link href="/estado" className="hover:text-white transition-colors underline-offset-2 hover:underline text-teal-400">
                  Estado & Uptime
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#2D3C33] text-[11px] flex flex-col sm:flex-row justify-between items-center text-[#6E7B73] gap-3">
          <p>© {new Date().getFullYear()} Allabout.skin. Ciencia, formulación y bienestar dérmico en Venezuela.</p>
          <div className="flex flex-wrap items-center gap-4 text-[10px] tracking-wider uppercase">
            <span>CosIng EU Reg. 1223/2009</span>
            <span>PubMed NCBI</span>
            <span className="text-teal-400 font-medium">DLG-EXEC 1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
