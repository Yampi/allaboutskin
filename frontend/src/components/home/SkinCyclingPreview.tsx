import React from 'react';
import Link from 'next/link';

export default function SkinCyclingPreview() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#4F6D60] block">
          Exploración
        </span>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1C1B1A]">
          Skin Cycling
        </h2>
        <p className="text-sm text-[#66615C]">
          Un método estratégico de cuatro noches diseñado para optimizar el uso de ingredientes activos mientras se protege la barrera cutánea.
        </p>
        <Link 
          href="/rutinas/skin-cycling"
          className="inline-block mt-4 text-sm font-semibold text-white bg-[#4F6D60] hover:bg-[#3D5B4E] px-6 py-2.5 rounded-xl transition-colors"
        >
          Explorar Evidencia
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Noche 1 */}
        <div className="bg-white rounded-2xl border border-[#ECE6DC] overflow-hidden flex flex-col">
          <div className="h-32 bg-[#EFF5F1] w-full" />
          <div className="p-5 flex flex-col flex-grow items-center text-center space-y-2">
            <h3 className="font-serif font-bold text-lg text-[#1C1B1A]">Noche 1</h3>
            <span className="text-xs text-[#66615C]">Exfoliant</span>
            <Link href="/rutinas/skin-cycling" className="text-sm font-semibold text-[#4F6D60] mt-auto pt-4 hover:underline">
              Evaluar &rarr;
            </Link>
          </div>
        </div>

        {/* Noche 2 */}
        <div className="bg-white rounded-2xl border border-[#ECE6DC] overflow-hidden flex flex-col">
          <div className="h-32 bg-[#F5EDE3] w-full" />
          <div className="p-5 flex flex-col flex-grow items-center text-center space-y-2">
            <h3 className="font-serif font-bold text-lg text-[#1C1B1A]">Noche 2</h3>
            <span className="text-xs text-[#66615C]">Serum (Retinol)</span>
            <Link href="/rutinas/skin-cycling" className="text-sm font-semibold text-[#4F6D60] mt-auto pt-4 hover:underline">
              Evaluar &rarr;
            </Link>
          </div>
        </div>

        {/* Noche 3 */}
        <div className="bg-white rounded-2xl border border-[#ECE6DC] overflow-hidden flex flex-col">
          <div className="h-32 bg-[#FDF2F0] w-full" />
          <div className="p-5 flex flex-col flex-grow items-center text-center space-y-2">
            <h3 className="font-serif font-bold text-lg text-[#1C1B1A]">Noche 3 & 4</h3>
            <span className="text-xs text-[#66615C]">Recovery</span>
            <Link href="/rutinas/skin-cycling" className="text-sm font-semibold text-[#4F6D60] mt-auto pt-4 hover:underline">
              Evaluar &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
