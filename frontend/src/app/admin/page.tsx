'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Users,
  ShieldCheck,
  Settings,
  Activity,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle,
  RefreshCw,
  Search,
  UserCheck,
  ShieldAlert,
  Server,
  Database,
  Cpu,
  Key,
  Store,
  Check,
  X,
  Eye,
  ExternalLink,
  MapPin,
  Sparkles,
  Building2,
  Phone,
  BadgeCheck,
  Clock,
  ShoppingBag,
  DollarSign,
  Globe,
  Play,
  Terminal,
  TrendingDown,
  Trash2,
  Package,
  Tag,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import {
  fetchAdminUsers,
  updateAdminUserRole,
  toggleAdminUserStatus,
  unlockAdminUser,
  fetchAdminSecurityLogs,
  fetchAdminSecurityStats,
  fetchAdminSystemSettings,
  updateAdminSystemSettings,
  fetchAdminSystemHealth,
  fetchAdminStores,
  fetchAdminStoreDetail,
  updateAdminStoreVerification,
  updateAdminStoreSubscription,
  toggleAdminStoreStatus,
  deleteAdminStore,
  fetchAdminScraperStatus,
  triggerAdminScraperRun,
  fetchAdminCrawlerSummary,
  AdminStoreItem,
  UserRoleType,
  SecurityAuditLogItem,
  API_BASE_URL,
  getAuthHeaders,
} from '@/lib/api';

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'users' | 'security' | 'settings' | 'stores' | 'scraper' | 'products'>(() => {
    if (tabParam === 'users' || tabParam === 'security' || tabParam === 'settings' || tabParam === 'stores' || tabParam === 'scraper' || tabParam === 'products') {
      return tabParam;
    }
    return 'stores';
  });

  useEffect(() => {
    if (tabParam === 'users' || tabParam === 'security' || tabParam === 'settings' || tabParam === 'stores' || tabParam === 'scraper' || tabParam === 'products') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'users' | 'security' | 'settings' | 'stores' | 'scraper' | 'products') => {
    setActiveTab(tab);
    router.replace(`/admin?tab=${tab}`, { scroll: false });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Security Logs & Stats State
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLogItem[]>([]);
  const [securityStats, setSecurityStats] = useState<any>(null);
  const [logSeverityFilter, setLogSeverityFilter] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);

  // System Settings State
  const [settingsGrouped, setSettingsGrouped] = useState<Record<string, any[]>>({});
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Stores Supervision State
  const [stores, setStores] = useState<AdminStoreItem[]>([]);
  const [storeSummary, setStoreSummary] = useState({ pending_review: 0, total_verified: 0, total_stores: 0 });
  const [storeSearch, setStoreSearch] = useState('');
  const [storeStatusFilter, setStoreStatusFilter] = useState('');
  const [storeTierFilter, setStoreTierFilter] = useState('');
  const [storeCountryFilter, setStoreCountryFilter] = useState('');
  const [storePage, setStorePage] = useState(1);
  const [storeTotalPages, setStoreTotalPages] = useState(1);
  const [storeViewMode, setStoreViewMode] = useState<'grouped' | 'table'>('grouped');
  const [selectedGroupedStoreId, setSelectedGroupedStoreId] = useState<number | null>(null);
  const [groupedStoreDetail, setGroupedStoreDetail] = useState<AdminStoreItem | null>(null);
  const [isLoadingGroupedStore, setIsLoadingGroupedStore] = useState(false);
  const [groupedProductSearch, setGroupedProductSearch] = useState('');
  const [groupedStockFilter, setGroupedStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [inspectingStore, setInspectingStore] = useState<AdminStoreItem | null>(null);
  const [isLoadingStoreDetail, setIsLoadingStoreDetail] = useState(false);
  const [storeProductSearch, setStoreProductSearch] = useState('');
  const [storeActiveTab, setStoreActiveTab] = useState<'products' | 'info' | 'branches'>('products');
  const [rejectModalStore, setRejectModalStore] = useState<AdminStoreItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteModalStore, setDeleteModalStore] = useState<AdminStoreItem | null>(null);
  const [isDeletingStore, setIsDeletingStore] = useState(false);
  const [tierModalStore, setTierModalStore] = useState<AdminStoreItem | null>(null);
  const [selectedTier, setSelectedTier] = useState<'FREE' | 'PRO_LOCAL' | 'ENTERPRISE'>('FREE');
  const [selectedFeatured, setSelectedFeatured] = useState(false);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Scraper & Crawler State
  const [scraperData, setScraperData] = useState<any>(null);
  const [scraperForm, setScraperForm] = useState<{
    mode: 'ingredient' | 'all_active_ingredients' | 'chain' | 'url' | 'refresh_prices';
    ingredient_id: string;
    store: string;
    city: string;
    url: string;
  }>({
    mode: 'ingredient',
    ingredient_id: '',
    store: 'all',
    city: '',
    url: '',
  });
  const [isScraperRunning, setIsScraperRunning] = useState(false);
  const [scraperConsoleOutput, setScraperConsoleOutput] = useState<string | null>(null);
  const [inspectingOffer, setInspectingOffer] = useState<any | null>(null);
  const [crawlerSummary, setCrawlerSummary] = useState<any>(null);
  const [summaryHours, setSummaryHours] = useState<number>(24);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [crawlerExpandedCountries, setCrawlerExpandedCountries] = useState<Record<string, boolean>>({});
  const [crawlerStoreSearch, setCrawlerStoreSearch] = useState<string>('');

  // Agrupación de tiendas del Crawler por país para acordeón (DLG-EXEC)
  const groupedCrawlerStores = React.useMemo(() => {
    if (!crawlerSummary?.stores || !Array.isArray(crawlerSummary.stores)) return [];

    let storesList = crawlerSummary.stores;
    if (crawlerStoreSearch.trim()) {
      const q = crawlerStoreSearch.toLowerCase();
      storesList = storesList.filter((s: any) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.country_name || '').toLowerCase().includes(q) ||
        (s.country_code || '').toLowerCase().includes(q) ||
        (s.platform || '').toLowerCase().includes(q)
      );
    }

    const groupsMap = new Map<string, {
      code: string;
      name: string;
      flag: string;
      stores: any[];
      totalOffers: number;
      newOffers: number;
    }>();

    for (const st of storesList) {
      const code = (st.country_code || 'GLOBAL').toUpperCase();
      const name = st.country_name || (code === 'GLOBAL' ? 'Internacional' : code);
      const flag = st.country_flag || (code === 'GLOBAL' ? '🌐' : '🏳️');

      if (!groupsMap.has(code)) {
        groupsMap.set(code, {
          code,
          name,
          flag,
          stores: [],
          totalOffers: 0,
          newOffers: 0,
        });
      }

      const group = groupsMap.get(code)!;
      group.stores.push(st);
      group.totalOffers += Number(st.total_offers || 0);
      group.newOffers += Number(st.new_offers_period || 0);
    }

    // Ordenar tiendas dentro de cada país: primero las que tienen más ofertas
    groupsMap.forEach((grp) => {
      grp.stores.sort((a, b) => (Number(b.total_offers || 0) - Number(a.total_offers || 0)) || a.name.localeCompare(b.name));
    });

    // Ordenar países: primero aquellos con más ofertas acumuladas, luego alfabéticamente
    return Array.from(groupsMap.values()).sort((a, b) => {
      if (b.totalOffers !== a.totalOffers) return b.totalOffers - a.totalOffers;
      return a.name.localeCompare(b.name);
    });
  }, [crawlerSummary?.stores, crawlerStoreSearch]);

  const isCountryExpanded = (code: string, hasOffers: boolean, isFirst: boolean) => {
    if (crawlerExpandedCountries[code] !== undefined) {
      return crawlerExpandedCountries[code];
    }
    return hasOffers || isFirst;
  };

  const toggleCrawlerCountry = (code: string, currentStatus: boolean) => {
    setCrawlerExpandedCountries((prev) => ({
      ...prev,
      [code]: !currentStatus,
    }));
  };

  const expandAllCrawlerCountries = () => {
    const next: Record<string, boolean> = {};
    groupedCrawlerStores.forEach((g) => {
      next[g.code] = true;
    });
    setCrawlerExpandedCountries(next);
  };

  const collapseAllCrawlerCountries = () => {
    const next: Record<string, boolean> = {};
    groupedCrawlerStores.forEach((g) => {
      next[g.code] = false;
    });
    setCrawlerExpandedCountries(next);
  };

  // Catalog & Products State
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('');
  const [catalogStoreFilter, setCatalogStoreFilter] = useState('');
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogTotalPages, setCatalogTotalPages] = useState(1);
  const [inspectingCatalogProduct, setInspectingCatalogProduct] = useState<any | null>(null);

  const loadCatalogProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', catalogPage.toString());
      params.append('per_page', '15');
      params.append('include_all', '1');
      if (catalogSearch.trim()) params.append('q', catalogSearch.trim());
      if (catalogCategoryFilter) params.append('category', catalogCategoryFilter);
      if (catalogStoreFilter) params.append('store_id', catalogStoreFilter);

      const res = await fetch(`${API_BASE_URL}/catalog/products?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setCatalogProducts(json.data || []);
        setCatalogTotal(json.total || 0);
        setCatalogTotalPages(json.last_page || 1);
      }
    } catch (err: any) {
      console.error('Error al cargar catálogo de productos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/catalog/products?per_page=1`, {
      headers: getAuthHeaders(),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.total) setCatalogTotal(json.total);
      })
      .catch(() => {});
  }, []);

  const loadCrawlerSummary = async (hours: number = summaryHours) => {
    setIsLoadingSummary(true);
    try {
      const res = await fetchAdminCrawlerSummary(hours);
      setCrawlerSummary(res.data);
    } catch (err: any) {
      console.error('Error al consultar resumen del crawler:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const loadScraperStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminScraperStatus();
      setScraperData(res);
      if (!scraperForm.ingredient_id && res.active_ingredients && res.active_ingredients.length > 0) {
        setScraperForm((prev) => ({ ...prev, ingredient_id: String(res.active_ingredients?.[0]?.id || '') }));
      }
      loadCrawlerSummary(summaryHours);
    } catch (err: any) {
      console.error('Error al consultar estado del scraper:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunScraper = async () => {
    setIsScraperRunning(true);
    setScraperConsoleOutput(null);
    try {
      const res = await triggerAdminScraperRun(scraperForm);
      setScraperConsoleOutput(res.output);
      showNotification('success', res.message || 'Rastreo ejecutado con éxito.');
      await loadScraperStatus();
      await loadCatalogProducts();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al ejecutar rastreador.');
    } finally {
      setIsScraperRunning(false);
    }
  };

  // Load Users
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminUsers({
        page: userPage,
        search: userSearch,
        role: userRoleFilter,
      });
      setUsers(res.data || []);
      setUserTotalPages(res.last_page || 1);
    } catch (err: any) {
      showNotification('error', err.message || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  // Load Security Logs & Stats
  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetchAdminSecurityLogs({ page: logPage, severity: logSeverityFilter }),
        fetchAdminSecurityStats(),
      ]);
      setSecurityLogs(logsRes.data || []);
      setLogTotalPages(logsRes.last_page || 1);
      setSecurityStats(statsRes.stats || null);
    } catch (err: any) {
      showNotification('error', err.message || 'Error al cargar logs de seguridad');
    } finally {
      setIsLoading(false);
    }
  };

  // Load System Settings & Health
  const loadSettingsData = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, healthRes] = await Promise.all([
        fetchAdminSystemSettings(),
        fetchAdminSystemHealth(),
      ]);
      setSettingsGrouped(settingsRes.settings || {});
      setSystemHealth(healthRes.health || null);
    } catch (err: any) {
      showNotification('error', err.message || 'Error al cargar configuraciones');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroupedStoreDetail = async (storeId: number) => {
    setIsLoadingGroupedStore(true);
    try {
      const res = await fetchAdminStoreDetail(storeId);
      if (res?.store) {
        setGroupedStoreDetail(res.store);
      }
    } catch (err: any) {
      console.error('Error al cargar detalle de tienda agrupada:', err);
    } finally {
      setIsLoadingGroupedStore(false);
    }
  };

  const handleSelectGroupedStore = (store: AdminStoreItem) => {
    setSelectedGroupedStoreId(store.id);
    setGroupedProductSearch('');
    setGroupedStockFilter('ALL');
    loadGroupedStoreDetail(store.id);
  };

  // Load Stores
  const loadStores = async (targetIdToSelect?: number) => {
    setIsLoading(true);
    try {
      const res = await fetchAdminStores({
        page: storePage,
        per_page: storeViewMode === 'grouped' ? 50 : 15,
        search: storeSearch,
        verification_status: storeStatusFilter,
        subscription_tier: storeTierFilter,
        country_code: storeCountryFilter || undefined,
      });
      const storeList = res.stores?.data || [];
      setStores(storeList);
      setStoreTotalPages(res.stores?.last_page || 1);
      if (res.summary) {
        setStoreSummary(res.summary);
      }

      // Auto-selección en modo agrupado
      if (storeList.length > 0) {
        const idToSelect = targetIdToSelect
          ?? (selectedGroupedStoreId && storeList.some((s) => s.id === selectedGroupedStoreId) ? selectedGroupedStoreId : null)
          ?? (storeList.find((s) => (s.product_offers_count || (s as any).total_offers_count || 0) > 0)?.id || storeList[0].id);

        if (idToSelect) {
          setSelectedGroupedStoreId(idToSelect);
          loadGroupedStoreDetail(idToSelect);
        }
      } else {
        setSelectedGroupedStoreId(null);
        setGroupedStoreDetail(null);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error al cargar tiendas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'security') {
      loadSecurityData();
    } else if (activeTab === 'settings') {
      loadSettingsData();
    } else if (activeTab === 'stores') {
      loadStores();
    } else if (activeTab === 'scraper') {
      loadScraperStatus();
    } else if (activeTab === 'products') {
      loadCatalogProducts();
    }
  }, [activeTab, userPage, userRoleFilter, logPage, logSeverityFilter, storePage, storeStatusFilter, storeTierFilter, storeCountryFilter, storeViewMode, catalogPage, catalogCategoryFilter, catalogStoreFilter]);

  const handleConfirmDeleteStore = async () => {
    if (!deleteModalStore) return;
    setIsDeletingStore(true);
    try {
      const res = await deleteAdminStore(deleteModalStore.id);
      showNotification('success', res.message || 'Tienda eliminada permanentemente y productos purgados.');
      setDeleteModalStore(null);
      loadStores();
      if (inspectingStore?.id === deleteModalStore.id) {
        setInspectingStore(null);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error al eliminar tienda');
    } finally {
      setIsDeletingStore(false);
    }
  };

  const handleApproveStore = async (storeId: number) => {
    try {
      await updateAdminStoreVerification(storeId, { verification_status: 'VERIFIED' });
      showNotification('success', '¡Comercio verificado y activado en el catálogo público!');
      loadStores();
      if (inspectingStore?.id === storeId) {
        setInspectingStore((prev) => (prev ? { ...prev, verification_status: 'VERIFIED', is_active: true } : null));
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error al verificar tienda');
    }
  };

  const handleConfirmRejectStore = async () => {
    if (!rejectModalStore) return;
    try {
      await updateAdminStoreVerification(rejectModalStore.id, {
        verification_status: 'REJECTED',
        rejected_reason: rejectReason || 'Información incompleta o no verificable',
      });
      showNotification('success', 'Comercio rechazado.');
      setRejectModalStore(null);
      setRejectReason('');
      loadStores();
      if (inspectingStore?.id === rejectModalStore.id) {
        setInspectingStore(null);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error al rechazar tienda');
    }
  };

  const handleConfirmUpdateTier = async () => {
    if (!tierModalStore) return;
    try {
      await updateAdminStoreSubscription(tierModalStore.id, {
        subscription_tier: selectedTier,
        is_featured: selectedFeatured,
      });
      showNotification('success', `Plan de la tienda actualizado a ${selectedTier}`);
      setTierModalStore(null);
      loadStores();
      if (inspectingStore?.id === tierModalStore.id) {
        setInspectingStore((prev) => (prev ? { ...prev, subscription_tier: selectedTier, is_featured: selectedFeatured } : null));
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error al actualizar suscripción');
    }
  };

  const handleToggleStoreStatus = async (storeId: number) => {
    try {
      const res = await toggleAdminStoreStatus(storeId);
      showNotification('success', res.message || 'Estado de la tienda modificado');
      loadStores();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al modificar estado');
    }
  };

  const handleInspectStore = async (store: any) => {
    setInspectingStore(store);
    setStoreProductSearch('');
    setStoreActiveTab('products');
    setIsLoadingStoreDetail(true);
    try {
      const res = await fetchAdminStoreDetail(store.id);
      if (res?.store) {
        setInspectingStore(res.store);
      }
    } catch (err: any) {
      console.error('Error al cargar detalle de tienda:', err);
    } finally {
      setIsLoadingStoreDetail(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRoleType) => {
    try {
      await updateAdminUserRole(userId, newRole);
      showNotification('success', 'Rol de usuario actualizado exitosamente');
      loadUsers();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al actualizar rol');
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const res = await toggleAdminUserStatus(userId);
      showNotification('success', res.message || 'Estado modificado');
      loadUsers();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al cambiar estado');
    }
  };

  const handleUnlockUser = async (userId: number) => {
    try {
      const res = await unlockAdminUser(userId);
      showNotification('success', res.message || 'Cuenta desbloqueada');
      loadUsers();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al desbloquear cuenta');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const flatSettings: any[] = [];
      Object.values(settingsGrouped).forEach((group) => {
        group.forEach((item) => {
          flatSettings.push({
            key: item.key,
            value: item.value,
            group: item.group,
            type: item.type,
            description: item.description,
          });
        });
      });

      await updateAdminSystemSettings(flatSettings);
      showNotification('success', 'Configuraciones guardadas y caché purgada');
      loadSettingsData();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al guardar configuraciones');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSettingInputChange = (groupKey: string, index: number, value: any) => {
    setSettingsGrouped((prev) => {
      const copy = { ...prev };
      const groupCopy = [...copy[groupKey]];
      groupCopy[index] = { ...groupCopy[index], value };
      copy[groupKey] = groupCopy;
      return copy;
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Consola de Control Central</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {activeTab === 'stores' && 'Supervisión de Tiendas & Comercios'}
            {activeTab === 'users' && 'Gestión de Usuarios & Roles (RBAC)'}
            {activeTab === 'security' && 'Auditoría & Logs de Seguridad'}
            {activeTab === 'settings' && 'Configuraciones Globales del Sistema'}
            {activeTab === 'scraper' && 'Motor de Scraping & Rastreo de Precios'}
            {activeTab === 'products' && 'Catálogo Maestro de Productos & Fórmulas'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {activeTab === 'stores' && 'Validación de farmacias y tiendas cosméticas aliadas, asignación de tiers y supervisión de sedes.'}
            {activeTab === 'users' && 'Gestión de privilegios, salvaguarda de perfiles de usuario y asignación de roles.'}
            {activeTab === 'security' && 'Monitoreo en tiempo real de intentos de acceso, bloqueos por fuerza bruta y auditoría de eventos.'}
            {activeTab === 'settings' && 'Variables maestras del sistema, tasas de cambio, parámetros de IA dérmica y salud de microservicios.'}
            {activeTab === 'scraper' && 'Rastreo bajo demanda por cadena o URL objetivo, sincronización de precios e historial en PostgreSQL.'}
            {activeTab === 'products' && 'Fichas técnicas dermatológicas, activos INCI, códigos EAN y comparación de precios en anaqueles.'}
          </p>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div
            className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-px">
        <button
          onClick={() => handleTabChange('stores')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition relative ${
            activeTab === 'stores'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Tiendas & Comercios</span>
          {storeSummary.pending_review > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              {storeSummary.pending_review} por verificar
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('scraper')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'scraper'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span>Scraper & Precios Web</span>
        </button>

        <button
          onClick={() => handleTabChange('products')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'products'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-cyan-400" />
          <span>Catálogo de Productos {catalogTotal > 0 ? `(${catalogTotal})` : ''}</span>
        </button>

        <button
          onClick={() => handleTabChange('users')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'users'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios & Niveles ({users.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('security')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'security'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Auditoría & Logs de Seguridad</span>
        </button>

        <button
          onClick={() => handleTabChange('settings')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'settings'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configuraciones & Infraestructura</span>
        </button>
      </div>

      {/* TAB 1: USERS & RBAC */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="">Todos los roles</option>
                <option value="super_admin">Super Administrador</option>
                <option value="admin">Administrador</option>
                <option value="scientific_editor">Editor Científico</option>
                <option value="premium_user">Usuario Premium</option>
                <option value="standard_user">Usuario Estándar</option>
              </select>
            </div>

            <button
              onClick={loadUsers}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-xs font-bold uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol / Nivel</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Último Acceso</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No se encontraron usuarios coincidentes.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isLocked = u.locked_until && new Date(u.locked_until) > new Date();
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                          {u.skinProfile && (
                            <div className="text-[11px] text-teal-400 mt-0.5">
                              Piel: {u.skinProfile.skin_type} • Barrera: {u.skinProfile.barrier_status}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role || 'standard_user'}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRoleType)}
                            className="text-xs font-bold py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-teal-300 focus:outline-none focus:border-teal-500"
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="scientific_editor">Editor Científico</option>
                            <option value="premium_user">Premium</option>
                            <option value="standard_user">Estándar</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold w-fit ${
                                u.is_active
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                              {u.is_active ? 'Activo' : 'Suspendido'}
                            </span>
                            {isLocked && (
                              <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                                <Lock className="w-3 h-3" /> Bloqueado temporalmente
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Nunca'}
                          {u.last_login_ip && <div className="text-[11px] text-slate-500">IP: {u.last_login_ip}</div>}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {isLocked && (
                            <button
                              onClick={() => handleUnlockUser(u.id)}
                              className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-lg transition"
                              title="Desbloquear cuenta"
                            >
                              <Unlock className="w-3.5 h-3.5 inline mr-1" /> Desbloquear
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition ${
                              u.is_active
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                            }`}
                          >
                            {u.is_active ? 'Suspender' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY AUDIT & INTRUSION LOGS */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Security Overview Cards */}
          {securityStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Logins Fallidos (24h)
                </div>
                <div className="text-2xl font-black text-rose-400">
                  {securityStats.failed_logins_24h}
                </div>
                <div className="text-xs text-slate-500 mt-1">Intentos de clave incorrecta</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Ataques Mitigados / Rate Limits
                </div>
                <div className="text-2xl font-black text-amber-400">
                  {securityStats.throttled_requests_24h}
                </div>
                <div className="text-xs text-slate-500 mt-1">Bloqueos de fuerza bruta</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Alertas Críticas
                </div>
                <div className="text-2xl font-black text-purple-400">
                  {securityStats.critical_events_count}
                </div>
                <div className="text-xs text-slate-500 mt-1">Cambios de rol & config</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Administradores Activos
                </div>
                <div className="text-2xl font-black text-teal-400">
                  {securityStats.total_admins_count}
                </div>
                <div className="text-xs text-slate-500 mt-1">Super Admin & Admins</div>
              </div>
            </div>
          )}

          {/* Logs Filters */}
          <div className="flex items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <select
                value={logSeverityFilter}
                onChange={(e) => setLogSeverityFilter(e.target.value)}
                className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="">Todas las severidades</option>
                <option value="CRITICAL">CRITICAL (Crítica)</option>
                <option value="WARNING">WARNING (Advertencia)</option>
                <option value="INFO">INFO (Informativa)</option>
              </select>
            </div>

            <button
              onClick={loadSecurityData}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refrescar Logs</span>
            </button>
          </div>

          {/* Logs Table */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-xs font-bold uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Severidad</th>
                  <th className="px-6 py-4">Evento</th>
                  <th className="px-6 py-4">Detalle / Descripción</th>
                  <th className="px-6 py-4">IP / Actor</th>
                  <th className="px-6 py-4 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {securityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No hay registros de auditoría de seguridad disponibles.
                    </td>
                  </tr>
                ) : (
                  securityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            log.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : log.severity === 'WARNING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-200">
                        {log.event_type}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300 max-w-md">
                        <div>{log.description}</div>
                        {log.payload && (
                          <pre className="mt-1 p-2 bg-slate-950 rounded text-[10px] font-mono text-slate-400 overflow-x-auto">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        <div className="font-semibold text-slate-300">{log.ip_address || '—'}</div>
                        {log.user && <div className="text-[11px] text-teal-400">{log.user.email}</div>}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM SETTINGS & HEALTH */}
      {activeTab === 'settings' && (
        <div className="space-y-8">
          {/* Health Overview */}
          {systemHealth && (
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-400" />
                <span>Estado de Infraestructura y Servicios</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="text-slate-500 mb-1">Base de Datos</div>
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" /> Conectada & Saludable
                  </div>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="text-slate-500 mb-1">Motor PHP / Laravel</div>
                  <div className="font-bold text-slate-200">
                    PHP {systemHealth.php_version} / Laravel {systemHealth.laravel_version}
                  </div>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="text-slate-500 mb-1">Usuarios Totales</div>
                  <div className="font-bold text-teal-300">{systemHealth.total_users}</div>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="text-slate-500 mb-1">Eventos de Auditoría</div>
                  <div className="font-bold text-purple-300">{systemHealth.total_security_events}</div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Form */}
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {Object.keys(settingsGrouped).length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Cargando parámetros de configuración...
              </div>
            ) : (
              Object.entries(settingsGrouped).map(([groupName, items]) => (
                <div key={groupName} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                  <h4 className="text-sm font-black uppercase tracking-wider text-teal-400 mb-4">
                    Grupo: {groupName}
                  </h4>
                  <div className="space-y-4">
                    {items.map((setting: any, idx: number) => (
                      <div key={setting.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b border-slate-800/60 pb-4">
                        <div>
                          <div className="font-bold text-sm text-white">{setting.key}</div>
                          <div className="text-xs text-slate-400">{setting.description}</div>
                        </div>
                        <div className="md:col-span-2">
                          {setting.type === 'boolean' ? (
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={setting.value === '1' || setting.value === true}
                                onChange={(e) =>
                                  handleSettingInputChange(groupName, idx, e.target.checked ? '1' : '0')
                                }
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                          ) : (
                            <input
                              type="text"
                              value={setting.value || ''}
                              onChange={(e) => handleSettingInputChange(groupName, idx, e.target.value)}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-teal-600/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Guardar Todas las Configuraciones</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= STORES & MERCHANTS TAB ================= */}
      {activeTab === 'stores' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-amber-500/20 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pendientes de Aprobación</p>
                  <p className="text-3xl font-black text-amber-400 mt-1">{storeSummary.pending_review}</p>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <div className="mt-3 text-xs text-amber-300/80 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Nuevas tiendas esperando validación</span>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/20 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tiendas Verificadas</p>
                  <p className="text-3xl font-black text-emerald-400 mt-1">{storeSummary.total_verified}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <BadgeCheck className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3 text-xs text-emerald-300/80 flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Visibles en el directorio y vitrinas públicas</span>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-teal-500/20 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Red Comercial</p>
                  <p className="text-3xl font-black text-teal-300 mt-1">{storeSummary.total_stores}</p>
                </div>
                <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3 text-xs text-teal-300/80 flex items-center gap-1.5 font-medium">
                <Store className="w-3.5 h-3.5" />
                <span>Empresas dadas de alta en el ecosistema</span>
              </div>
            </div>
          </div>

          {/* Mode Selector & View Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setStoreViewMode('grouped')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  storeViewMode === 'grouped'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-500/10'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                <Store className="w-4 h-4 text-teal-400" />
                <span>Catálogo Agrupado por Tienda</span>
                <span className="px-1.5 py-0.2 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-mono">
                  {stores.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStoreViewMode('table')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  storeViewMode === 'table'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-500/10'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Tabla de Supervisión & Tiers</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 w-full sm:w-auto justify-end">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                <span>Soporte multi-país y precios duales USD / Local</span>
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 w-full gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de comercio o datos del propietario..."
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadStores()}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                />
              </div>
              <button
                onClick={() => loadStores()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={storeStatusFilter}
                onChange={(e) => {
                  setStoreStatusFilter(e.target.value);
                  setStorePage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="">Todos los Estados</option>
                <option value="PENDING_REVIEW">Pendientes de Revisión</option>
                <option value="VERIFIED">Verificadas</option>
                <option value="REJECTED">Rechazadas</option>
              </select>

              <select
                value={storeTierFilter}
                onChange={(e) => {
                  setStoreTierFilter(e.target.value);
                  setStorePage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="">Todos los Planes</option>
                <option value="FREE">Plan Básico (Free)</option>
                <option value="PRO_LOCAL">Plan Pro Local</option>
                <option value="ENTERPRISE">Plan Corporativo</option>
              </select>

              <select
                value={storeCountryFilter}
                onChange={(e) => {
                  setStoreCountryFilter(e.target.value);
                  setStorePage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="">Todos los Países</option>
                <option value="VE">🇻🇪 Venezuela</option>
                <option value="CO">🇨🇴 Colombia</option>
                <option value="MX">🇲🇽 México</option>
                <option value="ES">🇪🇸 España</option>
                <option value="CL">🇨🇱 Chile</option>
                <option value="PA">🇵🇦 Panamá</option>
                <option value="US">🇺🇸 Estados Unidos</option>
                <option value="HN">🇭🇳 Honduras</option>
                <option value="SV">🇸🇻 El Salvador</option>
                <option value="AR">🇦🇷 Argentina</option>
                <option value="GLOBAL">🌐 Internacional</option>
              </select>

              <button
                onClick={() => {
                  setStoreSearch('');
                  setStoreStatusFilter('');
                  setStoreTierFilter('');
                  setStoreCountryFilter('');
                  setStorePage(1);
                  loadStores();
                }}
                className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition"
                title="Restablecer filtros"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: CATÁLOGO AGRUPADO POR TIENDA (MAESTRO - DETALLE) */}
          {storeViewMode === 'grouped' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Columna Izquierda: Selector de Comercios */}
              <div className="lg:col-span-4 xl:col-span-3 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Comercios ({stores.length})
                  </span>
                  <span className="text-[10px] text-teal-400 font-semibold">
                    Haz clic para ver productos
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
                  {stores.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                      No se encontraron comercios bajo los filtros seleccionados.
                    </div>
                  ) : (
                    stores.map((store) => {
                      const isSelected = selectedGroupedStoreId === store.id;
                      const offersCount = store.product_offers_count ?? (store as any).total_offers_count ?? 0;
                      return (
                        <div
                          key={store.id}
                          onClick={() => handleSelectGroupedStore(store)}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                            isSelected
                              ? 'bg-slate-900 border-teal-500/60 ring-1 ring-teal-500/40 shadow-lg shadow-teal-500/10'
                              : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold shrink-0 overflow-hidden mt-0.5">
                              {store.logo_url ? (
                                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                              ) : (
                                <Store className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-bold text-white truncate">
                                  {store.name}
                                </h4>
                                <span
                                  className="text-xs shrink-0"
                                  title={store.country_name || store.country_code}
                                >
                                  {store.country_flag || '🌐'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                                  {store.country_code || 'VE'}
                                </span>
                                {(store.crawler_platform || (store as any).platform) && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                                    {store.crawler_platform || (store as any).platform}
                                  </span>
                                )}
                                {store.is_featured && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                                    PRO
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80">
                                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                                  <Package className="w-3 h-3 text-slate-500" />
                                  <span>{offersCount} productos</span>
                                </span>

                                {store.website_url && (
                                  <a
                                    href={store.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-400 hover:text-teal-300 hover:underline"
                                    title="Ir a la tienda oficial"
                                  >
                                    <span>Ir a la tienda</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Columna Derecha: Detalle de Tienda y Catálogo Agrupado */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                {isLoadingGroupedStore ? (
                  <div className="py-24 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-slate-400">
                      Cargando catálogo y datos del comercio...
                    </p>
                  </div>
                ) : !groupedStoreDetail ? (
                  <div className="py-24 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3 p-8">
                    <Store className="w-12 h-12 text-slate-600 mx-auto" />
                    <h3 className="text-base font-bold text-white">Ningún comercio seleccionado</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Selecciona una tienda del panel lateral izquierdo para ver su ficha técnica, país de operación, enlace directo y todos sus productos vinculados con precios duales.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Ficha Maestra del Comercio */}
                    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold shrink-0 overflow-hidden shadow-inner">
                            {groupedStoreDetail.logo_url ? (
                              <img src={groupedStoreDetail.logo_url} alt={groupedStoreDetail.name} className="w-full h-full object-cover" />
                            ) : (
                              <Store className="w-8 h-8" />
                            )}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-xl font-black text-white">
                                {groupedStoreDetail.name}
                              </h2>
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow-sm">
                                <span className="text-sm">{groupedStoreDetail.country_flag || '🌐'}</span>
                                <span>{groupedStoreDetail.country_name || groupedStoreDetail.country_code || 'Internacional'}</span>
                              </span>
                              {(groupedStoreDetail.crawler_platform || (groupedStoreDetail as any).platform) && (
                                <span className="px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono text-xs font-bold">
                                  {groupedStoreDetail.crawler_platform || (groupedStoreDetail as any).platform}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                                groupedStoreDetail.verification_status === 'VERIFIED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : groupedStoreDetail.verification_status === 'REJECTED'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {groupedStoreDetail.verification_status === 'VERIFIED' ? 'Verificada' : groupedStoreDetail.verification_status === 'REJECTED' ? 'Rechazada' : 'Pendiente'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                              <span>ID: #{groupedStoreDetail.id}</span>
                              <span>&bull; Slug: <code className="text-teal-400 font-mono">{groupedStoreDetail.slug}</code></span>
                              <span>&bull; Plan: <strong className="text-slate-200">{groupedStoreDetail.subscription_tier || 'FREE'}</strong></span>
                            </p>
                          </div>
                        </div>

                        {/* Botón Ir a la tienda oficial */}
                        <div className="flex items-center gap-3 shrink-0">
                          {groupedStoreDetail.website_url ? (
                            <a
                              href={groupedStoreDetail.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition group"
                              title="Visitar sitio web oficial del comercio"
                            >
                              <span>Ir a la tienda oficial</span>
                              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-500 italic">Sin URL oficial</span>
                          )}

                          <button
                            onClick={() => handleInspectStore(groupedStoreDetail)}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
                            title="Abrir auditoría completa en ventana modal"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Auditoría Modal</span>
                          </button>
                        </div>
                      </div>

                      {/* Store Meta Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Productos Registrados</span>
                          <span className="text-lg font-black text-teal-400 mt-0.5 block">
                            {groupedStoreDetail.product_offers?.length ?? 0}
                          </span>
                        </div>
                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Productos en Stock</span>
                          <span className="text-lg font-black text-emerald-400 mt-0.5 block">
                            {(groupedStoreDetail.product_offers || []).filter((o: any) => o.in_stock).length}
                          </span>
                        </div>
                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">País & Moneda</span>
                          <span className="text-sm font-bold text-white mt-1 block flex items-center gap-1.5 truncate">
                            <span>{groupedStoreDetail.country_flag || '🌐'}</span>
                            <span>{groupedStoreDetail.country_name || groupedStoreDetail.country_code || 'Global'}</span>
                          </span>
                        </div>
                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Sucursales Físicas</span>
                          <span className="text-lg font-black text-slate-300 mt-0.5 block">
                            {groupedStoreDetail.branches?.length ?? (groupedStoreDetail as any).branches_count ?? 0}
                          </span>
                        </div>
                      </div>

                      {/* Canales de Contacto */}
                      {(groupedStoreDetail.whatsapp_contact || groupedStoreDetail.instagram_handle || groupedStoreDetail.contact_phone || groupedStoreDetail.submitted_by_email) && (
                        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                          {groupedStoreDetail.contact_phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-teal-400" />
                              <span>{groupedStoreDetail.contact_phone}</span>
                            </span>
                          )}
                          {groupedStoreDetail.whatsapp_contact && (
                            <span className="flex items-center gap-1.5 text-emerald-400">
                              <span className="font-semibold">WhatsApp:</span> {groupedStoreDetail.whatsapp_contact}
                            </span>
                          )}
                          {groupedStoreDetail.instagram_handle && (
                            <span className="flex items-center gap-1.5 text-pink-400">
                              <span>IG: {groupedStoreDetail.instagram_handle}</span>
                            </span>
                          )}
                          {groupedStoreDetail.submitted_by_email && (
                            <span className="flex items-center gap-1.5">
                              <span>Contacto: {groupedStoreDetail.submitted_by_email}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Catálogo Agrupado de Productos del Comercio */}
                    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <Package className="w-5 h-5 text-teal-400" />
                          <h3 className="text-base font-bold text-white">
                            Productos & Ofertas de {groupedStoreDetail.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-mono font-bold">
                            {groupedStoreDetail.product_offers?.length ?? 0}
                          </span>
                        </div>

                        {/* Filtros de Stock */}
                        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                          <button
                            onClick={() => setGroupedStockFilter('ALL')}
                            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                              groupedStockFilter === 'ALL'
                                ? 'bg-slate-800 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Todos ({groupedStoreDetail.product_offers?.length ?? 0})
                          </button>
                          <button
                            onClick={() => setGroupedStockFilter('IN_STOCK')}
                            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                              groupedStockFilter === 'IN_STOCK'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            En Stock ({(groupedStoreDetail.product_offers || []).filter((o: any) => o.in_stock).length})
                          </button>
                          <button
                            onClick={() => setGroupedStockFilter('OUT_OF_STOCK')}
                            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                              groupedStockFilter === 'OUT_OF_STOCK'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Agotados ({(groupedStoreDetail.product_offers || []).filter((o: any) => !o.in_stock).length})
                          </button>
                        </div>
                      </div>

                      {/* Buscador dentro de la tienda */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          placeholder={`Buscar en los productos de ${groupedStoreDetail.name} por nombre, marca o código...`}
                          value={groupedProductSearch}
                          onChange={(e) => setGroupedProductSearch(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
                        />
                        {groupedProductSearch && (
                          <button
                            onClick={() => setGroupedProductSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Grid de Productos */}
                      {(() => {
                        const allOffers = groupedStoreDetail.product_offers || [];
                        const filteredOffers = allOffers.filter((offer: any) => {
                          if (groupedStockFilter === 'IN_STOCK' && !offer.in_stock) return false;
                          if (groupedStockFilter === 'OUT_OF_STOCK' && offer.in_stock) return false;
                          if (groupedProductSearch.trim()) {
                            const q = groupedProductSearch.toLowerCase();
                            const name = (offer.product?.name || '').toLowerCase();
                            const brand = (offer.product?.brand?.name || '').toLowerCase();
                            const ean = (offer.product?.barcode_ean || '').toLowerCase();
                            return name.includes(q) || brand.includes(q) || ean.includes(q);
                          }
                          return true;
                        });

                        if (allOffers.length === 0) {
                          return (
                            <div className="py-16 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80 p-8 space-y-2">
                              <Package className="w-10 h-10 text-slate-600 mx-auto" />
                              <p className="text-sm font-semibold text-slate-300">
                                Esta tienda aún no tiene ofertas vinculadas.
                              </p>
                              <p className="text-xs text-slate-500">
                                Ejecuta el rastreador crawler o añade productos a través del catálogo para vincularlos a este comercio.
                              </p>
                            </div>
                          );
                        }

                        if (filteredOffers.length === 0) {
                          return (
                            <div className="py-12 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                              No se encontraron productos que coincidan con la búsqueda "{groupedProductSearch}".
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[640px] overflow-y-auto pr-1">
                            {filteredOffers.map((offer: any) => {
                              const product = offer.product;
                              const usdPrice = offer.formatted_price_usd || (offer.price ? `$${Number(offer.price).toFixed(2)} USD` : 'N/D');
                              const localPrice = offer.formatted_price_local 
                                || (offer.price_local && offer.currency_local ? `${offer.currency_local} ${Number(offer.price_local).toLocaleString('es-ES')}` : null)
                                || (offer.price_ves ? `Bs. ${Number(offer.price_ves).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null);
                              const targetProductUrl = offer.product_url || groupedStoreDetail.website_url;

                              return (
                                <div
                                  key={offer.id}
                                  className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition group shadow-md"
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                      <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                        {product?.image_url ? (
                                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                        ) : (
                                          <Package className="w-6 h-6 text-slate-600" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 truncate">
                                            {product?.brand?.name || 'Marca'}
                                          </span>
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                            offer.in_stock ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                          }`}>
                                            {offer.in_stock ? 'En Stock' : 'Agotado'}
                                          </span>
                                        </div>
                                        <h4 className="text-xs font-bold text-white line-clamp-2 mt-0.5 group-hover:text-teal-300 transition">
                                          {product?.name || 'Producto sin nombre'}
                                        </h4>
                                        {product?.category && (
                                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded text-slate-400 font-medium inline-block mt-1">
                                            {product.category}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Precios Duales */}
                                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                                      <div className="flex items-baseline justify-between">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                          Precio USD
                                        </span>
                                        <span className="text-sm font-black text-emerald-400">
                                          {usdPrice}
                                        </span>
                                      </div>
                                      {localPrice && (
                                        <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-slate-800/40">
                                          <span className="text-[10px] font-medium text-slate-500">
                                            Moneda Local
                                          </span>
                                          <span className="text-xs font-bold text-slate-200">
                                            ≈ {localPrice}
                                          </span>
                                        </div>
                                      )}
                                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/30">
                                        <span className="flex items-center gap-1 truncate">
                                          <span>{offer.store_country_flag || groupedStoreDetail.country_flag || '🌐'}</span>
                                          <span className="truncate">{offer.store_country_name || groupedStoreDetail.country_name || ''}</span>
                                        </span>
                                        {offer.last_checked_at && (
                                          <span className="text-[9px] text-slate-500">
                                            {new Date(offer.last_checked_at).toLocaleDateString('es-ES')}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Botones de Acción */}
                                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80">
                                    {targetProductUrl && (
                                      <a
                                        href={targetProductUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-2 px-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                                        title="Ir a la ficha del producto en la tienda oficial"
                                      >
                                        <span>Ir a la tienda</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                    {product && (
                                      <button
                                        onClick={() => setInspectingCatalogProduct(product)}
                                        className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
                                        title="Ver ficha técnica e ingredientes INCI"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* VIEW MODE 2: TABLA DE SUPERVISIÓN & TIERS */
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Comercio</th>
                    <th className="py-4 px-6">Propietario</th>
                    <th className="py-4 px-6">Plan / Destacado</th>
                    <th className="py-4 px-6">Sucursales</th>
                    <th className="py-4 px-6">Verificación</th>
                    <th className="py-4 px-6">Activo</th>
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No se encontraron comercios registrados bajo los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    stores.map((store) => (
                      <tr key={store.id} className="hover:bg-slate-800/30 transition">
                        {/* Comercio */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold shrink-0">
                              {store.logo_url ? (
                                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover rounded-xl" />
                              ) : (
                                <Store className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{store.name}</span>
                                <span
                                  className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 shadow-sm"
                                  title={store.country_name || (store.country_code === 'VE' ? 'Venezuela' : store.country_code)}
                                >
                                  <span>{store.country_flag || (store.country_code === 'VE' ? '🇻🇪' : '🌐')}</span>
                                  <span>{store.country_code || 'VE'}</span>
                                </span>
                                {store.is_featured && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5" /> PRO
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>ID: #{store.id}</span>
                                {store.website_url && (
                                  <a
                                    href={store.website_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-teal-400 hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" /> Web
                                  </a>
                                )}
                                {store.instagram_handle && (
                                  <span className="text-pink-400 flex items-center gap-1">
                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><circle cx="17.5" cy="6.5" r="1.5"></circle></svg>
                                    <span>{store.instagram_handle}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Propietario */}
                        <td className="py-4 px-6">
                          {store.owner ? (
                            <div>
                              <div className="font-semibold text-slate-200">{store.owner.name}</div>
                              <div className="text-xs text-slate-400">{store.owner.email}</div>
                              {store.owner.phone && (
                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" /> {store.owner.phone}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">Sin propietario asignado</span>
                          )}
                        </td>

                        {/* Plan */}
                        <td className="py-4 px-6">
                          <button
                            onClick={() => {
                              setTierModalStore(store);
                              setSelectedTier(store.subscription_tier || 'FREE');
                              setSelectedFeatured(Boolean(store.is_featured));
                            }}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition hover:opacity-80 ${
                              store.subscription_tier === 'ENTERPRISE'
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                                : store.subscription_tier === 'PRO_LOCAL'
                                ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>{store.subscription_tier || 'FREE'}</span>
                          </button>
                        </td>

                        {/* Sucursales */}
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
                            {store.branches_count || (store.branches ? store.branches.length : 0)} sede(s)
                          </span>
                        </td>

                        {/* Verificación */}
                        <td className="py-4 px-6">
                          {store.verification_status === 'VERIFIED' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                              <BadgeCheck className="w-3.5 h-3.5" />
                              <span>Verificada</span>
                            </span>
                          ) : store.verification_status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                              <X className="w-3.5 h-3.5" />
                              <span>Rechazada</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Por Revisar</span>
                            </span>
                          )}
                        </td>

                        {/* Activo / Inactivo */}
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleStoreStatus(store.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              store.is_active ? 'bg-teal-600' : 'bg-slate-800'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                store.is_active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Ver detalle / Inspeccionar */}
                            <button
                              onClick={() => handleInspectStore(store)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
                              title="Inspeccionar tienda y productos"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Ir a la tienda */}
                            {store.website_url && (
                              <a
                                href={store.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/30 transition"
                                title="Ir a la tienda oficial"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}

                            {/* Acciones de Aprobación rápida */}
                            {store.verification_status === 'PENDING_REVIEW' && (
                              <>
                                <button
                                  onClick={() => handleApproveStore(store.id)}
                                  className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 transition"
                                  title="Aprobar y activar tienda"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectModalStore(store);
                                    setRejectReason('');
                                  }}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition"
                                  title="Rechazar solicitud"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {/* Cambiar Plan */}
                            <button
                              onClick={() => {
                                setTierModalStore(store);
                                setSelectedTier(store.subscription_tier || 'FREE');
                                setSelectedFeatured(Boolean(store.is_featured));
                              }}
                              className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 transition"
                              title="Modificar plan comercial"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>

                            {/* Eliminar Tienda Definitivamente */}
                            <button
                              onClick={() => setDeleteModalStore(store)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 transition"
                              title="Eliminar tienda permanentemente y purgar del inventario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {storeTotalPages > 1 && (
              <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Página {storePage} de {storeTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={storePage <= 1}
                    onClick={() => setStorePage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg disabled:opacity-40 transition"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={storePage >= storeTotalPages}
                    onClick={() => setStorePage((p) => Math.min(storeTotalPages, p + 1))}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg disabled:opacity-40 transition"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )}

      {/* ================= MODAL: INSPECT STORE DETAILS & VITRINA ================= */}
      {inspectingStore && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold shrink-0 overflow-hidden">
                  {inspectingStore.logo_url ? (
                    <img src={inspectingStore.logo_url} alt={inspectingStore.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black text-white">
                      {inspectingStore.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <span>{inspectingStore.country_flag || '🌐'}</span>
                      <span>{inspectingStore.country_name || inspectingStore.country_code}</span>
                    </span>
                    {(inspectingStore.crawler_platform || (inspectingStore as any).platform) && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono text-[11px] font-bold">
                        {inspectingStore.crawler_platform || (inspectingStore as any).platform}
                      </span>
                    )}
                    {inspectingStore.is_featured && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Destacado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                    {inspectingStore.created_at && (
                      <span>Registrado el {new Date(inspectingStore.created_at).toLocaleDateString('es-ES')}</span>
                    )}
                    <span>&bull; Slug: <code className="text-teal-400 font-mono">{inspectingStore.slug}</code></span>
                    <span>&bull; Tipo: <span className="text-slate-300 font-semibold">{inspectingStore.store_type || 'ONLINE'}</span></span>
                  </p>
                </div>
              </div>

              {/* Botón Ir a la tienda y Cerrar */}
              <div className="flex items-center gap-2.5 shrink-0">
                {inspectingStore.website_url && (
                  <a
                    href={inspectingStore.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/10"
                    title="Abrir sitio web oficial de la tienda"
                  >
                    <span>Ir a la tienda oficial</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => setInspectingStore(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
                  title="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            {(() => {
              const offers = inspectingStore.product_offers || (inspectingStore as any).productOffers || [];
              const branches = inspectingStore.branches || [];
              return (
                <>
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <button
                      onClick={() => setStoreActiveTab('products')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        storeActiveTab === 'products'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>Catálogo y Ofertas ({offers.length})</span>
                    </button>
                    <button
                      onClick={() => setStoreActiveTab('info')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        storeActiveTab === 'info'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Datos del Comercio</span>
                    </button>
                    <button
                      onClick={() => setStoreActiveTab('branches')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        storeActiveTab === 'branches'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Sucursales Físicas ({branches.length})</span>
                    </button>
                  </div>

                  {/* TAB 1: PRODUCTOS & OFERTAS */}
                  {storeActiveTab === 'products' && (
                    <div className="space-y-4">
                      {/* Search and Summary Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={storeProductSearch}
                            onChange={(e) => setStoreProductSearch(e.target.value)}
                            placeholder="Buscar en el catálogo de esta tienda por producto o marca..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-semibold text-slate-300">
                            {offers.filter((o: any) => o.in_stock).length} En Stock
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-semibold text-teal-400">
                            {offers.length} Registrados
                          </span>
                        </div>
                      </div>

                      {/* Products Grid or Loading State */}
                      {isLoadingStoreDetail ? (
                        <div className="py-16 text-center text-slate-400 space-y-3">
                          <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin mx-auto" />
                          <p className="text-xs font-medium">Cargando inventario y precios duales en tiempo real...</p>
                        </div>
                      ) : offers.length === 0 ? (
                        <div className="py-16 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/80 p-8 space-y-2">
                          <Package className="w-10 h-10 text-slate-600 mx-auto" />
                          <p className="text-sm font-semibold text-slate-400">Esta tienda aún no tiene ofertas vinculadas.</p>
                          <p className="text-xs text-slate-500">Ejecuta el crawler automático o añade ofertas manualmente para poblar este catálogo.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                          {offers
                            .filter((offer: any) => {
                              if (!storeProductSearch.trim()) return true;
                              const q = storeProductSearch.toLowerCase();
                              const prodName = (offer.product?.name || '').toLowerCase();
                              const brandName = (offer.product?.brand?.name || '').toLowerCase();
                              return prodName.includes(q) || brandName.includes(q);
                            })
                            .map((offer: any) => {
                              const product = offer.product;
                              const usdPrice = offer.formatted_price_usd || (offer.price_usd ? `$${Number(offer.price_usd).toFixed(2)} USD` : (offer.price ? `$${Number(offer.price).toFixed(2)} USD` : 'N/D'));
                              const localPrice = offer.formatted_price_local || (offer.price_local ? `${offer.currency_local || ''} ${Number(offer.price_local).toLocaleString('es-ES')}` : null);
                              const targetUrl = offer.product_url || inspectingStore.website_url;

                              return (
                                <div
                                  key={offer.id}
                                  className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700/90 transition flex flex-col justify-between gap-3"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                      {product?.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <Package className="w-5 h-5 text-slate-600" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                                          {product?.brand?.name || 'Marca'}
                                        </span>
                                        {product?.category && (
                                          <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                                            {product.category}
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="text-xs font-bold text-white line-clamp-2 mt-0.5" title={product?.name}>
                                        {product?.name || 'Producto sin nombre'}
                                      </h4>
                                    </div>
                                  </div>

                                  {/* Pricing & Stock & Store Button */}
                                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs gap-2">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-white text-sm">{usdPrice}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                          offer.in_stock
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                          {offer.in_stock ? 'En Stock' : 'Agotado'}
                                        </span>
                                      </div>
                                      {localPrice && (
                                        <div className="text-[11px] text-teal-300/90 font-medium">
                                          &asymp; {localPrice}
                                        </div>
                                      )}
                                    </div>

                                    {targetUrl && (
                                      <a
                                        href={targetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold transition shrink-0"
                                        title="Ir a ver este producto en la tienda"
                                      >
                                        <span>Ir al producto</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: DATOS DE LA TIENDA & CONTACTO */}
                  {storeActiveTab === 'info' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Información de Contacto</h4>
                          <div className="text-sm space-y-1 text-slate-300">
                            <p><span className="text-slate-500">País / Sector:</span> <span className="text-slate-200 font-semibold">{inspectingStore.country_flag || '🌐'} {inspectingStore.country_name || inspectingStore.country_code} ({inspectingStore.country_code || 'N/A'})</span></p>
                            <p><span className="text-slate-500">Tipo de Comercio:</span> <span className="text-teal-400 font-semibold">{inspectingStore.store_type}</span></p>
                            <p><span className="text-slate-500">WhatsApp de Atención:</span> {inspectingStore.whatsapp_contact || 'No indicado'}</p>
                            <p><span className="text-slate-500">Email de Registro:</span> {inspectingStore.submitted_by_email || inspectingStore.owner?.email || 'No indicado'}</p>
                            {inspectingStore.website_url && (
                              <p className="flex items-center gap-1.5">
                                <span className="text-slate-500">Sitio Web:</span>
                                <a href={inspectingStore.website_url} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline flex items-center gap-1">
                                  {inspectingStore.website_url} <ExternalLink className="w-3 h-3" />
                                </a>
                              </p>
                            )}
                            {inspectingStore.instagram_handle && (
                              <p className="flex items-center gap-1.5">
                                <span className="text-slate-500">Instagram:</span>
                                <svg className="w-3.5 h-3.5 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><circle cx="17.5" cy="6.5" r="1.5"></circle></svg>
                                <span className="text-pink-300">@{inspectingStore.instagram_handle.replace('@', '')}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Propietario de la Cuenta</h4>
                          {inspectingStore.owner ? (
                            <div className="text-sm space-y-1 text-slate-300">
                              <p><span className="text-slate-500">Nombre:</span> {inspectingStore.owner.name}</p>
                              <p><span className="text-slate-500">Email de acceso:</span> {inspectingStore.owner.email}</p>
                              {inspectingStore.owner.phone && (
                                <p><span className="text-slate-500">Teléfono:</span> {inspectingStore.owner.phone}</p>
                              )}
                              <p><span className="text-slate-500">Rol de usuario:</span> <code className="text-teal-400">{inspectingStore.owner.role || 'business_owner'}</code></p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 italic">No hay propietario vinculado a este comercio.</p>
                          )}
                        </div>
                      </div>

                      {/* Rejection notice if rejected */}
                      {inspectingStore.verification_status === 'REJECTED' && inspectingStore.rejected_reason && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm text-red-300 space-y-1">
                          <div className="font-bold flex items-center gap-2 text-red-400">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Motivo del Rechazo:</span>
                          </div>
                          <p>{inspectingStore.rejected_reason}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: SUCURSALES FÍSICAS */}
                  {storeActiveTab === 'branches' && (
                    <div className="space-y-3">
                      {(!branches || branches.length === 0) ? (
                        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center text-slate-500 text-sm">
                          Esta tienda aún no tiene sucursales dadas de alta.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {branches.map((b: any) => (
                            <div
                              key={b.id}
                              className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <div className="font-bold text-white flex items-center gap-2">
                                  <span>{b.name}</span>
                                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${b.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                                    {b.is_active ? 'Activa' : 'Inactiva'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  <span>{b.address}, {b.city}</span>
                                </p>
                                {b.whatsapp && (
                                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    <span>WhatsApp: {b.whatsapp}</span>
                                  </p>
                                )}
                              </div>

                              <Link
                                href={`/en-tienda/${b.slug}`}
                                target="_blank"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-bold text-xs rounded-xl transition shrink-0"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Ver Vitrina en Vivo</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Modal Actions */}
            <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {inspectingStore.verification_status !== 'VERIFIED' && (
                  <button
                    onClick={() => handleApproveStore(inspectingStore.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprobar y Verificar</span>
                  </button>
                )}
                {inspectingStore.verification_status !== 'REJECTED' && (
                  <button
                    onClick={() => {
                      setRejectModalStore(inspectingStore);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Rechazar Solicitud</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setInspectingStore(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REJECT REASON ================= */}
      {rejectModalStore && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Rechazar Solicitud</h3>
                <p className="text-xs text-slate-400">{rejectModalStore.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Indique el motivo por el cual no se puede verificar este comercio. Esta retroalimentación orientará al solicitante para corregir sus datos.
            </p>

            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ejemplo: El RIF adjunto no coincide con la razón social declarada o los números de contacto no responden."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setRejectModalStore(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRejectStore}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-red-600/20"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPDATE SUBSCRIPTION TIER ================= */}
      {tierModalStore && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Plan y Suscripción</h3>
                <p className="text-xs text-slate-400">{tierModalStore.name}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
                Nivel de Suscripción (Tiers)
              </label>
              <div className="space-y-2">
                {[
                  { tier: 'FREE', title: 'Plan Básico (Free)', desc: '1 sede, catálogo estándar' },
                  { tier: 'PRO_LOCAL', title: 'Plan Pro Local', desc: 'Hasta 5 sedes, analíticas de leads' },
                  { tier: 'ENTERPRISE', title: 'Plan Corporativo', desc: 'Sedes ilimitadas, soporte prioritario' },
                ].map((opt) => (
                  <label
                    key={opt.tier}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selectedTier === opt.tier
                        ? 'bg-purple-500/10 border-purple-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tier_choice"
                      value={opt.tier}
                      checked={selectedTier === opt.tier}
                      onChange={() => setSelectedTier(opt.tier as any)}
                      className="mt-1 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="text-sm font-bold">{opt.title}</div>
                      <div className="text-xs text-slate-400">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Featured toggle */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFeatured}
                onChange={(e) => setSelectedFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Destacar en Directorio & Búsquedas</span>
                </div>
                <div className="text-xs text-slate-400">
                  Prioridad en las recomendaciones de rutinas y badge dorado en el mapa
                </div>
              </div>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTierModalStore(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmUpdateTier}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-purple-600/20"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRMAR ELIMINACIÓN DE TIENDA ================= */}
      {deleteModalStore && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Eliminar Tienda Definitivamente</h3>
                <p className="text-xs text-slate-400">{deleteModalStore.name}</p>
              </div>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-300 space-y-2">
              <p className="font-semibold flex items-center gap-1.5 text-rose-200">
                <AlertTriangle className="w-4 h-4 shrink-0" /> Acción Irreversible
              </p>
              <p>
                Al confirmar la eliminación de <strong>{deleteModalStore.name}</strong> ({deleteModalStore.country_flag || '🌐'} {deleteModalStore.country_code || 'VE'}):
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Se cancelarán y borrarán todas sus sucursales mapeadas.</li>
                <li>Se eliminarán todas sus ofertas de precio y enlaces comerciales.</li>
                <li>
                  <strong className="text-rose-200">Se purgarán del inventario</strong> todos los productos que eran exclusivos de esta tienda.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingStore}
                onClick={() => setDeleteModalStore(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingStore}
                onClick={handleConfirmDeleteStore}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-600/20 flex items-center gap-2"
              >
                {isDeletingStore ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Tienda y Purgar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SCRAPER & WEB CRAWLER */}
      {activeTab === 'scraper' && (
        <div className="space-y-6">
          {/* Métricas del Scraper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                Ofertas en PostgreSQL
              </div>
              <div className="text-3xl font-extrabold text-teal-400">
                {scraperData?.metrics?.total_offers ?? '...'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Precios y stock activos</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                Sucursales Mapeadas
              </div>
              <div className="text-3xl font-extrabold text-white">
                {scraperData?.metrics?.total_branches ?? '...'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Con geolocalización GPS</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                Cadenas Registradas
              </div>
              <div className="text-3xl font-extrabold text-purple-400">
                {scraperData?.metrics?.total_stores ?? '...'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Farmatodo, Locatel, etc.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                Frecuencia Cron
              </div>
              <div className="text-lg font-bold text-amber-400 mt-1">
                {scraperData?.metrics?.cron_frequency ?? 'Cada 2 horas'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Automático en segundo plano</p>
            </div>
          </div>

          {/* RESUMEN EJECUTIVO & SALUD DEL CRAWLER */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-400" />
                    <span>Resumen Ejecutivo del Crawler & Diagnóstico de Red</span>
                  </h3>
                  {crawlerSummary?.health && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      crawlerSummary.health.status === 'OPERATIONAL'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : crawlerSummary.health.status === 'ATTENTION'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}>
                      {crawlerSummary.health.badge} (Score: {crawlerSummary.health.score}/100)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {crawlerSummary?.health?.message || 'Auditoría en vivo de ofertas sincronizadas, cobertura de activos y salud de APIs.'}
                </p>
              </div>

              {/* Selector de ventana y botón refrescar */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                  <span className="text-slate-500 px-2 font-medium">Ventana:</span>
                  {[2, 6, 12, 24, 48].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => {
                        setSummaryHours(h);
                        loadCrawlerSummary(h);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        summaryHours === h
                          ? 'bg-teal-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => loadCrawlerSummary(summaryHours)}
                  disabled={isLoadingSummary}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                  title="Actualizar Resumen"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSummary ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
              </div>
            </div>

            {/* KPIs del Resumen */}
            {crawlerSummary?.kpis && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nuevas en {summaryHours}h</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    +{crawlerSummary.kpis.new_offers_period}
                  </div>
                  <span className="text-[10px] text-slate-500">ofertas descubiertas</span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Auditadas / Actualizadas</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1">
                    {crawlerSummary.kpis.updated_offers_period}
                  </div>
                  <span className="text-[10px] text-slate-500">precios y stock revisados</span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Disponibilidad en Stock</span>
                  <div className="text-2xl font-black text-white mt-1">
                    {crawlerSummary.kpis.stock_rate_percentage}%
                  </div>
                  <span className="text-[10px] text-slate-500">{crawlerSummary.kpis.in_stock_offers} con stock vivo</span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cobertura de Activos</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {crawlerSummary.kpis.crawled_ingredients_period}/{crawlerSummary.kpis.total_active_ingredients}
                  </div>
                  <span className="text-[10px] text-slate-500">{crawlerSummary.kpis.coverage_rate_percentage}% del catálogo clínico</span>
                </div>
              </div>
            )}

            {/* Clinical Quality Gate (Filtro Antibasura) - Fila Horizontal Ancho Completo (DLG-EXEC) */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
                      <span>Clinical Quality Gate (Filtro Antibasura)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Filtro de pureza INCI y validación clínica en tiempo real contra catálogo de activos
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold border border-teal-500/20 self-start sm:self-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span>Protección Activa</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Métricas de Diagnóstico (4 columnas) */}
                <div className="lg:col-span-4 grid grid-cols-3 gap-2.5 text-center p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Evaluados</span>
                    <span className="text-base font-black text-white mt-1 block">
                      {crawlerSummary?.execution_diagnostics?.total_evaluated_quality_gate ?? 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Aprobados</span>
                    <span className="text-base font-black text-emerald-400 mt-1 block">
                      {crawlerSummary?.execution_diagnostics?.total_accepted_quality_gate ?? 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">Rechazados</span>
                    <span className="text-base font-black text-rose-400 mt-1 block">
                      {crawlerSummary?.execution_diagnostics?.total_rejected_quality_gate ?? 0}
                    </span>
                  </div>
                </div>

                {/* Cola Round-Robin (8 columnas) */}
                <div className="lg:col-span-8 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <h5 className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <span>Próximos en cola Round-Robin:</span>
                    </h5>
                    <span className="text-[10px] text-slate-500">
                      {crawlerSummary?.next_queue?.length || 0} activos en turno
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {crawlerSummary?.next_queue && crawlerSummary.next_queue.length > 0 ? (
                      crawlerSummary.next_queue.map((nq: any) => (
                        <span
                          key={nq.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 hover:border-slate-700 transition"
                        >
                          {nq.inci_name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No hay activos pendientes en cola.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recomendaciones (si existen) */}
              {crawlerSummary?.recommendations && crawlerSummary.recommendations.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-wrap items-center gap-y-2 gap-x-6">
                  {crawlerSummary.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rendimiento por Cadena - Fila Horizontal Ancho Completo con Acordeón por Países (DLG-EXEC) */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
                <div>
                  <h4 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
                    <Store className="w-4 h-4 text-teal-400" />
                    <span>Rendimiento por Cadena ({crawlerSummary?.stores?.length || 0} Tiendas Registradas)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Rastreo activo cada 2 hrs &bull; Agrupado por país de origen para auditoría territorial y gestión rápida
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Buscador de tiendas en este bloque */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por tienda, país o plataforma..."
                      value={crawlerStoreSearch}
                      onChange={(e) => setCrawlerStoreSearch(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 w-44 sm:w-60 transition"
                    />
                    {crawlerStoreSearch && (
                      <button
                        type="button"
                        onClick={() => setCrawlerStoreSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Acciones Expandir / Colapsar Todos */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={expandAllCrawlerCountries}
                      className="px-2.5 py-1 text-slate-400 hover:text-white font-semibold transition"
                      title="Desplegar todos los países"
                    >
                      Expandir todos
                    </button>
                    <span className="text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={collapseAllCrawlerCountries}
                      className="px-2.5 py-1 text-slate-400 hover:text-white font-semibold transition"
                      title="Cerrar todos los países"
                    >
                      Colapsar todos
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de Países en Acordeón */}
              {groupedCrawlerStores.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800/80">
                  No se encontraron cadenas comerciales que coincidan con "{crawlerStoreSearch}".
                </div>
              ) : (
                <div className="space-y-3">
                  {groupedCrawlerStores.map((group, index) => {
                    const isExpanded = isCountryExpanded(group.code, group.totalOffers > 0, index === 0);

                    return (
                      <div
                        key={group.code}
                        className="bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden transition"
                      >
                        {/* Cabecera del Acordeón */}
                        <button
                          type="button"
                          onClick={() => toggleCrawlerCountry(group.code, isExpanded)}
                          className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-850/60 transition group cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl shrink-0" title={group.name}>
                              {group.flag}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white group-hover:text-teal-300 transition">
                                  {group.name}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-semibold">
                                  {group.code}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                <span>{group.stores.length} {group.stores.length === 1 ? 'tienda' : 'tiendas'}</span>
                                <span>&bull;</span>
                                <span className={group.totalOffers > 0 ? 'text-teal-400 font-semibold' : 'text-slate-500'}>
                                  {group.totalOffers} ofertas registradas
                                </span>
                                {group.newOffers > 0 && (
                                  <>
                                    <span>&bull;</span>
                                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 text-[10px]">
                                      +{group.newOffers} nuevas
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                              {isExpanded ? 'Ocultar' : 'Ver tiendas'}
                            </span>
                            <div className={`w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition transform ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </button>

                        {/* Cuerpo Desplegable del Acordeón */}
                        {isExpanded && (
                          <div className="p-3.5 pt-1 border-t border-slate-800/60 bg-slate-950/40">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                              {group.stores.map((st: any) => (
                                <div
                                  key={st.id}
                                  className="flex flex-col justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-teal-500/40 hover:bg-slate-900 transition shadow-xs group"
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleInspectStore(st)}
                                        className="font-bold text-white group-hover:text-teal-300 transition text-left flex items-center gap-1.5 text-xs"
                                        title="Haz clic para inspeccionar tienda y catálogo"
                                      >
                                        <span className="line-clamp-1">{st.name}</span>
                                        <Eye className="w-3 h-3 text-slate-500 group-hover:text-teal-400 shrink-0" />
                                      </button>
                                      <span className="text-teal-400 font-mono bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20 text-[10px] font-semibold shrink-0">
                                        {st.platform}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-800/50">
                                      <span className="text-slate-400">
                                        Estado: <span className="text-slate-300 font-medium">{st.last_crawled_human}</span>
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-teal-400 font-bold">
                                          {st.total_offers} ofertas
                                        </span>
                                        {st.new_offers_period > 0 && (
                                          <span className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                            +{st.new_offers_period}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/50">
                                    <button
                                      type="button"
                                      onClick={() => handleInspectStore(st)}
                                      className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center justify-center gap-1.5"
                                      title="Inspeccionar catálogo y datos de la tienda"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-teal-400" />
                                      <span>Ver productos</span>
                                    </button>

                                    {st.website_url && (
                                      <a
                                        href={st.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-1.5 px-2.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold rounded-lg border border-teal-500/30 transition flex items-center justify-center gap-1 shrink-0"
                                        title="Ir a la tienda oficial"
                                      >
                                        <span>Ir a la tienda</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Variaciones de Precios Recientes si existen */}
            {crawlerSummary?.recent_price_changes && crawlerSummary.recent_price_changes.length > 0 && (
              <div className="bg-slate-950/40 border border-slate-800/70 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-2">
                  <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Variaciones de Precios Auditadas Recientemente</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {crawlerSummary.recent_price_changes.map((pch: any) => (
                    <div key={pch.id} className="p-2.5 bg-slate-900/60 border border-slate-800/60 rounded-lg text-xs">
                      <div className="font-semibold text-white truncate">{pch.product_name}</div>
                      <div className="text-[10px] text-slate-400">{pch.store_name} • {pch.recorded_at}</div>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="text-slate-400 line-through">${pch.old_price_usd.toFixed(2)}</span>
                        <span className="font-bold text-white">${pch.new_price_usd.toFixed(2)}</span>
                        <span className={`font-bold ${pch.is_discount ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {pch.difference_usd > 0 ? '+' : ''}${pch.difference_usd.toFixed(2)} ({pch.percentage_change}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Consola de Control de Rastreo */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-teal-400" />
                  <span>Motor de Rastreo Comercial & Descubrimiento Científico</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rastrea el mercado en base a activos comprobados con estudios clínicos, por tiendas o por URL directa.
                </p>
              </div>

              {/* Selector de Estrategia */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setScraperForm({ ...scraperForm, mode: 'ingredient', url: '' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    scraperForm.mode === 'ingredient' || scraperForm.mode === 'all_active_ingredients'
                      ? 'bg-teal-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Por Componente</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScraperForm({ ...scraperForm, mode: 'chain', url: '' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    scraperForm.mode === 'chain'
                      ? 'bg-teal-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Por Tienda</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScraperForm({ ...scraperForm, mode: 'url' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    scraperForm.mode === 'url'
                      ? 'bg-teal-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Por URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScraperForm({ ...scraperForm, mode: 'refresh_prices', url: '' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    scraperForm.mode === 'refresh_prices'
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-amber-400/80 hover:text-amber-300'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Auditar Precios & Stock</span>
                </button>
              </div>
            </div>

            {/* ESTRATEGIA 1: POR COMPONENTE ACTIVO CON ESTUDIOS (RECOMENDADO) */}
            {(scraperForm.mode === 'ingredient' || scraperForm.mode === 'all_active_ingredients') && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Selector de Activo Científico */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      🔬 Componente / Activo con Evidencia Clínica
                    </label>
                    <select
                      value={scraperForm.mode === 'all_active_ingredients' ? 'ALL' : scraperForm.ingredient_id}
                      onChange={(e) => {
                        if (e.target.value === 'ALL') {
                          setScraperForm({ ...scraperForm, mode: 'all_active_ingredients', ingredient_id: '' });
                        } else {
                          setScraperForm({ ...scraperForm, mode: 'ingredient', ingredient_id: e.target.value });
                        }
                      }}
                      disabled={isScraperRunning}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
                    >
                      <option value="ALL">🌟 Rastrear TODOS los componentes con evidencia clínica (Nivel A)</option>
                      {scraperData?.active_ingredients?.map((ing: any) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.common_name || ing.inci_name} ({ing.inci_name}) — {ing.studies_count} Estudios PubMed | {ing.products_count} productos en base
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Botón de Ejecución */}
                  <div className="flex items-end">
                    <button
                      onClick={handleRunScraper}
                      disabled={isScraperRunning}
                      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-teal-500/20 disabled:opacity-50"
                    >
                      {isScraperRunning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Rastreando en tiempo real...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Buscar Productos en el Mercado</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    El motor buscará en los catálogos de farmacias y comercios los productos formulados con este activo químico,
                    extrayendo precios actualizados, fotos, presentaciones, disponibilidad física y coordenadas GPS, vinculándolos automáticamente a su ficha de estudios en PostgreSQL.
                  </span>
                </div>
              </div>
            )}

            {/* ESTRATEGIA 2: POR CADENA / TIENDA */}
            {scraperForm.mode === 'chain' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Cadena / Driver
                  </label>
                  <select
                    value={scraperForm.store}
                    onChange={(e) => setScraperForm({ ...scraperForm, store: e.target.value })}
                    disabled={isScraperRunning}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
                  >
                    <option value="all">Todas las cadenas (Farmatodo + Locatel)</option>
                    <option value="farmatodo">Farmatodo</option>
                    <option value="locatel">Locatel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Ciudad (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Valle de la Pascua, Caracas"
                    value={scraperForm.city}
                    onChange={(e) => setScraperForm({ ...scraperForm, city: e.target.value })}
                    disabled={isScraperRunning}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleRunScraper}
                    disabled={isScraperRunning}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-md shadow-teal-500/20 disabled:opacity-50"
                  >
                    {isScraperRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Rastreando tienda...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Rastrear Catálogo de Cadena</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ESTRATEGIA 3: POR URL OBJETIVO DIRECTO */}
            {scraperForm.mode === 'url' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  🎯 URL Objetivo Directo (Página de Producto de Cualquier Farmacia / E-commerce)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Pega aquí la URL directa: https://www.farmatodo.com.ve/producto/... o https://www.locatel.com.ve/..."
                    value={scraperForm.url}
                    onChange={(e) => setScraperForm({ ...scraperForm, url: e.target.value })}
                    disabled={isScraperRunning}
                    className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                  {scraperForm.url && (
                    <button
                      onClick={() => setScraperForm({ ...scraperForm, url: '' })}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                    >
                      Limpiar
                    </button>
                  )}
                  <button
                    onClick={handleRunScraper}
                    disabled={isScraperRunning || !scraperForm.url}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition disabled:opacity-50"
                  >
                    {isScraperRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>Extraer Datos</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  El motor inspeccionará automáticamente Schema.org (JSON-LD), OpenGraph y metadatos HTML para extraer el nombre, precio, divisa, stock y código de barras.
                </p>
              </div>
            )}

            {/* ESTRATEGIA 4: AUDITORÍA LIGERA DE PRECIOS Y STOCK (PRODUCTOS YA REGISTRADOS) */}
            {scraperForm.mode === 'refresh_prices' && (
              <div className="space-y-4 bg-slate-950/70 p-5 rounded-2xl border border-amber-500/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-amber-400" />
                      <span>Monitoreo de Precios & Disponibilidad (URLs Registradas)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      Revisa en lote únicamente las URLs ya almacenadas en la base de datos para detectar aumentos de precio, rebajas o roturas de stock. No realiza rastreos pesados ni re-inserta duplicados.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={scraperForm.store}
                      onChange={(e) => setScraperForm({ ...scraperForm, store: e.target.value })}
                      disabled={isScraperRunning}
                      className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400"
                    >
                      <option value="all">Todas las tiendas</option>
                      <option value="locatel">Locatel</option>
                    </select>

                    <button
                      onClick={handleRunScraper}
                      disabled={isScraperRunning}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-400/20 disabled:opacity-50"
                    >
                      {isScraperRunning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Auditando ofertas...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Auditar Ofertas Ahora</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Consola de Salida en Vivo */}
          {scraperConsoleOutput && (
            <div className="bg-black/90 border border-emerald-500/40 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Terminal className="w-4 h-4" />
                  <span>Salida de Consola en Tiempo Real</span>
                </div>
                <button
                  onClick={() => setScraperConsoleOutput(null)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Cerrar Consola
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap overflow-x-auto max-h-80 leading-relaxed">
                {scraperConsoleOutput}
              </pre>
            </div>
          )}

          {/* Tabla de Ofertas y Precios Recientemente Sincronizados */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-white">Últimos Precios Sincronizados en PostgreSQL</h4>
                <p className="text-xs text-slate-400 mt-0.5">Historial reciente de ofertas activas en anaqueles</p>
              </div>
              <button
                onClick={loadScraperStatus}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualizar
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Tienda / Sucursal</th>
                    <th className="p-3">Producto</th>
                    <th className="p-3">Marca</th>
                    <th className="p-3 text-right">Precio USD</th>
                    <th className="p-3 text-right">Precio VES</th>
                    <th className="p-3 text-center">Stock</th>
                    <th className="p-3 text-right">Verificado</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {scraperData?.recent_offers && scraperData.recent_offers.length > 0 ? (
                    scraperData.recent_offers.map((offer: any) => (
                      <tr
                        key={offer.id}
                        onClick={() => setInspectingOffer(offer)}
                        className="hover:bg-slate-800/60 cursor-pointer transition group"
                      >
                        <td className="p-3">
                          <span className="font-bold text-white block group-hover:text-teal-300 transition">{offer.store_name}</span>
                          <span className="text-[10px] text-slate-400">{offer.branch_name}</span>
                        </td>
                        <td className="p-3 font-medium text-slate-200">
                          <span className="group-hover:text-teal-300 font-semibold transition">
                            {offer.product_name}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{offer.brand_name}</td>
                        <td className="p-3 text-right font-extrabold text-emerald-400">
                          ${Number(offer.price).toFixed(2)} USD
                        </td>
                        <td className="p-3 text-right text-slate-300 font-medium">
                          {offer.price_ves != null 
                            ? `Bs. ${Number(offer.price_ves).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                            : 'N/A'}
                        </td>
                        <td className="p-3 text-center">
                          {offer.in_stock ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                              En Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300">
                              Agotado
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right text-slate-500 text-[11px]">
                          {offer.last_checked_at}
                        </td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setInspectingOffer(offer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-bold text-[11px] transition border border-teal-500/30"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Datos</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500">
                        No hay ofertas registradas aún. Ejecuta un rastreo para comenzar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visor de Logs del Cron (scraper.log) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Registro de Tareas Programadas (storage/logs/scraper.log)</span>
              </h4>
            </div>
            <pre className="text-xs font-mono bg-slate-950 p-4 rounded-xl text-slate-400 border border-slate-800/80 max-h-52 overflow-y-auto whitespace-pre-wrap">
              {scraperData?.logs || 'Sin logs disponibles'}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: CATÁLOGO MAESTRO DE PRODUCTOS & FÓRMULAS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Header & KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Productos en Catálogo</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">
                {catalogTotal}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Registrados en PostgreSQL</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Marcas en Base</span>
              <div className="text-2xl font-black text-white mt-1">
                {Array.from(new Set(catalogProducts.map((p) => p.brand?.name).filter(Boolean))).length || 5}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Laboratorios y marcas activas</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ofertas Vinculadas</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {catalogProducts.reduce((acc, p) => acc + (p.store_offers?.length || 0), 0)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">En farmacias y tiendas aliadas</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Auditoría Química</span>
              <div className="text-2xl font-black text-purple-400 mt-1">
                CosIng INCI
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Nivel de seguridad y activos</p>
            </div>
          </div>

          {/* Filtros y Buscador */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, marca o código EAN..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCatalogPage(1);
                      loadCatalogProducts();
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <select
                value={catalogCategoryFilter}
                onChange={(e) => {
                  setCatalogCategoryFilter(e.target.value);
                  setCatalogPage(1);
                }}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Todas las Categorías</option>
                <option value="SERUM">Sérum</option>
                <option value="CLEANSER">Limpiador Facial</option>
                <option value="MOISTURIZER">Hidratante</option>
                <option value="SUNSCREEN">Protector Solar (SPF)</option>
                <option value="EXFOLIANT">Exfoliante</option>
                <option value="EYE_CARE">Contorno de Ojos</option>
                <option value="TONER">Tónico</option>
              </select>

              <select
                value={catalogStoreFilter}
                onChange={(e) => {
                  setCatalogStoreFilter(e.target.value);
                  setCatalogPage(1);
                }}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Todas las Tiendas</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.country_flag || '🌐'} {s.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setCatalogPage(1);
                  loadCatalogProducts();
                }}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition"
              >
                Buscar
              </button>

              {(catalogSearch || catalogCategoryFilter || catalogStoreFilter) && (
                <button
                  onClick={() => {
                    setCatalogSearch('');
                    setCatalogCategoryFilter('');
                    setCatalogStoreFilter('');
                    setCatalogPage(1);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition"
                >
                  Limpiar
                </button>
              )}
            </div>

            <button
              onClick={loadCatalogProducts}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Actualizar
            </button>
          </div>

          {/* Tabla de Productos del Catálogo */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Producto & Marca</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Formato / Envase</th>
                    <th className="p-3">Código EAN</th>
                    <th className="p-3">Fórmula INCI</th>
                    <th className="p-3">Tiendas & Precios</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {catalogProducts && catalogProducts.length > 0 ? (
                    catalogProducts.map((product: any) => {
                      const bestOffer = product.store_offers && product.store_offers.length > 0
                        ? [...product.store_offers].sort((a, b) => a.price - b.price)[0]
                        : null;

                      return (
                        <tr
                          key={product.id}
                          onClick={() => setInspectingCatalogProduct(product)}
                          className="hover:bg-slate-800/60 cursor-pointer transition group"
                        >
                          <td className="p-3">
                            <span className="font-bold text-white block group-hover:text-teal-300 transition text-sm">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className="font-medium text-slate-300">{product.brand?.name || 'Genérica'}</span>
                              {product.brand?.country_origin && (
                                <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded text-slate-400">
                                  {product.brand.country_origin}
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                              {product.category || 'SKINCARE'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">
                            <span className="block font-semibold">
                              {product.volume_amount} {product.volume_unit}
                            </span>
                            <span className="text-[10px] text-slate-500 capitalize">
                              {product.container_type ? product.container_type.replace('_', ' ').toLowerCase() : 'Estándar'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-400">
                            {product.barcode_ean || 'Sin registrar'}
                          </td>
                          <td className="p-3">
                            {product.ingredients && product.ingredients.length > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300">
                                  {product.ingredients.length} ingredientes
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px]">En auditoría</span>
                            )}
                          </td>
                          <td className="p-3">
                            {product.store_offers && product.store_offers.length > 0 ? (
                              <div>
                                <span className="text-xs font-extrabold text-emerald-400 block">
                                  Desde {bestOffer?.formatted_price_usd || `$${bestOffer?.price?.toFixed(2)} USD`}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {product.store_offers.length} {product.store_offers.length === 1 ? 'tienda' : 'tiendas'} ({product.store_offers.map((o: any) => `${o.store_country_flag || o.store?.country_flag || '🌐'} ${o.store?.name}`).filter(Boolean).join(', ')})
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Sin ofertas activas</span>
                            )}
                          </td>
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setInspectingCatalogProduct(product)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-bold text-[11px] transition border border-teal-500/30"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ficha Técnica</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No se encontraron productos en el catálogo con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {catalogTotalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Página {catalogPage} de {catalogTotalPages} ({catalogTotal} productos)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCatalogPage((prev) => Math.max(prev - 1, 1))}
                    disabled={catalogPage <= 1}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCatalogPage((prev) => Math.min(prev + 1, catalogTotalPages))}
                    disabled={catalogPage >= catalogTotalPages}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL FICHA TÉCNICA DEL PRODUCTO (CATÁLOGO) */}
      {inspectingCatalogProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                  {inspectingCatalogProduct.category || 'SKINCARE'}
                </span>
                <h3 className="text-xl font-bold text-white mt-2">
                  {inspectingCatalogProduct.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Marca: <span className="text-slate-200 font-medium">{inspectingCatalogProduct.brand?.name || 'Genérica'}</span>
                  {inspectingCatalogProduct.brand?.country_origin && (
                    <span> • Origen: {inspectingCatalogProduct.brand.country_origin}</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setInspectingCatalogProduct(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid de Especificaciones Técnicas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Volumen / Peso</span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {inspectingCatalogProduct.volume_amount} {inspectingCatalogProduct.volume_unit}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipo de Envase</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block capitalize truncate">
                  {inspectingCatalogProduct.container_type ? inspectingCatalogProduct.container_type.replace('_', ' ').toLowerCase() : 'Estándar'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PAO (Caducidad)</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {inspectingCatalogProduct.pao_months ? `${inspectingCatalogProduct.pao_months} meses` : '12 meses'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Código EAN</span>
                <span className="text-xs font-mono text-slate-300 mt-1 block truncate">
                  {inspectingCatalogProduct.barcode_ean || 'Sin código'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Momento de Uso</span>
                <span className="text-xs font-bold text-teal-300 mt-1 block">
                  {inspectingCatalogProduct.recommended_timing === 'AM' && '☀️ Solo Mañana'}
                  {inspectingCatalogProduct.recommended_timing === 'PM' && '🌙 Solo Noche'}
                  {(!inspectingCatalogProduct.recommended_timing || inspectingCatalogProduct.recommended_timing === 'BOTH') && '☀️/🌙 Día y Noche'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Textura</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block capitalize">
                  {inspectingCatalogProduct.texture_type ? inspectingCatalogProduct.texture_type.replace('_', ' ').toLowerCase() : 'Suave'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">pH Teórico</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {inspectingCatalogProduct.ph_level ? inspectingCatalogProduct.ph_level.toFixed(1) : 'Fisiológico (5.5)'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dosis Sugerida</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {inspectingCatalogProduct.dosage_per_application_ml ? `${inspectingCatalogProduct.dosage_per_application_ml} ml` : '0.50 ml'}
                </span>
              </div>
            </div>

            {/* Disponibilidad y Comparativa de Precios en Tiendas */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-400" />
                <span>Precios y Disponibilidad en Tiendas ({inspectingCatalogProduct.store_offers?.length || 0})</span>
              </h4>
              {inspectingCatalogProduct.store_offers && inspectingCatalogProduct.store_offers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inspectingCatalogProduct.store_offers.map((offer: any) => (
                    <div key={offer.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-white">{offer.store?.name || 'Tienda'}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md border border-slate-700 font-medium">
                            {offer.store_country_flag || offer.store?.country_flag || '🌐'} {offer.store_country_name || offer.store?.country_name || ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-extrabold text-emerald-400">
                            {offer.formatted_price_usd || `$${Number(offer.price).toFixed(2)} USD`}
                          </span>
                          {offer.currency_local && offer.currency_local !== 'USD' ? (
                            <span className="text-[11px] text-slate-400">
                              (≈ {offer.formatted_price_local})
                            </span>
                          ) : (offer.price_ves ? (
                            <span className="text-[11px] text-slate-400">
                              (Bs. {Number(offer.price_ves).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                            </span>
                          ) : null)}
                        </div>
                        <span className={`text-[10px] font-bold inline-block mt-1 px-2 py-0.5 rounded-full ${
                          offer.in_stock ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {offer.in_stock ? 'En Stock' : 'Agotado'}
                        </span>
                      </div>
                      {offer.product_url && (
                        <a
                          href={offer.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs transition border border-slate-700"
                        >
                          <span>Visitar</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  Actualmente no hay ofertas activas registradas para este producto en las tiendas aliadas.
                </p>
              )}
            </div>

            {/* Fórmula e Ingredientes INCI */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Fórmula Dermatológica & Activos Declarados ({inspectingCatalogProduct.ingredients?.length || 0})
              </h4>
              {inspectingCatalogProduct.ingredients && inspectingCatalogProduct.ingredients.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  {inspectingCatalogProduct.ingredients.map((ing: any, idx: number) => (
                    <span
                      key={idx}
                      className={`text-xs px-2.5 py-1 rounded-lg border ${
                        ing.is_active || ing.pivot?.is_declared_active
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 font-semibold'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {ing.inci_name || ing.name} {(ing.is_active || ing.pivot?.is_declared_active) && '⭐'}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  Los ingredientes de este producto están pendientes de auditoría química INCI o no fueron declarados por la tienda de origen.
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Link
                href={`/escaner?query=${encodeURIComponent(inspectingCatalogProduct.name)}`}
                className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auditar fórmula con IA en el Escáner</span>
              </Link>
              <button
                onClick={() => setInspectingCatalogProduct(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES COMPLETOS DEL PRODUCTO DESDE SCRAPER */}
      {inspectingOffer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                  {inspectingOffer.category || 'SKINCARE'}
                </span>
                <h3 className="text-xl font-bold text-white mt-2">
                  {inspectingOffer.product_name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Marca: <span className="text-slate-200 font-medium">{inspectingOffer.brand_name}</span> • Tienda: <span className="text-teal-300 font-medium">{inspectingOffer.store_name}</span> ({inspectingOffer.branch_name})
                </p>
              </div>
              <button
                onClick={() => setInspectingOffer(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid de Atributos del Producto */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Precio USD</span>
                <span className="text-base font-extrabold text-teal-400 mt-0.5 block">
                  ${inspectingOffer.price.toFixed(2)}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Precio VES</span>
                <span className="text-base font-extrabold text-slate-200 mt-0.5 block">
                  {inspectingOffer.price_ves != null 
                    ? `Bs. ${Number(inspectingOffer.price_ves).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                    : 'N/A'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Disponibilidad</span>
                <span className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${
                  inspectingOffer.in_stock ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {inspectingOffer.in_stock ? 'En Stock' : 'Agotado'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Código EAN</span>
                <span className="text-xs font-mono text-slate-300 mt-1 block truncate">
                  {inspectingOffer.barcode_ean || 'Sin código'}
                </span>
              </div>
            </div>

            {/* Enlace a la Tienda de Origen */}
            {inspectingOffer.product_url && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">URL de Venta Original</span>
                  <span className="text-[11px] text-slate-400 font-mono truncate max-w-md block mt-0.5">
                    {inspectingOffer.product_url}
                  </span>
                </div>
                <a
                  href={inspectingOffer.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
                >
                  <span>Ir a la tienda</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Ingredientes INCI */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Fórmula Dermatológica & Activos Declarados ({inspectingOffer.ingredients?.length || 0})
              </h4>
              {inspectingOffer.ingredients && inspectingOffer.ingredients.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  {inspectingOffer.ingredients.map((ing: any, idx: number) => (
                    <span
                      key={idx}
                      className={`text-xs px-2.5 py-1 rounded-lg border ${
                        ing.is_active
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 font-semibold'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {ing.name} {ing.is_active && '⭐'}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  Los ingredientes de este producto están pendientes de auditoría química INCI o no fueron declarados por la tienda de origen.
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Link
                href={`/escaner?query=${encodeURIComponent(inspectingOffer.product_name)}`}
                className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auditar fórmula con IA en el Escáner</span>
              </Link>
              <button
                onClick={() => setInspectingOffer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Cargando consola de administración...</p>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}

