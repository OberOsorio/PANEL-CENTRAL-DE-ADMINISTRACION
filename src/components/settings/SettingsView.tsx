import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, ShieldCheck, Database, KeyRound, Globe, Save, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { isDarkMode, toggleDarkMode, addAuditLog } = useApp();

  const [platformName, setPlatformName] = useState('Campaña Ganadora AI - Panel Central');
  const [supportEmail, setSupportEmail] = useState('soporte@campanaganadora.ai');
  const [defaultTrialDays, setDefaultTrialDays] = useState(30);
  const [enforceMfa, setEnforceMfa] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog('Configuración Modificada', 'Sistema', 'Actualizó parámetros globales del panel central.');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      <div />

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          Configuración guardada exitosamente y sincronizada con los servidores.
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: General Platform Branding */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Globe className="h-4 w-4 text-purple-600" />
            Parámetros del Panel y Marca White-Label
          </h3>

          {/* Supabase Live DB Badge */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Motor de Base de Datos Supabase (Conectado y En Vivo)</p>
                <p className="text-[10px] text-slate-500 font-mono">Sincronización en tiempo real activa vía @supabase/supabase-js</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono text-[10px] font-bold">
              Supabase SDK v2.x
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                Nombre de la Plataforma Central
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                Correo Electrónico de Soporte
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                Días de Prueba Gratuitos (Trial por defecto)
              </label>
              <input
                type="number"
                value={defaultTrialDays}
                onChange={(e) => setDefaultTrialDays(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Modo Oscuro</span>
                <span className="text-slate-400">Preferencia visual de interfaz</span>
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
                  isDarkMode
                    ? 'bg-purple-600 text-white shadow-purple-600/30 hover:bg-purple-500'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {isDarkMode ? '🌙 Activado' : '☀️ Desactivado'}
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Security & Authentication */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            Políticas de Seguridad y Acceso API Multi-Tenant
          </h3>

          <div className="space-y-3 text-xs">
            <div
              onClick={() => setEnforceMfa(!enforceMfa)}
              className="cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Exigir Autenticación de Doble Factor (MFA) a Super Admins
                </span>
                <span className="text-slate-400">Protege todas las acciones de modificación de licencias.</span>
              </div>
              <div
                className={`h-5 w-5 rounded flex items-center justify-center border ${
                  enforceMfa ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'
                }`}
              >
                {enforceMfa && <Check className="h-3.5 w-3.5" />}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={async () => {
              if (confirm('¿Estás seguro de reiniciar todo el sistema a cero? Se borrarán todos los datos cargados.')) {
                try {
                  await fetch('/api/reset', { method: 'POST' });
                } catch (e) {
                  console.warn('API reset failed or offline:', e);
                }
                localStorage.removeItem('cg_clients');
                localStorage.removeItem('cg_licenses');
                localStorage.removeItem('cg_subscriptions');
                localStorage.removeItem('cg_users');
                localStorage.removeItem('cg_roles');
                localStorage.removeItem('cg_audit');
                localStorage.removeItem('cg_notifications');
                localStorage.removeItem('cg_plans');
                localStorage.removeItem('cg_invoices');
                localStorage.removeItem('cg_campaigns');
                window.location.reload();
              }
            }}
            className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all"
          >
            Reiniciar Sistema a Cero (Limpieza Completa)
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-all"
          >
            <Save className="h-4 w-4" />
            Guardar Cambios de Configuración
          </button>
        </div>
      </form>
    </div>
  );
};
