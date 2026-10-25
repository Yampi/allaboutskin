import React from 'react';
import { Key } from 'lucide-react';
import { SystemSettingItem } from '@/lib/api';

interface AdminSettingsFormProps {
  settingsGrouped: Record<string, SystemSettingItem[]>;
  isSaving: boolean;
  onInputChange: (groupKey: string, index: number, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AdminSettingsForm({
  settingsGrouped,
  isSaving,
  onInputChange,
  onSubmit,
}: AdminSettingsFormProps) {
  const groupKeys = Object.keys(settingsGrouped);

  if (groupKeys.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs">
        Cargando parámetros de configuración...
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {Object.entries(settingsGrouped).map(([groupName, items]) => (
        <div key={groupName} className="bg-white border border-slate-200 shadow-xs rounded-lg p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A6B5B] mb-3">
            Grupo: {groupName}
          </h4>
          <div className="space-y-3">
            {items.map((setting, idx) => (
              <div
                key={setting.key}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center border-b border-slate-100 pb-3"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-900">{setting.key}</div>
                  <div className="text-[11px] text-slate-500">{setting.description}</div>
                </div>
                <div className="md:col-span-2">
                  {setting.type === 'boolean' ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setting.value === '1' || setting.value === 'true' || setting.value === true as any}
                        onChange={(e) => onInputChange(groupName, idx, e.target.checked ? '1' : '0')}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4A6B5B]"></div>
                    </label>
                  ) : (
                    <input
                      type="text"
                      value={setting.value || ''}
                      onChange={(e) => onInputChange(groupName, idx, e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-[#4A6B5B] hover:bg-[#3d594b] text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Key className="w-3.5 h-3.5" />
              <span>Guardar Configuraciones</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
