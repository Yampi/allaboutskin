import { useState, useCallback, useEffect } from 'react';
import {
  fetchBusinessStoreProfile,
  registerBusinessStore,
  claimBusinessStore,
  updateBusinessStoreProfile,
  BusinessStoreProfile,
} from '@/lib/api';

export function useStoreProfile(onToast?: (type: 'success' | 'error', message: string) => void) {
  const [store, setStore] = useState<BusinessStoreProfile | null>(null);
  const [hasStore, setHasStore] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const loadStoreProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchBusinessStoreProfile();
      if (res && res.store) {
        setStore(res.store);
        setHasStore(true);
      } else {
        setStore(null);
        setHasStore(false);
      }
    } catch (err: any) {
      if (err.status === 404 || err.message?.includes('404') || err.message?.includes('no encontrada')) {
        setStore(null);
        setHasStore(false);
      } else {
        console.error('Error al cargar perfil de tienda:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoreProfile();
  }, [loadStoreProfile]);

  const handleSaveProfile = useCallback(async (formData: {
    name: string;
    website_url?: string | null;
    instagram_handle?: string | null;
    whatsapp_contact?: string | null;
    logo_url?: string | null;
  }) => {
    setIsSavingProfile(true);
    try {
      const res = await updateBusinessStoreProfile(formData);
      onToast?.('success', 'Perfil del comercio guardado');
      if (res.store) setStore(res.store);
    } catch (err: any) {
      onToast?.('error', err.message || 'Error al actualizar perfil');
    } finally {
      setIsSavingProfile(false);
    }
  }, [onToast]);

  const handleRegisterStore = useCallback(async (data: {
    store_name: string;
    city: string;
    state: string;
    address: string;
    whatsapp: string;
    instagram_handle?: string;
  }) => {
    setIsOnboardingSubmitting(true);
    try {
      await registerBusinessStore(data);
      onToast?.('success', '¡Bienvenido a Allabout.skin! Tu tienda ha sido creada');
      await loadStoreProfile();
    } catch (err: any) {
      onToast?.('error', err.message || 'Error al registrar tu comercio');
    } finally {
      setIsOnboardingSubmitting(false);
    }
  }, [loadStoreProfile, onToast]);

  const handleClaimStore = useCallback(async (storeId: number) => {
    setIsOnboardingSubmitting(true);
    try {
      await claimBusinessStore({ store_id: storeId });
      onToast?.('success', '¡Tienda vinculada exitosamente!');
      await loadStoreProfile();
    } catch (err: any) {
      onToast?.('error', err.message || 'Error al vincular tienda');
    } finally {
      setIsOnboardingSubmitting(false);
    }
  }, [loadStoreProfile, onToast]);

  const copyStorefrontLink = useCallback((slug: string) => {
    const fullUrl = `${window.location.origin}/en-tienda/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    onToast?.('success', '¡Enlace de tu vitrina copiado!');
    setTimeout(() => setCopiedSlug(null), 3000);
  }, [onToast]);

  return {
    store,
    hasStore,
    isLoading,
    isSavingProfile,
    isOnboardingSubmitting,
    copiedSlug,
    loadStoreProfile,
    handleSaveProfile,
    handleRegisterStore,
    handleClaimStore,
    copyStorefrontLink,
  };
}
