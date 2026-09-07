'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  updateAdminStoreVerification,
  updateAdminStoreSubscription,
  toggleAdminStoreStatus,
  AdminStoreItem,
  UserRoleType,
  SecurityAuditLogItem,
} from '@/lib/api';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'security' | 'settings' | 'stores'>('stores');
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
  const [storePage, setStorePage] = useState(1);
  const [storeTotalPages, setStoreTotalPages] = useState(1);
  const [inspectingStore, setInspectingStore] = useState<AdminStoreItem | null>(null);
  const [rejectModalStore, setRejectModalStore] = useState<AdminStoreItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [tierModalStore, setTierModalStore] = useState<AdminStoreItem | null>(null);
  const [selectedTier, setSelectedTier] = useState<'FREE' | 'PRO_LOCAL' | 'ENTERPRISE'>('FREE');
  const [selectedFeatured, setSelectedFeatured] = useState(false);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
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

  // Load Stores
  const loadStores = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminStores({
        page: storePage,
        search: storeSearch,
        verification_status: storeStatusFilter,
        subscription_tier: storeTierFilter,
      });
      setStores(res.stores?.data || []);
      setStoreTotalPages(res.stores?.last_page || 1);
      if (res.summary) {
        setStoreSummary(res.summary);
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
    }
  }, [activeTab, userPage, userRoleFilter, logPage, logSeverityFilter, storePage, storeStatusFilter, storeTierFilter]);

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
            Administración & Seguridad RBAC
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestión de privilegios, salvaguarda de perfiles de usuario y monitoreo anti-intrusión.
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
          onClick={() => setActiveTab('users')}
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
          onClick={() => setActiveTab('security')}
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
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'settings'
              ? 'border-teal-500 text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configuraciones & Infraestructura</span>
        </button>

        <button
          onClick={() => setActiveTab('stores')}
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

              <button
                onClick={() => {
                  setStoreSearch('');
                  setStoreStatusFilter('');
                  setStoreTierFilter('');
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

          {/* Stores Table */}
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
                              onClick={() => setInspectingStore(store)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
                              title="Inspeccionar tienda y sucursales"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

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
        </div>
      )}

      {/* ================= MODAL: INSPECT STORE DETAILS & VITRINA ================= */}
      {inspectingStore && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
                  {inspectingStore.logo_url ? (
                    <img src={inspectingStore.logo_url} alt={inspectingStore.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Store className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    {inspectingStore.name}
                    {inspectingStore.is_featured && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
                        Destacado
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Registrado el {new Date(inspectingStore.created_at).toLocaleDateString('es-ES')} &bull; Slug:{' '}
                    <code className="text-teal-400">{inspectingStore.slug}</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingStore(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Información de Contacto</h4>
                <div className="text-sm space-y-1 text-slate-300">
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

            {/* Branches & Vitrinas Públicas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  <span>Sucursales & Vitrinas Digitales ({inspectingStore.branches?.length || 0})</span>
                </h4>
              </div>

              {(!inspectingStore.branches || inspectingStore.branches.length === 0) ? (
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center text-slate-500 text-sm">
                  Esta tienda aún no tiene sucursales dadas de alta.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {inspectingStore.branches.map((b) => (
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

                      {/* Public storefront preview link */}
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
    </div>
  );
}
