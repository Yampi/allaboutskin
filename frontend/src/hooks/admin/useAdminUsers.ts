import { useState, useCallback } from 'react';
import { fetchAdminUsers, updateAdminUserRole, toggleAdminUserStatus, unlockAdminUser, UserRoleType } from '@/lib/api';

export function useAdminUsers(onNotify?: (type: 'success' | 'error', message: string) => void) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);

  const loadUsers = useCallback(async (page?: number) => {
    setIsLoading(true);
    const targetPage = page ?? userPage;
    try {
      const res = await fetchAdminUsers({
        page: targetPage,
        search: userSearch.trim() || undefined,
        role: userRoleFilter || undefined,
      });
      setUsers(res.data || []);
      setUserTotalPages(res.last_page || 1);
      if (res.total !== undefined) setUsersTotal(res.total);
      if (page) setUserPage(page);
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, [userPage, userSearch, userRoleFilter, onNotify]);

  const handleRoleChange = useCallback(async (userId: number, newRole: UserRoleType) => {
    try {
      await updateAdminUserRole(userId, newRole);
      onNotify?.('success', 'Rol de usuario actualizado exitosamente');
      await loadUsers();
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al actualizar rol');
    }
  }, [loadUsers, onNotify]);

  const handleToggleStatus = useCallback(async (userId: number) => {
    try {
      const res = await toggleAdminUserStatus(userId);
      onNotify?.('success', res.message || 'Estado modificado');
      await loadUsers();
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al cambiar estado');
    }
  }, [loadUsers, onNotify]);

  const handleUnlockUser = useCallback(async (userId: number) => {
    try {
      const res = await unlockAdminUser(userId);
      onNotify?.('success', res.message || 'Cuenta desbloqueada');
      await loadUsers();
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al desbloquear cuenta');
    }
  }, [loadUsers, onNotify]);

  return {
    users,
    isLoading,
    userSearch,
    setUserSearch,
    userRoleFilter,
    setUserRoleFilter,
    userPage,
    setUserPage,
    userTotalPages,
    usersTotal,
    loadUsers,
    handleRoleChange,
    handleToggleStatus,
    handleUnlockUser,
  };
}
