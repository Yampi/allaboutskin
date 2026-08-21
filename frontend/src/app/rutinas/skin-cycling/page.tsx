import { Metadata } from 'next';
import Link from 'next/link';
import { Layers, Sparkles, Moon, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Guía Médica de Skin Cycling: Rutina de 4 Noches | SkinEvidence',
  description: 'Aprende cómo organizar tu rutina nocturna con Skin Cycling: Noche 1 Exfoliación, Noche 2 Retinoide, Noches 3 y 4 Recuperación de Barrera.',
};

export default function SkinCyclingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 uppercase tracking-wider">
            Metodología Dermatológica
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Protocolo Científico de Skin Cycling
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Estrategia de ciclado nocturno diseñada para maximizar la eficacia de los activos potentes (exfoliantes químicos y retinoides) minimizando la irritación y protegiendo la barrera lipídica.
          </p>
        </div>

        {/* 4 Nights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Night 1 */}
          <div className="bg-white rounded-2xl p-6 border-2 border-teal-500/40 shadow-sm space-y-4 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-sm">
              01
            </div>
            <div>
              <span className="text-xs font-bold text-teal-600 block uppercase">Noche 1</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Exfoliación Química</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Uso de hidroxiácidos (AHA como Ácido Glicólico o BHA como Ácido Salicílico) para desobstruir poros y remover células muertas superficiales.
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p><strong>Paso clave:</strong> Limpiar → Exfoliante químico → Hidratante calmante.</p>
            </div>
          </div>

          {/* Night 2 */}
          <div className="bg-white rounded-2xl p-6 border-2 border-indigo-500/40 shadow-sm space-y-4 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-sm">
              02
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-600 block uppercase">Noche 2</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Retinoide</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Aplicación de Retinol, Retinaldehído o Ácido Retinoico. Estimula la renovación celular profunda y la producción de colágeno sin interferencia de ácidos.
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p><strong>Paso clave:</strong> Piel completamente seca → Dosis del tamaño de un guisante.</p>
            </div>
          </div>

          {/* Night 3 */}
          <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500/40 shadow-sm space-y-4 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
              03
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 block uppercase">Noche 3</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Recuperación 1</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Descanso de activos transformadores. Enfoque exclusivo en hidratación profunda y reposición lipídica con ceramidas, centella asiática y ácido hialurónico.
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p><strong>Paso clave:</strong> Serums humectantes + Crema barrera reparadora.</p>
            </div>
          </div>

          {/* Night 4 */}
          <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500/40 shadow-sm space-y-4 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
              04
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 block uppercase">Noche 4</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Recuperación 2</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consolidación del estrato córneo. Asegura que la piel esté completamente restaurada antes de reiniciar el ciclo en la noche 1.
            </p>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p><strong>Paso clave:</strong> Hidratación rica + Oclusivo ligero según biotipo.</p>
            </div>
          </div>
        </div>

        {/* Auditor CTA */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <h3 className="text-xl font-bold text-slate-900">
            ¿Quieres saber cómo encajan tus productos en este ciclo?
          </h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Utiliza nuestro motor de auditoría para clasificar automáticamente tus serums y cremas en la fase adecuada del Skin Cycling.
          </p>
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-teal-600/20 transition"
            >
              Auditar Mis Productos para Skin Cycling
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
