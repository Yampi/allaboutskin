import Link from 'next/link';
import { Microscope, ShieldAlert, HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 text-white mb-3">
              <Microscope className="w-6 h-6 text-teal-400" />
              <span className="text-xl font-bold">
                Allabout<span className="text-teal-400">.skin</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Plataforma tecnológica de auditoría científica y análisis dermatológico de cosméticos. Normalización frente a la base oficial de cosméticos de la UE (CosIng) e indexación directa con la literatura médica de PubMed (NCBI).
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Explorar</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-teal-400">Auditor INCI y OCR</Link></li>
              <li><Link href="/rutinas/skin-cycling" className="hover:text-teal-400">Guía Skin Cycling</Link></li>
              <li><Link href="/ingrediente" className="hover:text-teal-400">Biblioteca de Ingredientes</Link></li>
              <li><Link href="/ingrediente/niacinamide" className="hover:text-teal-400">Niacinamida (Vitamina B3)</Link></li>
              <li><Link href="/ingrediente/retinol" className="hover:text-teal-400">Retinol (Vitamina A)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Rigor Científico</h4>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
                <ShieldAlert className="w-4 h-4" />
                Aviso Médico
              </div>
              <p className="text-[11px] text-slate-400">
                La información provista es de carácter divulgativo y no reemplaza el diagnóstico o prescripción de un médico especialista en dermatología.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs flex flex-col sm:flex-row justify-between items-center text-slate-500 gap-4">
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
