'use client';

import React from 'react';
import IngredientCatalog from '@/components/ingredients/IngredientCatalog';
import UserAppShell from '@/components/navigation/UserAppShell';

export default function IngredienteRootPage() {
  return (
    <UserAppShell activeNavId="productos">
      <div className="w-full">
        <IngredientCatalog />
      </div>
    </UserAppShell>
  );
}
