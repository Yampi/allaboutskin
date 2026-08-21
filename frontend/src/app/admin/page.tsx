'use client';

import React, { useState, useEffect } from 'react';
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
  UserRoleType,
  SecurityAuditLogItem,
} from '@/lib/api';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'security' | 'settings'>('users');
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

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'security') {
      loadSecurityData();
    } else if (activeTab === 'settings') {
      loadSettingsData();
    }
  }, [activeTab, userPage, userRoleFilter, logPage, logSeverityFilter]);

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
                        <div className="font-semibold text-slate-300">{log.ip_address || '127.0.0.1'}</div>
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
    </div>
  );
}
