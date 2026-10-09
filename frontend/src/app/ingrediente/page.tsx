'use client';

import React from 'react';
import DidacticIngredientLibrary from '@/components/ingredients/DidacticIngredientLibrary';
import UserAppShell from '@/components/navigation/UserAppShell';

export default function IngredienteRootPage() {
  return (
    <UserAppShell activeNavId="productos">
      <div className="w-full">
        <DidacticIngredientLibrary />
      </div>
    </UserAppShell>
  );
}
