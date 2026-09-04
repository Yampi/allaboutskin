'use client';

import React, { useState } from 'react';
import ScannerScreen from '@/components/mobile/ScannerScreen';
import IngredientDetailModal from '@/components/mobile/IngredientDetailModal';
import { useSkincare } from '@/context/SkincareContext';
import { ActiveIngredient } from '@/components/mobile/types';

export default function EscanerPage() {
  const { userProfile, addProductToShelf, updateProfile } = useSkincare();
  const [selectedIngredient, setSelectedIngredient] = useState<ActiveIngredient | null>(null);

  return (
    <div className="w-full">
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
