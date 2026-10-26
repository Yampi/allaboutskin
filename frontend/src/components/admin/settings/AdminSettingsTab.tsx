import React, { useEffect } from 'react';
import AdminSettingsHealth from './AdminSettingsHealth';
import AdminSettingsForm from './AdminSettingsForm';
import { useAdminSettings } from '@/hooks/admin/useAdminSettings';

interface AdminSettingsTabProps {
  onNotify?: (type: 'success' | 'error', message: string) => void;
}

export default function AdminSettingsTab({ onNotify }: AdminSettingsTabProps) {
  const {
    settingsGrouped,
    systemHealth,
    isSavingSettings,
    loadSettingsData,
    handleSaveSettings,
    handleSettingInputChange,
  } = useAdminSettings(onNotify);

  useEffect(() => {
    loadSettingsData();
  }, [loadSettingsData]);

  return (
    <div className="space-y-5">
      <AdminSettingsHealth systemHealth={systemHealth} />

      <AdminSettingsForm
        settingsGrouped={settingsGrouped}
        isSaving={isSavingSettings}
        onInputChange={handleSettingInputChange}
        onSubmit={handleSaveSettings}
      />
    </div>
  );
}
