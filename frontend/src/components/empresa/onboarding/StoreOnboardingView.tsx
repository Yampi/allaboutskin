'use client';

import React, { useState } from 'react';
import StoreOnboardingCard from './StoreOnboardingCard';
import StoreRegisterForm from './StoreRegisterForm';
import StoreClaimSelect from './StoreClaimSelect';

interface StoreOnboardingViewProps {
  initialClaimSlug?: string;
  onRegister: (data: {
    store_name: string;
    city: string;
    state: string;
    address: string;
    whatsapp: string;
    instagram_handle?: string;
  }) => Promise<void>;
  onClaim: (payload: {
    store_slug: string;
    whatsapp?: string;
    verification_notes?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function StoreOnboardingView({
  initialClaimSlug = '',
  onRegister,
  onClaim,
  isSubmitting,
}: StoreOnboardingViewProps) {
  const [mode, setMode] = useState<'REGISTER' | 'CLAIM'>(() =>
    initialClaimSlug ? 'CLAIM' : 'REGISTER'
  );

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-6">
      <StoreOnboardingCard mode={mode} onModeChange={setMode} />

      {mode === 'REGISTER' ? (
        <StoreRegisterForm onSubmit={onRegister} isSubmitting={isSubmitting} />
      ) : (
        <StoreClaimSelect
          initialSlug={initialClaimSlug}
          onSubmit={onClaim}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
