'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Store,
  MapPin,
  DollarSign,
  TrendingUp,
  Package,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  Layers,
  Copy,
  Check,
  RefreshCw,
  Building2,
  Settings,
  HelpCircle,
  ShoppingBag,
  ArrowRight,
  Upload,
  FileSpreadsheet,
  Download,
  FileText,
  X,
  Home,
  Users,
  Tag,
  Bell,
} from 'lucide-react';
import StoreDashboardOverview from '@/components/dashboard/StoreDashboardOverview';
import {
  getCurrentUser,
  isUserBusiness,
  fetchBusinessStoreProfile,
  registerBusinessStore,
  claimBusinessStore,
  updateBusinessStoreProfile,
  fetchBusinessBranches,
  createBusinessBranch,
  updateBusinessBranch,
  deleteBusinessBranch,
  fetchBusinessOffers,
  createBusinessOffer,
  updateBusinessOffer,
  deleteBusinessOffer,
  bulkUpdateBusinessOffers,
  bulkImportBusinessCatalog,
  BulkImportItem,
  BulkImportResponse,
  fetchBusinessAnalytics,
  searchCatalogProducts,
  BusinessStoreProfile,
  BusinessBranchItem,
  BusinessOfferItem,
  BusinessAnalyticsData,
} from '@/lib/api';

function BusinessDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'inicio' | 'analytics' | 'catalog' | 'branches' | 'profile'>(() => {
    if (tabParam === 'analytics' || tabParam === 'catalog' || tabParam === 'branches' || tabParam === 'profile') {
      return tabParam;
    }
    return 'inicio';
  });

  useEffect(() => {
    if (tabParam === 'analytics' || tabParam === 'catalog' || tabParam === 'branches' || tabParam === 'profile') {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab('inicio');
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'inicio' | 'analytics' | 'catalog' | 'branches' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'inicio') {
      router.replace('/dashboard/empresa', { scroll: false });
    } else {
      router.replace(`/dashboard/empresa?tab=${tab}`, { scroll: false });
    }
  };

  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Store profile & state
  const [store, setStore] = useState<BusinessStoreProfile | null>(null);
  const [hasStore, setHasStore] = useState<boolean | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<BusinessAnalyticsData | null>(null);

  // Catalog / Offers state
  const [offers, setOffers] = useState<BusinessOfferItem[]>([]);
  const [offersPage, setOffersPage] = useState(1);
  const [offersTotalPages, setOffersTotalPages] = useState(1);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('');
  const [selectedStockFilter, setSelectedStockFilter] = useState('');
  const [exchangeRateInput, setExchangeRateInput] = useState('45.00');
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);

  // Branches state
  const [branches, setBranches] = useState<BusinessBranchItem[]>([]);
  const [maxBranches, setMaxBranches] = useState(1);

  // Modals state
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BusinessBranchItem | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // New Offer Form State
  const [productQuery, setProductQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [newOfferPrice, setNewOfferPrice] = useState('');
  const [newOfferPriceVes, setNewOfferPriceVes] = useState('');
  const [newOfferBranchId, setNewOfferBranchId] = useState('');
  const [newOfferInStock, setNewOfferInStock] = useState(true);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  // Bulk CSV Importer State (DLG-EXEC)
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRawText, setImportRawText] = useState('');
  const [importSelectedBranch, setImportSelectedBranch] = useState<string>('');
  const [importExchangeRate, setImportExchangeRate] = useState<string>('45.00');
  const [parsedImportRows, setParsedImportRows] = useState<Array<{
    barcode_ean?: string;
    name: string;
    brand?: string;
    price_usd: number;
    price_ves?: number;
    in_stock: boolean;
    product_url?: string;
    isValid: boolean;
    validationError?: string;
  }>>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResponse | null>(null);

  // New Branch Form State
  const [branchFormName, setBranchFormName] = useState('');
  const [branchFormCity, setBranchFormCity] = useState('');
  const [branchFormState, setBranchFormState] = useState('Guárico');
  const [branchFormAddress, setBranchFormAddress] = useState('');
  const [branchFormRefPoint, setBranchFormRefPoint] = useState('');
  const [branchFormPhone, setBranchFormPhone] = useState('');
  const [branchFormWhatsapp, setBranchFormWhatsapp] = useState('');
  const [branchFormHours, setBranchFormHours] = useState('Lunes a Sábado: 8:00 AM - 6:00 PM');
  const [branchFormLat, setBranchFormLat] = useState('9.2150000');
  const [branchFormLng, setBranchFormLng] = useState('-66.0100000');
  const [isSubmittingBranch, setIsSubmittingBranch] = useState(false);

  // Store Profile Edit State
  const [profileName, setProfileName] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileInstagram, setProfileInstagram] = useState('');
  const [profileWhatsapp, setProfileWhatsapp] = useState('');
  const [profileLogoUrl, setProfileLogoUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Onboarding Registration State
  const [onboardingStoreName, setOnboardingStoreName] = useState('');
  const [onboardingCity, setOnboardingCity] = useState('Valle de la Pascua');
  const [onboardingState, setOnboardingState] = useState('Guárico');
  const [onboardingAddress, setOnboardingAddress] = useState('');
  const [onboardingWhatsapp, setOnboardingWhatsapp] = useState('');
  const [onboardingInstagram, setOnboardingInstagram] = useState('');
  const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState(false);

  // Onboarding Mode & Claim State
  const claimQueryParam = searchParams.get('claim') || '';
  const [onboardingMode, setOnboardingMode] = useState<'REGISTER' | 'CLAIM'>(() => {
    return claimQueryParam ? 'CLAIM' : 'REGISTER';
  });
  const [claimTargetSlug, setClaimTargetSlug] = useState(claimQueryParam);
  const [claimWhatsapp, setClaimWhatsapp] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);

  useEffect(() => {
    if (claimQueryParam) {
      setClaimTargetSlug(claimQueryParam);
      setOnboardingMode('CLAIM');
    }
  }, [claimQueryParam]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimTargetSlug.trim()) {
      showToast('error', 'Por favor ingresa el nombre o identificador de la tienda a reclamar.');
      return;
    }
    setIsClaimSubmitting(true);
    try {
      const res = await claimBusinessStore({
        store_slug: claimTargetSlug.trim(),
        whatsapp: claimWhatsapp.trim() || undefined,
        verification_notes: claimNotes.trim() || undefined,
      });
      showToast('success', res.message || '¡Tienda reclamada con éxito!');
      await loadStoreProfile();
    } catch (err: any) {
      showToast('error', err.message || 'No se pudo reclamar la tienda.');
    } finally {
      setIsClaimSubmitting(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initial Load
  useEffect(() => {
    loadStoreProfile();
  }, []);

  const loadStoreProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetchBusinessStoreProfile();
      if (res.has_store && res.store) {
        setStore(res.store);
        setHasStore(true);
        setProfileName(res.store.name);
        setProfileWebsite(res.store.website_url || '');
        setProfileInstagram(res.store.instagram_handle || '');
        setProfileWhatsapp(res.store.whatsapp_contact || '');
        setProfileLogoUrl(res.store.logo_url || '');
      } else {
        setHasStore(false);
      }
    } catch (err: any) {
      console.error('Error loading store:', err);
      setHasStore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // When store is confirmed, load relevant data
  useEffect(() => {
    if (hasStore) {
      if (activeTab === 'analytics') {
        loadAnalytics();
      } else if (activeTab === 'catalog') {
        loadOffers();
        loadBranchesList();
      } else if (activeTab === 'branches') {
        loadBranchesList();
      }
    }
  }, [hasStore, activeTab, offersPage, selectedBranchFilter, selectedStockFilter]);

  const loadAnalytics = async () => {
    try {
      const data = await fetchBusinessAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadBranchesList = async () => {
    try {
      const res = await fetchBusinessBranches();
      setBranches(res.branches || []);
      setMaxBranches(res.max_allowed || 1);
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadOffers = async () => {
    try {
      const res = await fetchBusinessOffers({
        page: offersPage,
        search: catalogSearch,
        branch_id: selectedBranchFilter,
        in_stock: selectedStockFilter,
      });
      setOffers(res.offers?.data || []);
      setOffersTotalPages(res.offers?.last_page || 1);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Product live search for adding offer
  useEffect(() => {
    if (!productQuery.trim() || productQuery.length < 2) {
      setProductSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingProducts(true);
      try {
        const results = await searchCatalogProducts(productQuery);
        setProductSearchResults(results);
      } catch {
        setProductSearchResults([]);
      } finally {
        setIsSearchingProducts(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [productQuery]);

  // Bulk rate recalculation
  const handleBulkRecalculateRate = async () => {
    const rate = parseFloat(exchangeRateInput);
    if (!rate || rate <= 0) {
      showToast('error', 'Por favor ingrese una tasa de cambio válida');
      return;
    }
    setIsUpdatingRate(true);
    try {
      const res = await bulkUpdateBusinessOffers({ exchange_rate: rate });
      showToast('success', `¡Tasa aplicada! ${res.updated_count} productos actualizados a ${rate} Bs/$`);
      loadOffers();
      if (analytics) loadAnalytics();
    } catch (err: any) {
      showToast('error', err.message || 'Error al recalcular precios');
    } finally {
      setIsUpdatingRate(false);
    }
  };

  // Toggle single offer stock
  const handleToggleOfferStock = async (offer: BusinessOfferItem) => {
    try {
      await updateBusinessOffer(offer.id, { in_stock: !offer.in_stock });
      showToast('success', offer.in_stock ? 'Producto marcado como agotado' : 'Producto marcado en stock');
      loadOffers();
    } catch (err: any) {
      showToast('error', err.message || 'Error al cambiar stock');
    }
  };

  // Delete offer
  const handleDeleteOffer = async (offerId: number) => {
    if (!confirm('¿Deseas retirar este producto de tu inventario?')) return;
    try {
      await deleteBusinessOffer(offerId);
      showToast('success', 'Producto retirado de la vitrina');
      loadOffers();
    } catch (err: any) {
      showToast('error', err.message || 'Error al eliminar oferta');
    }
  };

  // Submit new offer
  const handleCreateOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      showToast('error', 'Seleccione un producto del catálogo');
      return;
    }
    const priceNum = parseFloat(newOfferPrice);
    if (!priceNum || priceNum <= 0) {
      showToast('error', 'Ingrese un precio válido en USD');
      return;
    }

    setIsSubmittingOffer(true);
    try {
      const priceVesNum = newOfferPriceVes
        ? parseFloat(newOfferPriceVes)
        : parseFloat((priceNum * (parseFloat(exchangeRateInput) || 45)).toFixed(2));

      await createBusinessOffer({
        product_id: selectedProduct.id,
        branch_id: newOfferBranchId ? parseInt(newOfferBranchId) : null,
        price: priceNum,
        price_ves: priceVesNum,
        in_stock: newOfferInStock,
      });

      showToast('success', `¡"${selectedProduct.name}" agregado a tu inventario!`);
      setShowAddOfferModal(false);
      setSelectedProduct(null);
      setProductQuery('');
      setNewOfferPrice('');
      setNewOfferPriceVes('');
      loadOffers();
      if (analytics) loadAnalytics();
    } catch (err: any) {
      showToast('error', err.message || 'Error al agregar producto');
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  // Bulk CSV parsing and import handlers (DLG-EXEC)
  const parseImportText = (text: string, rateStr: string) => {
    const rate = parseFloat(rateStr) || null;
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) {
      setParsedImportRows([]);
      return;
    }

    const firstLineLower = lines[0].toLowerCase();
    const hasHeader = firstLineLower.includes('producto') || firstLineLower.includes('nombre') || firstLineLower.includes('precio') || firstLineLower.includes('price');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const rows = dataLines.map((line) => {
      let delimiter = ',';
      if (line.includes('\t')) delimiter = '\t';
      else if (line.includes(';') && (line.match(/;/g)?.length || 0) >= (line.match(/,/g)?.length || 0)) delimiter = ';';

      const parts = line.split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ''));

      let barcode_ean = '';
      let name = '';
      let brand = '';
      let price_usd = 0;
      let price_ves: number | undefined = undefined;
      let in_stock = true;
      let product_url = '';

      if (parts.length === 1) {
        name = parts[0];
      } else if (parts.length === 2) {
        name = parts[0];
        price_usd = parseFloat(parts[1].replace(/[^0-9.]/g, '')) || 0;
      } else if (parts.length === 3) {
        if (/^\d{8,14}$/.test(parts[0])) {
          barcode_ean = parts[0];
          name = parts[1];
          price_usd = parseFloat(parts[2].replace(/[^0-9.]/g, '')) || 0;
        } else {
          name = parts[0];
          brand = parts[1];
          price_usd = parseFloat(parts[2].replace(/[^0-9.]/g, '')) || 0;
        }
      } else if (parts.length >= 4) {
        if (/^\d{8,14}$/.test(parts[0])) {
          barcode_ean = parts[0];
          name = parts[1];
          brand = parts[2];
          price_usd = parseFloat(parts[3].replace(/[^0-9.]/g, '')) || 0;
          if (parts[4]) price_ves = parseFloat(parts[4].replace(/[^0-9.]/g, '')) || undefined;
          if (parts[5]) in_stock = !['no', '0', 'false', 'agotado'].includes(parts[5].toLowerCase());
          if (parts[6]) product_url = parts[6];
        } else {
          name = parts[0];
          brand = parts[1];
          price_usd = parseFloat(parts[2].replace(/[^0-9.]/g, '')) || 0;
          if (parts[3]) price_ves = parseFloat(parts[3].replace(/[^0-9.]/g, '')) || undefined;
          if (parts[4]) in_stock = !['no', '0', 'false', 'agotado'].includes(parts[4].toLowerCase());
          if (parts[5]) product_url = parts[5];
        }
      }

      if (!price_ves && rate && price_usd > 0) {
        price_ves = Math.round(price_usd * rate * 100) / 100;
      }

      const isValid = name.trim().length > 1 && price_usd > 0;
      const validationError = !name.trim()
        ? 'Nombre requerido'
        : price_usd <= 0
        ? 'Precio USD inválido'
        : undefined;

      return {
        barcode_ean: barcode_ean || undefined,
        name,
        brand: brand || undefined,
        price_usd,
        price_ves,
        in_stock,
        product_url: product_url || undefined,
        isValid,
        validationError,
      };
    });

    setParsedImportRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      setImportRawText(content);
      parseImportText(content, importExchangeRate);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const templateContent = "codigo_barras,producto,marca,precio_usd,stock,enlace\n7501234567890,Effaclar Gel Purificante 200ml,La Roche-Posay,18.50,si,https://wa.me/584141234567\n3337875597180,CeraVe Crema Hidratante 454g,CeraVe,24.00,si,https://wa.me/584141234567\n7591234567890,Protector Solar FPS 50+ Facial,Valmy,12.00,si,https://wa.me/584141234567";
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_catalogo_allaboutskin.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = async () => {
    const validRows = parsedImportRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      showToast('error', 'No hay filas válidas para importar.');
      return;
    }

    setIsImporting(true);
    try {
      const payloadItems: BulkImportItem[] = validRows.map((r) => ({
        barcode_ean: r.barcode_ean,
        name: r.name,
        brand: r.brand,
        price_usd: r.price_usd,
        price_ves: r.price_ves,
        in_stock: r.in_stock,
        product_url: r.product_url,
      }));

      const res = await bulkImportBusinessCatalog({
        branch_id: importSelectedBranch ? parseInt(importSelectedBranch) : null,
        exchange_rate: parseFloat(importExchangeRate) || undefined,
        items: payloadItems,
      });

      setImportResult(res);
      showToast('success', res.message);
      loadOffers();
      loadAnalytics();
    } catch (err: any) {
      showToast('error', err.message || 'Error al procesar la importación.');
    } finally {
      setIsImporting(false);
    }
  };

  // Submit new branch
  const handleCreateBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchFormName || !branchFormAddress || !branchFormCity) {
      showToast('error', 'Complete los campos obligatorios de la sucursal');
      return;
    }

    setIsSubmittingBranch(true);
    try {
      if (editingBranch) {
        await updateBusinessBranch(editingBranch.id, {
          name: branchFormName,
          city: branchFormCity,
          state: branchFormState,
          address: branchFormAddress,
          reference_point: branchFormRefPoint,
          phone: branchFormPhone,
          whatsapp: branchFormWhatsapp,
          opening_hours: branchFormHours,
          latitude: parseFloat(branchFormLat) || 9.215,
          longitude: parseFloat(branchFormLng) || -66.01,
        });
        showToast('success', 'Sucursal actualizada con éxito');
      } else {
        await createBusinessBranch({
          name: branchFormName,
          city: branchFormCity,
          state: branchFormState,
          address: branchFormAddress,
          reference_point: branchFormRefPoint,
          phone: branchFormPhone,
          whatsapp: branchFormWhatsapp,
          opening_hours: branchFormHours,
          latitude: parseFloat(branchFormLat) || 9.215,
          longitude: parseFloat(branchFormLng) || -66.01,
        });
        showToast('success', '¡Nueva sucursal creada con éxito!');
      }

      setShowAddBranchModal(false);
      setEditingBranch(null);
      resetBranchForm();
      loadBranchesList();
      loadStoreProfile();
    } catch (err: any) {
      showToast('error', err.message || 'Error al guardar sucursal');
    } finally {
      setIsSubmittingBranch(false);
    }
  };

  const resetBranchForm = () => {
    setBranchFormName('');
    setBranchFormCity('');
    setBranchFormState('Guárico');
    setBranchFormAddress('');
    setBranchFormRefPoint('');
    setBranchFormPhone('');
    setBranchFormWhatsapp('');
    setBranchFormHours('Lunes a Sábado: 8:00 AM - 6:00 PM');
    setBranchFormLat('9.2150000');
    setBranchFormLng('-66.0100000');
  };

  const handleDeleteBranch = async (branchId: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta sede? Sus ofertas vinculadas deberán reasignarse.')) return;
    try {
      await deleteBusinessBranch(branchId);
      showToast('success', 'Sucursal eliminada');
      loadBranchesList();
      loadStoreProfile();
    } catch (err: any) {
      showToast('error', err.message || 'Error al eliminar sucursal');
    }
  };

  // Submit profile edit
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await updateBusinessStoreProfile({
        name: profileName,
        website_url: profileWebsite || null,
        instagram_handle: profileInstagram ? profileInstagram.replace('@', '') : null,
        whatsapp_contact: profileWhatsapp || null,
        logo_url: profileLogoUrl || null,
      });
      showToast('success', 'Perfil del comercio guardado');
      if (res.store) {
        setStore(res.store);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error al actualizar perfil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Copy Vitrina URL
  const copyStorefrontLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/en-tienda/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    showToast('success', '¡Enlace de tu vitrina copiado! Pégalo en tu bio de Instagram o WhatsApp');
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  // Onboarding submit
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingStoreName || !onboardingWhatsapp || !onboardingAddress || !onboardingCity) {
      showToast('error', 'Por favor llena todos los datos requeridos');
      return;
    }
    setIsOnboardingSubmitting(true);
    try {
      await registerBusinessStore({
        store_name: onboardingStoreName,
        city: onboardingCity,
        state: onboardingState,
        address: onboardingAddress,
        whatsapp: onboardingWhatsapp,
        instagram_handle: onboardingInstagram ? onboardingInstagram.replace('@', '') : undefined,
      });
      showToast('success', '¡Bienvenido a Allabout.skin! Tu tienda ha sido creada');
      loadStoreProfile();
    } catch (err: any) {
      showToast('error', err.message || 'Error al registrar tu comercio');
    } finally {
      setIsOnboardingSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Cargando consola comercial...</p>
      </div>
    );
  }

  // ================= ONBOARDING SCREEN IF NO STORE =================
  if (hasStore === false) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 animate-in fade-in zoom-in-95">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal de Comercios & Farmacias</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Crea tu Vitrina Digital en Allabout.skin
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Publica tu inventario dermatológico, conecta con clientes de tu ciudad y recibe pedidos directos por WhatsApp con precios en USD y Bs.
          </p>
        </div>

        {notification && (
          <div className={`p-4 rounded-xl text-sm font-medium border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
            {notification.message}
          </div>
        )}

        {/* Toggle Mode: Registrar vs Reclamar */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setOnboardingMode('REGISTER')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              onboardingMode === 'REGISTER'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Tienda Nueva</span>
          </button>
          <button
            type="button"
            onClick={() => setOnboardingMode('CLAIM')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              onboardingMode === 'CLAIM'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reclamar Tienda Existente</span>
          </button>
        </div>

        {onboardingMode === 'CLAIM' ? (
          <form onSubmit={handleClaimSubmit} className="bg-slate-900/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
            <div className="bg-teal-950/40 border border-teal-500/30 rounded-2xl p-4 text-xs text-teal-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-teal-300">
                <Store className="w-4 h-4 text-teal-400" />
                Toma el control de tu comercio ya catalogado
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Si tu tienda o farmacia ya aparece en nuestro directorio público o mapa de precios, reclama su titularidad para fijar tus precios oficiales en $ y Bs, actualizar tu WhatsApp y recibir pedidos directos.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                Nombre o Identificador (Slug) de la Tienda *
              </label>
              <input
                type="text"
                required
                value={claimTargetSlug}
                onChange={(e) => setClaimTargetSlug(e.target.value)}
                placeholder="Ej. locatel-valle-de-la-pascua o farmatodo"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Ingresa el slug o identificador que aparece en el enlace de tu tienda en el directorio.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                WhatsApp de Ventas Comercial *
              </label>
              <input
                type="text"
                required
                value={claimWhatsapp}
                onChange={(e) => setClaimWhatsapp(e.target.value)}
                placeholder="+58 412 1234567"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Número oficial donde tus clientes te contactarán para consultar stock y compras.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                Notas de Verificación o Cargo Comercial (Opcional)
              </label>
              <textarea
                rows={3}
                value={claimNotes}
                onChange={(e) => setClaimNotes(e.target.value)}
                placeholder="Ej. Soy el gerente general de la sede de Valle de la Pascua."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isClaimSubmitting}
              className="w-full mt-4 py-3 bg-teal-600 hover:bg-teal-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isClaimSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Reclamar Tienda y Tomar Control</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOnboardingSubmit} className="bg-slate-900/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                Nombre de la Tienda o Farmacia *
              </label>
              <input
                type="text"
                required
                value={onboardingStoreName}
                onChange={(e) => setOnboardingStoreName(e.target.value)}
                placeholder="Ej. Farmacia San Judas Tadeo / Belleza Pura Skincare"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  Ciudad *
                </label>
                <input
                  type="text"
                  required
                  value={onboardingCity}
                  onChange={(e) => setOnboardingCity(e.target.value)}
                  placeholder="Ej. Valle de la Pascua"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  Estado *
                </label>
                <input
                  type="text"
                  required
                  value={onboardingState}
                  onChange={(e) => setOnboardingState(e.target.value)}
                  placeholder="Ej. Guárico"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                Dirección de la Sede Principal *
              </label>
              <input
                type="text"
                required
                value={onboardingAddress}
                onChange={(e) => setOnboardingAddress(e.target.value)}
                placeholder="Ej. Calle Real con Av. Rómulo Gallegos, Local 3"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  WhatsApp de Ventas *
                </label>
                <input
                  type="text"
                  required
                  value={onboardingWhatsapp}
                  onChange={(e) => setOnboardingWhatsapp(e.target.value)}
                  placeholder="+58 412 1234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  Instagram (Opcional)
                </label>
                <input
                  type="text"
                  value={onboardingInstagram}
                  onChange={(e) => setOnboardingInstagram(e.target.value)}
                  placeholder="@tutienda"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isOnboardingSubmitting}
              className="w-full mt-4 py-3 bg-teal-600 hover:bg-teal-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isOnboardingSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Store className="w-4 h-4" />
                  <span>Crear Tienda & Empezar Gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Store Nav items
  const storeNavItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'analytics', label: 'Ventas', icon: TrendingUp },
    { id: 'catalog', label: 'Productos', icon: Package },
    { id: 'inventario', label: 'Inventario', icon: Layers },
    { id: 'branches', label: 'Sucursales', icon: MapPin },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'promociones', label: 'Promociones', icon: Tag },
    { id: 'reportes', label: 'Reportes', icon: FileText },
    { id: 'profile', label: 'Perfil', icon: Settings },
  ];

  // ================= MAIN BUSINESS DASHBOARD =================
  return (
    <div className="min-h-screen bg-[#F0F7FF] text-slate-800 flex flex-col lg:flex-row antialiased selection:bg-sky-100 selection:text-sky-900 font-sans pb-16 lg:pb-0">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2">
          <div
            className={`px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-2.5 ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-red-950/90 border-red-500/50 text-red-200'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. SIDEBAR DESKTOP (Azul B2B DLG-HYBRID)                  */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-sky-100 sticky top-0 h-screen justify-between p-5 shrink-0 z-20">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2.5 px-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-sky-200 group-hover:scale-105 transition">
              <Store className="w-4 h-4" />
            </div>
            <div className="font-bold text-lg text-slate-900 tracking-tight">
              allabout<span className="text-sky-600">.skin</span>
            </div>
          </Link>

          <nav className="space-y-1">
            {storeNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'inventario' && activeTab === 'catalog');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'inventario') handleTabChange('catalog');
                    else if (item.id === 'clientes' || item.id === 'promociones' || item.id === 'reportes') handleTabChange('inicio');
                    else handleTabChange(item.id as any);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-sky-100/80 text-sky-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Brand Philosophy Badge (Mockup Footer Card B2B) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-sky-950 leading-snug">
              Más visibilidad, <span className="text-sky-600 font-bold">más ventas.</span>
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Vitrina comercial activa
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN CONTAINER                                         */}
      {/* ========================================================= */}
      <main className="flex-1 min-w-0 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* TOPBAR: Buscador & Perfil de la tienda */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar productos, clientes, etc."
              className="w-full bg-white border border-sky-100 rounded-full pl-9 pr-4 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 transition shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 shrink-0">
            {branches.length > 0 && (
              <Link
                href={`/en-tienda/${branches[0].slug}`}
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold rounded-full transition shadow-2xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Ver vitrina en vivo</span>
                <ExternalLink className="w-3 h-3 text-sky-500" />
              </Link>
            )}

            <button
              type="button"
              className="w-9 h-9 rounded-full bg-white border border-sky-100 flex items-center justify-center text-slate-500 hover:text-sky-600 transition shadow-2xs relative"
              aria-label="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-sky-500 absolute top-2 right-2 ring-2 ring-white" />
            </button>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-2.5 bg-white border border-sky-100 rounded-full py-1 pl-1 pr-3.5 shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center overflow-hidden border border-sky-200">
                {store?.name ? store.name.charAt(0) : 'F'}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {store?.name || 'Farmacia Los Andes'}
                </div>
                <div className="text-[10px] text-sky-600 font-semibold leading-none">
                  Dueño de tienda
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 0: INICIO (MOCKUP AZUL B2B OVERVIEW) */}
        {activeTab === 'inicio' && (
          <StoreDashboardOverview
            store={store}
            analytics={analytics}
            onNavigateTab={handleTabChange}
            branchCount={branches.length}
          />
        )}

        {/* SI NO ES INICIO: Mostrar barra de pestañas para acceder a las herramientas de gestión */}
        {activeTab !== 'inicio' && (
          <div className="flex items-center gap-2 border-b border-sky-100 pb-px overflow-x-auto">
            <button
              onClick={() => handleTabChange('inicio')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition"
            >
              <Home className="w-4 h-4" />
              <span>← Volver al Resumen</span>
            </button>

            {[
              { id: 'analytics', label: 'Ventas & Leads', icon: TrendingUp },
              { id: 'catalog', label: 'Catálogo & Precios', icon: Package },
              { id: 'branches', label: 'Sucursales Físicas', icon: MapPin },
              { id: 'profile', label: 'Perfil del Comercio', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                    isActive
                      ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

      {/* ================= TAB 1: ANALYTICS & LEADS ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leads Totales (30d)</span>
                <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-white mt-2">
                {analytics?.leads_summary_30d?.total_leads || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Interacciones de clientes interesados</p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-emerald-500/20 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pedidos WhatsApp</span>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-400 mt-2">
                {analytics?.leads_summary_30d?.whatsapp_clicks || 0}
              </div>
              <p className="text-xs text-emerald-500/80 mt-1">Clics para compra inmediata</p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catálogo Activo</span>
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-purple-300 mt-2">
                {analytics?.inventory?.in_stock_offers || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                De {analytics?.inventory?.total_offers || 0} ofertas registradas
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Precio Promedio</span>
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-amber-300 mt-2">
                ${analytics?.inventory?.average_price_usd || '0.00'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Ticket medio de tu inventario</p>
            </div>
          </div>

          {/* Performance By Branch & Marketing Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>Rendimiento por Sucursal</span>
              </h3>

              {(!analytics?.branches_performance || analytics.branches_performance.length === 0) ? (
                <p className="text-sm text-slate-500 py-4">Aún no hay datos registrados para tus sucursales.</p>
              ) : (
                <div className="space-y-3">
                  {analytics.branches_performance.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800/80"
                    >
                      <div>
                        <div className="font-bold text-white text-sm">{b.name}</div>
                        <div className="text-xs text-slate-400">{b.city} &bull; {b.offers_count} productos en vitrina</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-teal-300">{b.leads_count}</div>
                        <div className="text-[11px] text-slate-500">leads generados</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vitrina Booster Card */}
            <div className="bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-teal-500/20 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-[10px] font-black uppercase">
                  Consejo de Ventas
                </span>
                <h4 className="text-base font-bold text-white">¿Cómo vender más con tu Vitrina Digital?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Coloca el enlace de tu vitrina en la biografía de Instagram de tu tienda y en tus historias de WhatsApp.
                  Los clientes podrán ver qué productos dermatológicos tienes disponibles con su precio al cambio del día sin tener que preguntar precios uno por uno.
                </p>
              </div>

              {branches.length > 0 && (
                <button
                  onClick={() => copyStorefrontLink(branches[0].slug)}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Enlace de mi Vitrina</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CATALOG & PRICING ================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* BULK EXCHANGE RATE BAR */}
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 p-5 rounded-2xl border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <RefreshCw className="w-4 h-4" />
                <span>Actualizador Masivo de Tasa de Cambio (USD &rarr; VES)</span>
              </div>
              <p className="text-xs text-slate-400">
                Cambia la tasa oficial del día y recalcula instantáneamente los precios en Bolívares (Bs) de todos tus productos en vitrina.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">Bs/$</span>
                <input
                  type="number"
                  step="0.10"
                  value={exchangeRateInput}
                  onChange={(e) => setExchangeRateInput(e.target.value)}
                  className="w-28 bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                onClick={handleBulkRecalculateRate}
                disabled={isUpdatingRate}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isUpdatingRate ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Recalcular Todos</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Header & Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 w-full gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar en tu catálogo por producto o marca..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadOffers()}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                />
              </div>

              {branches.length > 1 && (
                <select
                  value={selectedBranchFilter}
                  onChange={(e) => {
                    setSelectedBranchFilter(e.target.value);
                    setOffersPage(1);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="">Todas las Sedes</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={selectedStockFilter}
                onChange={(e) => {
                  setSelectedStockFilter(e.target.value);
                  setOffersPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="">Todos los Estados</option>
                <option value="true">Solo en Stock</option>
                <option value="false">Solo Agotados</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(true);
                  setImportResult(null);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                title="Carga masiva de productos vía CSV o Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                <span>Importar CSV / Lote</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null);
                  setProductQuery('');
                  setNewOfferPrice('');
                  setNewOfferPriceVes('');
                  setShowAddOfferModal(true);
                }}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-teal-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir Producto</span>
              </button>
            </div>
          </div>

          {/* Catalog Offers Table */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Producto</th>
                    <th className="py-4 px-6">Marca</th>
                    <th className="py-4 px-6">Precio USD</th>
                    <th className="py-4 px-6">Precio VES (Bs)</th>
                    <th className="py-4 px-6">Sucursal</th>
                    <th className="py-4 px-6">Disponibilidad</th>
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {offers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No tienes productos agregados con los filtros actuales. ¡Haz clic en "Añadir Producto a Vitrina" para empezar!
                      </td>
                    </tr>
                  ) : (
                    offers.map((offer) => (
                      <tr key={offer.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 font-bold shrink-0 overflow-hidden">
                              {offer.product?.image_url ? (
                                <img src={offer.product.image_url} alt={offer.product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-slate-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{offer.product?.name}</div>
                              <div className="text-xs text-slate-500">{offer.product?.category || 'Cuidado Facial'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-semibold text-slate-300">
                          {offer.product?.brand?.name || 'Genérico / Importado'}
                        </td>

                        <td className="py-4 px-6 font-black text-teal-400">
                          ${offer.price}
                        </td>

                        <td className="py-4 px-6 font-black text-amber-300">
                          {offer.price_ves ? `Bs. ${offer.price_ves}` : '-'}
                        </td>

                        <td className="py-4 px-6 text-xs text-slate-400">
                          {offer.branch?.name || 'Todas las sedes'}
                        </td>

                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleOfferStock(offer)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                              offer.in_stock
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {offer.in_stock ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            <span>{offer.in_stock ? 'En Stock' : 'Agotado'}</span>
                          </button>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition"
                            title="Retirar de vitrina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {offersTotalPages > 1 && (
              <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Página {offersPage} de {offersTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={offersPage <= 1}
                    onClick={() => setOffersPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg disabled:opacity-40 transition"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={offersPage >= offersTotalPages}
                    onClick={() => setOffersPage((p) => Math.min(offersTotalPages, p + 1))}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg disabled:opacity-40 transition"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: BRANCHES & PHYSICAL STORES ================= */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          {/* Plan limit indicator */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Límite de Sedes Físicas</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                Has utilizado <span className="text-teal-400 font-bold">{branches.length}</span> de{' '}
                <span className="font-bold">{maxBranches}</span> sede(s) permitidas en tu {store?.subscription_tier_label || 'Plan Básico'}.
              </div>
            </div>

            {branches.length >= maxBranches && store?.subscription_tier === 'FREE' && (
              <div className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Actualiza a Pro Local para hasta 5 sedes</span>
              </div>
            )}

            <button
              onClick={() => {
                if (branches.length >= maxBranches) {
                  showToast('error', `Has alcanzado el límite de ${maxBranches} sede(s) de tu plan.`);
                  return;
                }
                setEditingBranch(null);
                resetBranchForm();
                setShowAddBranchModal(true);
              }}
              disabled={branches.length >= maxBranches}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-teal-600/20 disabled:opacity-40 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Sucursal</span>
            </button>
          </div>

          {/* Branch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {branches.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-white">{b.name}</h4>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Activa
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{b.address}, {b.city}, {b.state}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingBranch(b);
                        setBranchFormName(b.name);
                        setBranchFormCity(b.city);
                        setBranchFormState(b.state);
                        setBranchFormAddress(b.address);
                        setBranchFormRefPoint(b.reference_point || '');
                        setBranchFormPhone(b.phone || '');
                        setBranchFormWhatsapp(b.whatsapp || '');
                        setBranchFormHours(b.opening_hours || 'Lunes a Sábado: 8:00 AM - 6:00 PM');
                        setBranchFormLat(b.latitude ? b.latitude.toString() : '9.215');
                        setBranchFormLng(b.longitude ? b.longitude.toString() : '-66.01');
                        setShowAddBranchModal(true);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                      title="Editar sucursal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {branches.length > 1 && (
                      <button
                        onClick={() => handleDeleteBranch(b.id)}
                        className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition"
                        title="Eliminar sucursal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {b.whatsapp && (
                    <p className="flex items-center gap-1.5 text-emerald-400">
                      <Phone className="w-3 h-3" />
                      <span>WhatsApp de pedidos: {b.whatsapp}</span>
                    </p>
                  )}
                  {b.opening_hours && (
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{b.opening_hours}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    Geolocalización: {b.latitude}, {b.longitude} (Radio de detección: {b.geofence_radius_meters}m)
                  </p>
                </div>

                {/* Vitrina Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={`/en-tienda/${b.slug}`}
                    target="_blank"
                    className="flex-1 py-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Ver Vitrina</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => copyStorefrontLink(b.slug)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1"
                    title="Copiar enlace público"
                  >
                    {copiedSlug === b.slug ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Enlace</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: STORE PROFILE ================= */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Configuración del Comercio</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Esta información es visible para los clientes en las recomendaciones de rutinas y en tu vitrina.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                Nombre de la Empresa o Farmacia
              </label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                Sitio Web Oficial (Opcional)
              </label>
              <input
                type="url"
                value={profileWebsite}
                onChange={(e) => setProfileWebsite(e.target.value)}
                placeholder="https://tutienda.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  Usuario de Instagram
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                  <input
                    type="text"
                    value={profileInstagram}
                    onChange={(e) => setProfileInstagram(e.target.value)}
                    placeholder="tufarmacia"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  WhatsApp de Contacto Central
                </label>
                <input
                  type="text"
                  value={profileWhatsapp}
                  onChange={(e) => setProfileWhatsapp(e.target.value)}
                  placeholder="+58 412 1234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                URL del Logo / Imagen de la Tienda (Opcional)
              </label>
              <input
                type="url"
                value={profileLogoUrl}
                onChange={(e) => setProfileLogoUrl(e.target.value)}
                placeholder="https://ejemplo.com/logo.jpg"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl transition shadow-lg shadow-teal-600/20 disabled:opacity-50"
              >
                {isSavingProfile ? 'Guardando...' : 'Guardar Perfil'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: ADD OFFER TO INVENTORY ================= */}
      {showAddOfferModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">Añadir Producto a tu Vitrina</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Busca el producto en la base científica de Allabout.skin y asígnale tu precio.
                </p>
              </div>
              <button
                onClick={() => setShowAddOfferModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateOfferSubmit} className="space-y-4">
              {/* Product search box */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  1. Buscar Producto en el Catálogo *
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Escribe el nombre del producto o marca (ej. Cerave, La Roche-Posay, Niacinamida)..."
                    value={productQuery}
                    onChange={(e) => {
                      setProductQuery(e.target.value);
                      if (selectedProduct) setSelectedProduct(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                  {isSearchingProducts && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {/* Search dropdown results */}
                {productSearchResults.length > 0 && !selectedProduct && (
                  <div className="mt-2 bg-slate-950 border border-slate-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-850 shadow-xl">
                    {productSearchResults.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setSelectedProduct(prod);
                          setProductQuery(prod.name);
                          setProductSearchResults([]);
                        }}
                        className="p-3 hover:bg-slate-800/60 cursor-pointer transition flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                          {prod.image_url ? (
                            <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{prod.name}</div>
                          <div className="text-xs text-teal-400">{prod.brand?.name || 'Marca dermatológica'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedProduct && (
                  <div className="mt-2 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-teal-400" />
                      <div>
                        <div className="text-xs font-bold text-white">{selectedProduct.name}</div>
                        <div className="text-[11px] text-teal-300">{selectedProduct.brand?.name}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setProductQuery('');
                      }}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>

              {/* Prices grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                    Precio en USD ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="15.00"
                      value={newOfferPrice}
                      onChange={(e) => {
                        setNewOfferPrice(e.target.value);
                        const val = parseFloat(e.target.value);
                        const rate = parseFloat(exchangeRateInput) || 45;
                        if (val && val > 0) {
                          setNewOfferPriceVes((val * rate).toFixed(2));
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                    Precio en Bs (VES)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Bs</span>
                    <input
                      type="number"
                      step="0.10"
                      placeholder="675.00"
                      value={newOfferPriceVes}
                      onChange={(e) => setNewOfferPriceVes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Branch selector */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  Sucursal donde está disponible
                </label>
                <select
                  value={newOfferBranchId}
                  onChange={(e) => setNewOfferBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="">Disponible en todas las sucursales</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock toggle */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newOfferInStock}
                  onChange={(e) => setNewOfferInStock(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <div className="text-xs font-bold text-white">Disponible de Inmediato (En Stock)</div>
                  <div className="text-[11px] text-slate-400">
                    Los clientes podrán ver este producto disponible para apartar por WhatsApp
                  </div>
                </div>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOfferModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOffer}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl transition shadow-lg shadow-teal-600/20 disabled:opacity-50"
                >
                  {isSubmittingOffer ? 'Guardando...' : 'Publicar en Vitrina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT BRANCH ================= */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingBranch ? 'Editar Sucursal' : 'Nueva Sede / Sucursal'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configura la ubicación física y el WhatsApp donde los clientes enviarán sus pedidos.
                </p>
              </div>
              <button
                onClick={() => setShowAddBranchModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBranchSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  Nombre de la Sede *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sede C.C. Traki / Sucursal Casco Central"
                  value={branchFormName}
                  onChange={(e) => setBranchFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Valle de la Pascua"
                    value={branchFormCity}
                    onChange={(e) => setBranchFormCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                    Estado *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Guárico"
                    value={branchFormState}
                    onChange={(e) => setBranchFormState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  Dirección Detallada *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Av. Las Garcitas con Calle Paraíso, Local 4"
                  value={branchFormAddress}
                  onChange={(e) => setBranchFormAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  Punto de Referencia (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Frente a la Plaza Bolívar / Planta Baja"
                  value={branchFormRefPoint}
                  onChange={(e) => setBranchFormRefPoint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                    WhatsApp de Pedidos
                  </label>
                  <input
                    type="text"
                    placeholder="+58 412 1234567"
                    value={branchFormWhatsapp}
                    onChange={(e) => setBranchFormWhatsapp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                    Horario de Atención
                  </label>
                  <input
                    type="text"
                    placeholder="Lunes a Sábado: 8:00 AM - 6:00 PM"
                    value={branchFormHours}
                    onChange={(e) => setBranchFormHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBranch}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl transition shadow-lg shadow-teal-600/20 disabled:opacity-50"
                >
                  {isSubmittingBranch ? 'Guardando...' : editingBranch ? 'Guardar Cambios' : 'Crear Sede'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= MODAL: BULK CSV CATALOG IMPORTER (DLG-EXEC) ================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-5 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Importador Masivo de Catálogo</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  Carga Rápida de Inventario (CSV / Excel / Texto)
                </h3>
                <p className="text-xs text-slate-400">
                  Importa hasta 500 productos en un solo paso. Los productos existentes se sincronizan automáticamente con la base de datos científica; los nuevos se agregan a tu vitrina.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportResult(null);
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If import already finished: show results summary */}
            {importResult ? (
              <div className="space-y-5 py-2">
                <div className="p-5 rounded-xl bg-teal-950/40 border border-teal-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                    <CheckCircle className="w-5 h-5 text-teal-400" />
                    <span>{importResult.message}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Nuevas Ofertas</span>
                      <span className="text-lg font-mono font-bold text-teal-400">
                        {importResult.summary.created_offers}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Ofertas Actualizadas</span>
                      <span className="text-lg font-mono font-bold text-cyan-400">
                        {importResult.summary.updated_offers}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Vinculados con Ficha Médica</span>
                      <span className="text-lg font-mono font-bold text-emerald-400">
                        {importResult.summary.matched_scientific_products}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Nuevos Productos Catalogados</span>
                      <span className="text-lg font-mono font-bold text-amber-400">
                        {importResult.summary.created_new_products}
                      </span>
                    </div>
                  </div>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                      <div className="font-bold">Observaciones en {importResult.errors.length} fila(s):</div>
                      <div className="max-h-28 overflow-y-auto space-y-0.5 text-[11px]">
                        {importResult.errors.map((err, i) => (
                          <div key={i}>
                            &bull; Fila {err.row} ({err.name}): {err.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setImportResult(null);
                      setImportRawText('');
                      setParsedImportRows([]);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Importar Otro Lote
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportResult(null);
                      loadOffers();
                    }}
                    className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cerrar y Ver Catálogo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Controls Bar: Download Template + File Upload */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-teal-400" />
                      <span>Descargar Plantilla CSV</span>
                    </button>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      (Columnas: código, producto, marca, precio_usd, stock, enlace)
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Cargar Archivo CSV</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Batch Settings: Branch & Exchange Rate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Sucursal Destino
                    </label>
                    <select
                      value={importSelectedBranch}
                      onChange={(e) => setImportSelectedBranch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                    >
                      <option value="">Disponible en todas las sucursales</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Tasa de Cambio para Autocalcular Bs (VES por USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">
                        Bs/$
                      </span>
                      <input
                        type="number"
                        step="0.10"
                        value={importExchangeRate}
                        onChange={(e) => {
                          setImportExchangeRate(e.target.value);
                          if (importRawText) parseImportText(importRawText, e.target.value);
                        }}
                        placeholder="45.00"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Raw Text / Paste Area */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Pega tus filas aquí (o edita el texto cargado)
                  </label>
                  <textarea
                    rows={4}
                    value={importRawText}
                    onChange={(e) => {
                      setImportRawText(e.target.value);
                      parseImportText(e.target.value, importExchangeRate);
                    }}
                    placeholder={"codigo_barras,producto,marca,precio_usd,stock,enlace\n7501234567890,Effaclar Gel 200ml,La Roche-Posay,18.50,si,https://wa.me/...\n3337875597180,CeraVe Crema 454g,CeraVe,24.00,si,https://wa.me/..."}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500 transition"
                  />
                </div>

                {/* Preview Table (DLG-EXEC High-Density Functional Table) */}
                {parsedImportRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">
                        Previsualización ({parsedImportRows.length} filas detectadas)
                      </span>
                      <span className="text-[11px] text-teal-400 font-mono">
                        {parsedImportRows.filter((r) => r.isValid).length} listas para importar
                      </span>
                    </div>

                    <div className="border border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto bg-slate-950/70">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 sticky top-0 z-10">
                          <tr>
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Código</th>
                            <th className="py-2.5 px-3">Producto</th>
                            <th className="py-2.5 px-3">Marca</th>
                            <th className="py-2.5 px-3 text-right">Precio USD</th>
                            <th className="py-2.5 px-3 text-right">Precio Bs</th>
                            <th className="py-2.5 px-3 text-center">Stock</th>
                            <th className="py-2.5 px-3 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 font-mono">
                          {parsedImportRows.map((row, idx) => (
                            <tr
                              key={idx}
                              className={`hover:bg-slate-900/60 transition ${
                                !row.isValid ? 'bg-red-950/20' : ''
                              }`}
                            >
                              <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                              <td className="py-2 px-3 text-slate-400">{row.barcode_ean || '—'}</td>
                              <td className="py-2 px-3 font-sans font-medium text-white max-w-[200px] truncate">
                                {row.name}
                              </td>
                              <td className="py-2 px-3 font-sans text-slate-400">{row.brand || '—'}</td>
                              <td className="py-2 px-3 text-right text-emerald-400 font-bold">
                                ${row.price_usd.toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-right text-cyan-400">
                                {row.price_ves ? `${row.price_ves.toFixed(2)} Bs` : '—'}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {row.in_stock ? (
                                  <span className="text-[10px] text-teal-400">Sí</span>
                                ) : (
                                  <span className="text-[10px] text-red-400">No</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center font-sans">
                                {row.isValid ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                                    Listo
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                                    {row.validationError || 'Inválido'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setParsedImportRows([]);
                      setImportRawText('');
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    disabled={isImporting || parsedImportRows.filter((r) => r.isValid).length === 0}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-black text-xs rounded-xl transition shadow-lg shadow-teal-600/20 cursor-pointer flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Procesando Lote...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>
                          Importar {parsedImportRows.filter((r) => r.isValid).length} Producto(s)
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sky-100 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => handleTabChange('inicio')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'inicio' ? 'text-sky-600 font-bold' : 'text-slate-400'}`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px]">Inicio</span>
        </button>
        <button
          onClick={() => handleTabChange('analytics')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'analytics' ? 'text-sky-600 font-bold' : 'text-slate-400'}`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[9px]">Ventas</span>
        </button>
        <button
          onClick={() => handleTabChange('catalog')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'catalog' ? 'text-sky-600 font-bold' : 'text-slate-400'}`}
        >
          <Package className="w-4 h-4" />
          <span className="text-[9px]">Productos</span>
        </button>
        <button
          onClick={() => handleTabChange('branches')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'branches' ? 'text-sky-600 font-bold' : 'text-slate-400'}`}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-[9px]">Sedes</span>
        </button>
      </nav>
    </div>
  );
}

export default function BusinessDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Cargando portal comercial...</p>
        </div>
      }
    >
      <BusinessDashboardContent />
    </Suspense>
  );
}
