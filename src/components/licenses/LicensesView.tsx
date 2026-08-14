import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { License } from '../../types';
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  Sliders,
  Check,
  Calendar,
  ChevronDown,
  Bell,
} from 'lucide-react';

export const LicensesView: React.FC = () => {
  const { licenses, clients, renewLicense, updateLicenseModules, modules } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [editingLicenseForModules, setEditingLicenseForModules] = useState<License | null>(null);
  const [activeRenewDropdownId, setActiveRenewDropdownId] = useState<string | null>(null);

  const filteredLicenses = (Array.isArray(licenses) ? licenses : []).filter((l) => {
    if (!l) return false;
    const clientName = l.clientName || '';
    const id = l.id || '';
    const licenseKey = l.licenseKey || '';

    const matchesSearch =
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      licenseKey.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'TODOS' || l.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleToggleModule = (licId: string, modCode: string) => {
    const lic = licenses.find((l) => l.id === licId);
    if (!lic) return;
    const current = lic.enabledModuleCodes;
    const updated = current.includes(modCode)
      ? current.filter((c) => c !== modCode)
      : [...current, modCode];
    updateLicenseModules(licId, updated);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ID de licencia, cliente, clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['TODOS', 'Activa', 'Próxima a vencer', 'Vencida', 'Suspendida'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Licenses Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">ID Licencia / Cliente</th>
                <th className="py-3 px-4">Plan & Tipo</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Clave de Licencia</th>
                <th className="py-3 px-4">Vencimiento</th>
                <th className="py-3 px-4">Módulos</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLicenses.map((lic) => (
                <tr key={lic.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{lic.clientName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{lic.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-purple-600 dark:text-purple-400">{lic.planName}</span>
                    <span className="block text-[10px] text-slate-400">{lic.licenseType}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        lic.status === 'Activa'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : lic.status === 'Próxima a vencer'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
                          : lic.status === 'Vencida'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {lic.status === 'Próxima a vencer' && <Bell className="h-3 w-3 text-amber-600 dark:text-amber-400" />}
                      {lic.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    {lic.licenseKey}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {lic.expiresAt}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setEditingLicenseForModules(lic)}
                      className="rounded-lg bg-purple-50 dark:bg-purple-950/50 px-2 py-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                    >
                      {lic.enabledModuleCodes.length} Habilitados
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right relative">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() =>
                          setActiveRenewDropdownId(
                            activeRenewDropdownId === lic.id ? null : lic.id
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500 shadow transition-all"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Renovar</span>
                        <ChevronDown className="h-3 w-3 opacity-80" />
                      </button>

                      {activeRenewDropdownId === lic.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setActiveRenewDropdownId(null)}
                          />
                          <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              Vigencia
                            </div>
                            {[3, 6, 9, 12].map((m) => (
                              <button
                                key={m}
                                onClick={() => {
                                  renewLicense(lic.id, m);
                                  setActiveRenewDropdownId(null);
                                }}
                                className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-lg transition-colors flex items-center justify-between"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Module Override Modal */}
      {editingLicenseForModules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Módulos Habilitados - {editingLicenseForModules.clientName} ({editingLicenseForModules.id})
            </h3>
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {modules.map((m) => {
                const isChecked = editingLicenseForModules.enabledModuleCodes.includes(m.code);
                return (
                  <div
                    key={m.id}
                    onClick={() => handleToggleModule(editingLicenseForModules.id, m.code)}
                    className={`cursor-pointer rounded-xl p-3 border text-xs flex items-center justify-between transition-all ${
                      isChecked
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{m.name}</span>
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
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setEditingLicenseForModules(null)}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white"
              >
                Cerrar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
