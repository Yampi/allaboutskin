import React, { useEffect } from 'react';
import AdminUsersFilters from './AdminUsersFilters';
import AdminUsersTable from './AdminUsersTable';
import AdminUsersPagination from './AdminUsersPagination';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';

interface AdminUsersTabProps {
  onNotify?: (type: 'success' | 'error', message: string) => void;
}

export default function AdminUsersTab({ onNotify }: AdminUsersTabProps) {
  const {
    users,
    isLoading,
    userSearch,
    setUserSearch,
    userRoleFilter,
    setUserRoleFilter,
    userPage,
    userTotalPages,
    usersTotal,
    loadUsers,
    handleRoleChange,
    handleToggleStatus,
    handleUnlockUser,
  } = useAdminUsers(onNotify);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div className="space-y-4">
      <AdminUsersFilters
        search={userSearch}
        onSearchChange={setUserSearch}
        roleFilter={userRoleFilter}
        onRoleFilterChange={setUserRoleFilter}
        onRefresh={() => loadUsers(1)}
        isLoading={isLoading}
      />

      <AdminUsersTable
        users={users}
        onRoleChange={handleRoleChange}
        onToggleStatus={handleToggleStatus}
        onUnlockUser={handleUnlockUser}
      />

      <AdminUsersPagination
        currentPage={userPage}
        totalPages={userTotalPages}
        totalUsers={usersTotal}
        onPageChange={(page) => loadUsers(page)}
        isLoading={isLoading}
      />
    </div>
  );
}
