import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { UserRoleType } from '@/lib/api';

interface AdminUsersTableProps {
  users: any[];
  onRoleChange: (userId: number, role: UserRoleType) => void;
  onToggleStatus: (userId: number) => void;
  onUnlockUser: (userId: number) => void;
}

export default function AdminUsersTable({
  users,
  onRoleChange,
  onToggleStatus,
  onUnlockUser,
}: AdminUsersTableProps) {
  return (
    <div className="bg-white border border-slate-200 shadow-xs rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600 tracking-wider">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol / Permiso</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Último Acceso</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No se encontraron usuarios coincidentes.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isLocked = u.locked_until && new Date(u.locked_until) > new Date();
                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                      {u.skinProfile && (
                        <div className="text-[10px] text-[#4A6B5B] mt-0.5">
                          Piel: {u.skinProfile.skin_type} • Barrera: {u.skinProfile.barrier_status}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role || 'standard_user'}
                        onChange={(e) => onRoleChange(u.id, e.target.value as UserRoleType)}
                        className="text-xs font-medium py-1 px-2 rounded bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="scientific_editor">Editor Científico</option>
                        <option value="premium_user">Premium</option>
                        <option value="standard_user">Estándar</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                            u.is_active
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {u.is_active ? 'Activo' : 'Suspendido'}
                        </span>
                        {isLocked && (
                          <span className="text-[10px] text-amber-700 flex items-center gap-1 font-semibold">
                            <Lock className="w-3 h-3" /> Bloqueado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleString('es-ES') : 'Nunca'}
                      {u.last_login_ip && <div className="text-[10px] text-slate-400 font-mono">IP: {u.last_login_ip}</div>}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                      {isLocked && (
                        <button
                          onClick={() => onUnlockUser(u.id)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-semibold rounded transition cursor-pointer"
                          title="Desbloquear cuenta"
                        >
                          <Unlock className="w-3 h-3 inline mr-1" /> Desbloquear
                        </button>
                      )}
                      <button
                        onClick={() => onToggleStatus(u.id)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded border transition cursor-pointer ${
                          u.is_active
                            ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800'
                            : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
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
  );
}
