import { useState, useCallback } from 'react';
import { fetchAdminSystemSettings, updateAdminSystemSettings, fetchAdminSystemHealth, SystemSettingItem } from '@/lib/api';

export function useAdminSettings(onNotify?: (type: 'success' | 'error', message: string) => void) {
  const [settingsGrouped, setSettingsGrouped] = useState<Record<string, SystemSettingItem[]>>({});
  const [systemHealth, setSystemHealth] = useState<{ database?: string; ingredient_dataset?: string } | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadSettingsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [settingsRes, healthRes] = await Promise.all([
        fetchAdminSystemSettings(),
        fetchAdminSystemHealth(),
      ]);
      setSettingsGrouped(settingsRes.settings || {});
      setSystemHealth(healthRes.health || null);
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al cargar configuraciones');
    } finally {
      setIsLoading(false);
    }
  }, [onNotify]);

  const handleSaveSettings = useCallback(async (e: React.FormEvent) => {
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
      onNotify?.('success', 'Configuraciones guardadas y caché purgada');
      await loadSettingsData();
    } catch (err: any) {
      onNotify?.('error', err.message || 'Error al guardar configuraciones');
    } finally {
      setIsSavingSettings(false);
    }
  }, [settingsGrouped, loadSettingsData, onNotify]);

  const handleSettingInputChange = useCallback((groupKey: string, index: number, value: any) => {
    setSettingsGrouped((prev) => {
      const copy = { ...prev };
      const groupCopy = [...(copy[groupKey] || [])];
      groupCopy[index] = { ...groupCopy[index], value };
      copy[groupKey] = groupCopy;
      return copy;
    });
  }, []);

  return {
    settingsGrouped,
    systemHealth,
    isSavingSettings,
    isLoading,
    loadSettingsData,
    handleSaveSettings,
    handleSettingInputChange,
  };
}
