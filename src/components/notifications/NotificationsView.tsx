import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, Clock, Check } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        {notifications.some((n) => !n.read) && (
          <button
            onClick={() => notifications.forEach((n) => !n.read && markNotificationRead(n.id))}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-500 shadow transition-all"
          >
            <Check className="h-4 w-4" />
            Marcar Todas como Leídas
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-slate-400 text-xs">
            No hay alertas registradas en la plataforma.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border p-4 transition-all flex items-start justify-between gap-4 ${
                n.read
                  ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80'
                  : 'border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/30 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    n.type === 'error'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : n.type === 'warning'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : n.type === 'success'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                  }`}
                >
                  {n.type === 'error' ? (
                    <ShieldAlert className="h-4 w-4" />
                  ) : n.type === 'warning' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h3>
                    {!n.read && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.2 text-[9px] font-extrabold text-white uppercase">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {n.timestamp}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => markNotificationRead(n.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shrink-0"
                >
                  <Check className="h-3 w-3 text-purple-600" />
                  Marcar Leída
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
