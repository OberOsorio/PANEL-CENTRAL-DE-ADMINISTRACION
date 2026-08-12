import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, ClientStatus } from '../../types';
import {
  X,
  Building2,
  KeyRound,
  CreditCard,
  Users,
  Flag,
  Boxes,
  Receipt,
  History,
  RefreshCw,
  Check,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  Copy,
  ChevronDown,
} from 'lucide-react';

interface ClientDetailModalProps {
  client: Client | null;
  onClose: () => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, onClose }) => {
  const {
    licenses,
    subscriptions,
    users,
    campaigns,
    modules,
    invoices,
    auditLogs,
    toggleClientStatus,
    renewLicense,
    updateLicenseModules,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'general' | 'license' | 'subscription' | 'users' | 'campaigns' | 'modules' | 'payments' | 'activity'
  >('general');
  const [isRenewOpen, setIsRenewOpen] = useState(false);

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCopyPassword = (userId: string, pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedUserId(userId);
    setTimeout(() => setCopiedUserId(null), 2000);
  };

  if (!client) return null;

  const license = licenses.find((l) => l.clientId === client.id);
  const subscription = subscriptions.find((s) => s.clientId === client.id);
  const clientUsers = users.filter((u) => u.clientId === client.id);
  const clientCampaigns = campaigns.filter((c) => c.clientId === client.id);
  const clientInvoices = invoices.filter((i) => i.clientId === client.id);
  const clientLogs = auditLogs.filter((a) => a.clientId === client.id);

  const handleToggleModule = (modCode: string) => {
    if (!license) return;
    const currentMods = license.enabledModuleCodes;
    const updated = currentMods.includes(modCode)
      ? currentMods.filter((c) => c !== modCode)
      : [...currentMods, modCode];
    updateLicenseModules(license.id, updated);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-lg shadow-md shadow-purple-600/30">
              {client.organizationName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {client.organizationName}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    client.status === 'Activo'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : client.status === 'Suspendido'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {client.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ID Tenant: <span className="font-mono">{client.id}</span> • Responsable: {client.responsibleName} ({client.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section Tabs Bar */}
        <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 px-6 overflow-x-auto">
          {[
            { id: 'general', label: 'INFORMACIÓN GENERAL', icon: Building2 },
            { id: 'license', label: 'LICENCIA', icon: KeyRound },
            { id: 'subscription', label: 'SUSCRIPCIÓN', icon: CreditCard },
            { id: 'users', label: 'USUARIOS', icon: Users, count: clientUsers.length },
            { id: 'campaigns', label: 'CAMPAÑAS', icon: Flag, count: clientCampaigns.length },
            { id: 'modules', label: 'MÓDULOS', icon: Boxes },
            { id: 'payments', label: 'PAGOS', icon: Receipt },
            { id: 'activity', label: 'ACTIVIDAD', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-700 dark:text-slate-300">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">NIT / Documento</span>
                  <span className="font-bold text-slate-900 dark:text-white">{client.taxId}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Aspiración Política</span>
                  <span className="font-bold text-slate-900 dark:text-white">{client.aspiration || 'No definida'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Ubicación</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {client.city ? `${client.city}, ` : ''}{client.department} ({client.country})
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Teléfono</span>
                  <span className="font-bold text-slate-900 dark:text-white">{client.phone}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Plan Actual</span>
                  <span className="font-bold text-purple-600">{client.planName}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Fecha de Registro</span>
                  <span className="font-bold text-slate-900 dark:text-white">{client.createdAt}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Límite de Usuarios</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {client.activeUsersCount} / {client.maxUsersAllowed === -1 ? 'Ilimitados' : client.maxUsersAllowed}
                  </span>
                </div>
              </div>

              {/* Status Action Controls */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Acciones de Suspensión / Activación</h4>
                  <p className="text-slate-500">
                    Suspender un cliente revoca instantáneamente el acceso de todos sus usuarios al Software Electoral.
                  </p>
                </div>
                {client.status === 'Suspendido' ? (
                  <button
                    onClick={() => toggleClientStatus(client.id, 'Activo')}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow"
                  >
                    Reactivar Cliente
                  </button>
                ) : (
                  <button
                    onClick={() => toggleClientStatus(client.id, 'Suspendido')}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow"
                  >
                    Suspender Cliente
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LICENCIA */}
          {activeTab === 'license' && license && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between">
                <div>
                  <span className="text-purple-700 dark:text-purple-300 font-bold block">Clave de Licencia Generada</span>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{license.licenseKey}</span>
                </div>
                <div className="relative inline-block text-left">
                  <button
                    onClick={() => setIsRenewOpen(!isRenewOpen)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Renovar Licencia</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                  </button>

                  {isRenewOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsRenewOpen(false)}
                      />
                      <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Vigencia
                        </div>
                        {[3, 6, 9, 12].map((m) => (
                          <button
                            key={m}
                            onClick={() => {
                              renewLicense(license.id, m);
                              setIsRenewOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-700 dark:hover:text-purple-300 rounded-lg transition-colors flex items-center justify-between"
                          >
                            <span>+{m} meses</span>
                            <span className="text-[10px] text-slate-400">
                              {m === 12 ? '1 Año' : `${m}m`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">ID Licencia</span>
                  <span className="font-bold font-mono">{license.id}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Tipo de Licencia</span>
                  <span className="font-bold">{license.licenseType}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Fecha Activación</span>
                  <span className="font-bold">{license.activatedAt}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Fecha Vencimiento</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{license.expiresAt}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUSCRIPCIÓN */}
          {activeTab === 'subscription' && (
            <div className="space-y-4 text-xs">
              {subscription ? (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Suscripción {subscription.id}
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold text-[10px]">
                      {subscription.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-slate-400">Precio / Período:</span>
                      <p className="font-bold text-slate-900 dark:text-white">
                        ${subscription.price} {subscription.currency} ({subscription.periodicity})
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Próximo Cobro:</span>
                      <p className="font-bold text-slate-900 dark:text-white">{subscription.nextBillingDate}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No hay suscripción activa configurada.</p>
              )}
            </div>
          )}

          {/* TAB 4: USUARIOS */}
          {activeTab === 'users' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <span className="font-extrabold text-purple-950 dark:text-purple-200 block text-xs">
                      Credenciales de Acceso de Usuarios Creados
                    </span>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300">
                      Aquí puedes consultar la contraseña inicial asignada a cada usuario para su ingreso a la plataforma.
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold">
                      <th className="py-2.5 px-3">Nombre</th>
                      <th className="py-2.5 px-3">Correo (Usuario)</th>
                      <th className="py-2.5 px-3">Contraseña de Acceso</th>
                      <th className="py-2.5 px-3">Rol</th>
                      <th className="py-2.5 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {clientUsers.map((u) => {
                      const pass = u.password || 'Campaña2026!';
                      const isVisible = visiblePasswords[u.id] ?? true;
                      const isCopied = copiedUserId === u.id;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                            {u.firstName} {u.lastName}
                          </td>
                          <td className="py-3 px-3 text-slate-500 font-medium">{u.email}</td>
                          <td className="py-3 px-3">
                            <div className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 px-2.5 py-1 rounded-lg">
                              <Lock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                              <span className="font-mono text-xs font-black text-purple-900 dark:text-purple-200">
                                {isVisible ? pass : '••••••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(u.id)}
                                className="text-purple-400 hover:text-purple-700 dark:hover:text-purple-200 ml-1"
                                title={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                              >
                                {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyPassword(u.id, pass)}
                                className="text-purple-500 hover:text-purple-800 dark:hover:text-purple-200"
                                title="Copiar contraseña"
                              >
                                {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-bold text-purple-600 dark:text-purple-400">{u.roleName}</td>
                          <td className="py-3 px-3">
                            <span className="rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 font-bold text-[10px]">
                              {u.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: MÓDULOS */}
          {activeTab === 'modules' && license && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-500">
                Selecciona los módulos a los que esta organización tendrá acceso directo en el software electoral:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {modules.map((m) => {
                  const isEnabled = license.enabledModuleCodes.includes(m.code);
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleToggleModule(m.code)}
                      className={`cursor-pointer rounded-xl p-3 border text-xs flex items-center justify-between transition-all ${
                        isEnabled
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>{m.name}</span>
                      <div
                        className={`h-4 w-4 rounded flex items-center justify-center border ${
                          isEnabled ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isEnabled && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: ACTIVIDAD */}
          {activeTab === 'activity' && (
            <div className="space-y-2 text-xs">
              {clientLogs.length === 0 ? (
                <p className="text-slate-400">Sin logs de actividad registrados para este cliente.</p>
              ) : (
                clientLogs.map((l) => (
                  <div key={l.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>{l.action}</span>
                      <span className="text-[10px] text-slate-400">{l.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{l.details}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
