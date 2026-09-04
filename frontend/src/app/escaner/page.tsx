'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ScannerScreen from '@/components/mobile/ScannerScreen';
import IngredientDetailModal from '@/components/mobile/IngredientDetailModal';
import { useSkincare } from '@/context/SkincareContext';
import { ActiveIngredient } from '@/components/mobile/types';
import { ArrowLeft } from 'lucide-react';

export default function EscanerPage() {
  const { userProfile, addProductToShelf, updateProfile } = useSkincare();
  const [selectedIngredient, setSelectedIngredient] = useState<ActiveIngredient | null>(null);

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#4A6B5B] hover:text-[#3D5A4C] transition p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Panel Principal</span>
        </Link>
        <span className="text-[11px] font-mono text-[#7E756F]">
          Visión Dermatológica IA
        </span>
      </div>
      <ScannerScreen
        userProfile={userProfile}
        onAddProductToShelf={addProductToShelf}
        onUpdateProfile={updateProfile}
        onSelectIngredient={(ing) => setSelectedIngredient(ing)}
      />

      <IngredientDetailModal
        ingredient={selectedIngredient}
        onClose={() => setSelectedIngredient(null)}
      />
    </div>
  );
}
