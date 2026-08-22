import Link from 'next/link';
import { Microscope, ShieldAlert, HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1A2332] text-[#A69D94] text-sm border-t border-[#3D3D3D] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 text-white mb-3">
              <Microscope className="w-6 h-6 text-[#7BB8D0]" />
              <span className="text-xl font-bold">
                Allabout<span className="text-[#7BB8D0]">.skin</span>
              </span>
            </div>
            <p className="text-[#A69D94] text-xs leading-relaxed max-w-md">
              Plataforma tecnológica de auditoría científica y análisis dermatológico de cosméticos. Normalización frente a la base oficial de cosméticos de la UE (CosIng) e indexación directa con la literatura médica de PubMed (NCBI).
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Explorar</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-[#7BB8D0]">Auditor INCI y OCR</Link></li>
              <li><Link href="/rutinas/skin-cycling" className="hover:text-[#7BB8D0]">Guía Skin Cycling</Link></li>
              <li><Link href="/ingrediente" className="hover:text-[#7BB8D0]">Biblioteca de Ingredientes</Link></li>
              <li><Link href="/ingrediente/niacinamide" className="hover:text-[#7BB8D0]">Niacinamida (Vitamina B3)</Link></li>
              <li><Link href="/ingrediente/retinol" className="hover:text-[#7BB8D0]">Retinol (Vitamina A)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Rigor Científico</h4>
            <div className="bg-[#0F1721]/80 p-3 rounded-lg border border-[#5A5A5A] text-xs text-[#C5BBB2] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#7BB8D0] font-semibold">
                <ShieldAlert className="w-4 h-4" />
                Aviso Médico
              </div>
              <p className="text-[11px] text-[#A69D94]">
                La información provista es de carácter divulgativo y no reemplaza el diagnóstico o prescripción de un médico especialista en dermatología.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#3D3D3D] text-xs flex flex-col sm:flex-row justify-between items-center text-[#8B8178] gap-4">
          <p>© {new Date().getFullYear()} Allabout.skin. Todos los derechos reservados.</p>
          <div className="flex space-x-6">
            <span>CosIng EU Reg. (EC) No 1223/2009</span>
            <span>NCBI PubMed E-Utilities</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
