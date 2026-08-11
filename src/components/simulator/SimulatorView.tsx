import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AccessCheckResult } from '../../types';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  KeyRound,
  Building2,
  Lock,
} from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const { clients, modules, campaigns, users, runAccessCheck, setCurrentView } = useApp();

  const [testEmail, setTestEmail] = useState(clients[0]?.email || '');
  const [testClientId, setTestClientId] = useState(clients[0]?.id || '');
  const [selectedModule, setSelectedModule] = useState(modules[0]?.code || 'dashboard');
  const [checkResult, setCheckResult] = useState<AccessCheckResult | null>(null);

  const handleTestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const result = runAccessCheck(testEmail, testClientId, selectedModule);
    setCheckResult(result);
  };

  const hasCampaignOrUser = campaigns.length > 0 || users.length > 0;

  if (!hasCampaignOrUser) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-16 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl flex flex-col items-center space-y-5">
          <div className="h-14 w-14 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Lock className="h-6 w-6" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Simulador de Acceso Inactivo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              Para realizar una simulación del Gateway de consulta de licencias en tiempo real, es requisito indispensable contar con **al menos una campaña política creada** o **un usuario registrado** en el sistema central.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              onClick={() => setCurrentView('clients')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 hover:shadow-purple-600/35 transition-all"
            >
              Crear Organización / Campaña
            </button>
            <button
              onClick={() => setCurrentView('users')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
            >
              Registrar Usuario
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Tester */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-purple-600" />
            Parámetros de Consulta de Licencia
          </h3>

          <form onSubmit={handleTestAccess} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                Organización (Tenant Predefinido)
              </label>
              <select
                value={testClientId}
                onChange={(e) => {
                  setTestClientId(e.target.value);
                  const found = clients.find((c) => c.id === e.target.value);
                  if (found) setTestEmail(found.email);
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2.5 font-medium text-slate-900 dark:text-white"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.organizationName} ({c.id}) — Estado: {c.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                Correo Electrónico Operador / Admin
              </label>
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2.5 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                Módulo Específico a Requerir Acceso
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2.5 font-medium text-slate-900 dark:text-white"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.code}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Ejecutar Validación de Licencia en Tiempo Real
            </button>
          </form>
        </div>

        {/* Live Gateway Output Result */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-6 text-white shadow-xl flex flex-col justify-between space-y-4 font-mono text-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px]">
                GET /api/v1/license/verify
              </span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                Respuesta JSON Simulación
              </span>
            </div>

            {checkResult ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 font-sans ${
                    checkResult.allowed
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-800 text-rose-200'
                  }`}
                >
                  {checkResult.allowed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-extrabold text-sm">{checkResult.title}</h4>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">{checkResult.message}</p>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2 text-[11px]">
                  <p className="text-slate-400 font-sans font-bold">Respuesta Estructurada API:</p>
                  <pre className="text-purple-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(checkResult, null, 2)}
                  </pre>
                </div>

                {checkResult.allowed && checkResult.redirectUrl && (
                  <div className="pt-2">
                    <a
                      href={checkResult.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold font-sans text-white hover:bg-purple-500 shadow-md transition-all"
                    >
                      Abrir Software Electoral Autorizado
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 py-12 text-center font-sans">
                Presiona "Ejecutar Validación" para simular la solicitud de acceso.
              </div>
            )}
          </div>

          <div className="border-t border-slate-800/80 pt-3 text-[10px] text-slate-500 font-sans">
            Nota: Toda llamada es registrada automáticamente en la bitácora de auditoría inmutable.
          </div>
        </div>
      </div>
    </div>
  );
};
