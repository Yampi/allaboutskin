import React from 'react';
import Link from 'next/link';

const SKIN_TYPES = [
  { name: 'Mixta', color: 'bg-[#F5EDE3]' },
  { name: 'Grasa', color: 'bg-[#EFF5F1]' },
  { name: 'Típica', color: 'bg-[#FDF2F0]' },
  { name: 'Muy Bollada', color: 'bg-[#E8DDD0]' },
];

export default function SkinTypeSelector() {
  return (
    <div className="space-y-6 text-center">
      <h3 className="text-lg md:text-xl font-serif font-semibold text-[#1C1B1A]">
        Personaliza activos de piel
      </h3>
      <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
        {SKIN_TYPES.map((type) => (
          <Link key={type.name} href="/rutinas/skin-cycling" className="flex flex-col items-center gap-3 group">
            <div className={`w-20 h-20 rounded-full ${type.color} border border-[#ECE6DC] group-hover:shadow-md transition-shadow`} />
            <span className="text-sm font-medium text-[#1C1B1A]">{type.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
