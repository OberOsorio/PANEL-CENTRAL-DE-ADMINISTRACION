import React from 'react';
import { useApp } from '../../context/AppContext';
import { Boxes, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export const ModulesView: React.FC = () => {
  const { modules, licenses } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Boxes className="h-6 w-6 text-purple-600" />
          Conmutador General de Módulos
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Catálogo maestro de funcionalidades del Software Electoral y estadísticas de adopción por cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => {
          const activeLicWithMod = licenses.filter((l) => l.enabledModuleCodes.includes(m.code)).length;

          return (
            <div
              key={m.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 font-bold">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{m.name}</h3>
                </div>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {m.category}
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-snug">{m.description}</p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Código interno:</span>
                <span className="font-mono font-bold text-purple-600">{m.code}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Habilitado en:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {activeLicWithMod} Licencias Activas
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
