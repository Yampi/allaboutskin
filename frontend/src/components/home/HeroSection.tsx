import React from 'react';
import { Microscope } from 'lucide-react';

export default function HeroSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full bg-[#E8DDD0] lg:bg-gradient-to-b lg:from-[#E8DDD0] lg:to-[#FAF8F5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-center lg:text-left">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#4F6D60] block">
              ✨ Ciencia de Skincare
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1C1B1A] leading-tight">
              Audita tu Skincare con Evidencia e IA
            </h1>
            <p className="text-sm text-[#66615C] max-w-lg mx-auto lg:mx-0">
              Analiza ingredientes, productos o fórmulas completas y descubre qué dice la evidencia científica antes de usarlos en tu piel.
            </p>
            
            <div className="mt-8">
              {children}
            </div>
          </div>
          
          <div className="hidden lg:flex justify-center items-center h-full min-h-[300px]">
            <div className="w-full max-w-md aspect-square rounded-2xl bg-[#F5EDE3] flex items-center justify-center border border-[#E0D8CB] shadow-sm relative overflow-hidden">
              <Microscope className="w-24 h-24 text-[#C4A882] opacity-50" />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
