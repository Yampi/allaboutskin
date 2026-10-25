'use client';

import React from 'react';
import { BusinessStoreProfile } from '@/lib/api';
import StoreProfileBadgeCard from './StoreProfileBadgeCard';
import StoreProfileForm from './StoreProfileForm';

interface StoreProfileTabProps {
  store: BusinessStoreProfile | null;
  onSaveProfile: (data: {
    name: string;
    website_url?: string | null;
    instagram_handle?: string | null;
    whatsapp_contact?: string | null;
    logo_url?: string | null;
  }) => Promise<void>;
  isSaving: boolean;
}

export default function StoreProfileTab({
  store,
  onSaveProfile,
  isSaving,
}: StoreProfileTabProps) {
  return (
    <div className="max-w-2xl space-y-4">
      <StoreProfileBadgeCard store={store} />
      <StoreProfileForm store={store} onSave={onSaveProfile} isSaving={isSaving} />
    </div>
  );
}
