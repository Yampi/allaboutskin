import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { name: 'Niacinamida', href: '/ingrediente/niacinamide' },
  { name: 'Retinol', href: '/ingrediente/retinol' },
  { name: 'Ácido Salicílico', href: '/ingrediente/salicylic-acid' },
  { name: 'Skin Cycling', href: '/rutinas/skin-cycling' },
];

export default function ActiveCategoryPills() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="text-sm font-semibold text-[#1C1B1A] bg-white border border-[#ECE6DC] hover:border-[#4F6D60] hover:bg-[#EFF5F1] px-5 py-2.5 rounded-full transition-colors"
          >
            {cat.name}
          </Link>
        ))}
      </div>
      <Link 
        href="/ingrediente"
        className="text-sm font-semibold text-[#4F6D60] hover:text-[#2D4A3E] flex items-center gap-1 transition-colors"
      >
        Ver Biblioteca de activos
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
