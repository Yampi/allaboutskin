'use client';

import React, { useState } from 'react';
import UserAppShell from '@/components/navigation/UserAppShell';
import ScannerScreen from '@/components/mobile/ScannerScreen';
import IngredientDetailModal from '@/components/mobile/IngredientDetailModal';
import type { ActiveIngredient } from '@/components/mobile/types';
import { useSkincare } from '@/context/SkincareContext';

export default function EscanerPage() {
  const { userProfile, updateProfile, addProductToShelf } = useSkincare();
  const [selectedIngredient, setSelectedIngredient] = useState<ActiveIngredient | null>(null);

  return (
    <UserAppShell activeNavId="analisis">
      <ScannerScreen
        onAddProductToShelf={addProductToShelf}
        onSelectIngredient={setSelectedIngredient}
        onUpdateProfile={updateProfile}
        userProfile={userProfile}
      />
      <IngredientDetailModal ingredient={selectedIngredient} onClose={() => setSelectedIngredient(null)} />
    </UserAppShell>
  );
}
