'use client';

import React, { useState } from 'react';
import LibraryScreen from '@/components/mobile/LibraryScreen';
import IngredientDetailModal from '@/components/mobile/IngredientDetailModal';
import { ActiveIngredient } from '@/components/mobile/types';

export default function BibliotecaPage() {
  const [selectedIngredient, setSelectedIngredient] = useState<ActiveIngredient | null>(null);

  return (
    <div className="w-full">
      <LibraryScreen
        onSelectIngredient={(ing) => setSelectedIngredient(ing)}
      />

      <IngredientDetailModal
        ingredient={selectedIngredient}
        onClose={() => setSelectedIngredient(null)}
      />
    </div>
  );
}
