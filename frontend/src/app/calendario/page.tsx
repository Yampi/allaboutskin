'use client';

import React from 'react';
import Link from 'next/link';
import CycleScreen from '@/components/mobile/CycleScreen';
import { useSkincare } from '@/context/SkincareContext';
import { AlertTriangle, Sparkles, Layers, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CalendarioPage() {
  const { userProfile, completeNightRitual, conflicts, activeNightData } = useSkincare();

  return (
    <div className="w-full space-y-6">
      {/* Skincare Conflicts Alert Banner if any exist */}
      {conflicts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="space-y-2">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className={`p-4 rounded-[20px] border flex items-start gap-3.5 shadow-diffuse animate-in fade-in ${
                  conflict.severity === 'CRITICAL'
                    ? 'bg-[#FAF0ED] border-[#D8A899] text-[#943C36]'
                    : 'bg-[#FAF5EE] border-[#DFCAAC] text-[#7A5832]'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-current" />
                </div>
                <div className="flex-1 text-[13px]">
                  <h4 className="font-serif font-bold text-[15px] leading-snug">
                    {conflict.title}
                  </h4>
                  <p className="mt-0.5 opacity-90 leading-relaxed font-sans">
                    {conflict.description}
                  </p>
                  <p className="mt-1.5 font-medium text-[12px] bg-white/60 p-2 rounded-[12px] inline-block">
                    💡 <strong>Solución clínica:</strong> {conflict.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Cycle Screen */}
      <CycleScreen
        userProfile={userProfile}
        onCompleteNight={completeNightRitual}
      />
    </div>
  );
}
