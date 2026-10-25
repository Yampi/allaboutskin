'use client';

import React, { useState, Suspense } from 'react';
import AdminSidebar, { AdminTabKey } from '@/components/admin/layout/AdminSidebar';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import AdminNavTabs from '@/components/admin/layout/AdminNavTabs';
import AdminMobileNav from '@/components/admin/layout/AdminMobileNav';
import AdminToast from '@/components/admin/layout/AdminToast';
import AdminDashboardOverview from '@/components/admin/AdminDashboardOverview';
import AdminUsersTab from '@/components/admin/users/AdminUsersTab';
import AdminStoresTab from '@/components/admin/stores/AdminStoresTab';
import AdminIngredientsTab from '@/components/admin/AdminIngredientsTab';
import AdminProductsTab from '@/components/admin/products/AdminProductsTab';
import AdminScraperTab from '@/components/admin/scraper/AdminScraperTab';
import AdminSecurityTab from '@/components/admin/security/AdminSecurityTab';
import AdminSettingsTab from '@/components/admin/settings/AdminSettingsTab';

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState<AdminTabKey>('inicio');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col lg:flex-row antialiased font-sans pb-16 lg:pb-0">
      <AdminToast notification={notification} />
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 min-w-0 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-5">
        <AdminTopbar />
        <AdminNavTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="pt-1">
          {activeTab === 'inicio' && <AdminDashboardOverview onNavigateTab={setActiveTab} />}
          {activeTab === 'users' && <AdminUsersTab onNotify={showNotification} />}
          {activeTab === 'stores' && <AdminStoresTab onNotify={showNotification} />}
          {activeTab === 'ingredients' && <AdminIngredientsTab />}
          {activeTab === 'products' && <AdminProductsTab />}
          {activeTab === 'scraper' && <AdminScraperTab onNotify={showNotification} />}
          {activeTab === 'security' && <AdminSecurityTab onNotify={showNotification} />}
          {activeTab === 'settings' && <AdminSettingsTab onNotify={showNotification} />}
        </div>
      </main>

      <AdminMobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Cargando Centro de Control...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
