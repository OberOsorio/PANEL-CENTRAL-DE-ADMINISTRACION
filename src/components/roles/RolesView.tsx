import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { Shield, Check, Lock, ChevronRight } from 'lucide-react';

export const RolesView: React.FC = () => {
  const { roles, permissions, updateRolePermissions } = useApp();
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || 'role-superadmin');

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const handleTogglePermission = (permCode: string) => {
    if (!selectedRole || selectedRole.isSystemRole && selectedRole.code === 'SUPER_ADMIN') {
      return; // Super admin permissions cannot be reduced
    }

    const currentPerms = selectedRole.permissionCodes;
    const updated = currentPerms.includes(permCode)
      ? currentPerms.filter((c) => c !== permCode)
      : [...currentPerms, permCode];

    updateRolePermissions(selectedRole.id, updated);
  };

  const permGroups = Array.from(new Set(permissions.map((p) => p.group)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-600" />
          Control de Roles y Matriz de Permisos Granulares (RBAC)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalización de privilegios para roles del sistema y seguridad de acceso a la API.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles list */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block px-2 mb-2">
            Roles del Sistema
          </span>
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoleId(r.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs text-left transition-all ${
                selectedRoleId === r.id
                  ? 'bg-purple-600 text-white font-bold shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <div>
                <p>{r.name}</p>
                <p className={`text-[10px] ${selectedRoleId === r.id ? 'text-purple-200' : 'text-slate-400'}`}>
                  {r.permissionCodes.length} Permisos
                </p>
              </div>
              <ChevronRight className="h-4 w-4 opacity-70" />
            </button>
          ))}
        </div>

        {/* Permission matrix for selected role */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {selectedRole.name}
                {selectedRole.isSystemRole && (
                  <span className="rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 text-[10px] font-bold">
                    Rol del Sistema
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{selectedRole.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            {permGroups.map((group) => {
              const groupPerms = permissions.filter((p) => p.group === group);
              return (
                <div key={group} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Grupo: {group}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupPerms.map((perm) => {
                      const isChecked = selectedRole.permissionCodes.includes(perm.code);
                      const isLocked = selectedRole.code === 'SUPER_ADMIN';

                      return (
                        <div
                          key={perm.code}
                          onClick={() => !isLocked && handleTogglePermission(perm.code)}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                            isLocked ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
                          } ${
                            isChecked
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500'
                          }`}
                        >
                          <div>
                            <span className="block">{perm.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{perm.code}</span>
                          </div>
                          <div
                            className={`h-4 w-4 rounded flex items-center justify-center border ${
                              isChecked ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
