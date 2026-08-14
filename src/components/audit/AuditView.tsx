import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Search, ShieldAlert, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';

export const AuditView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');

  const filteredLogs = (Array.isArray(auditLogs) ? auditLogs : []).filter((l) => {
    if (!l) return false;
    const action = l.action || '';
    const userName = l.userName || '';
    const clientName = l.clientName || '';
    const details = l.details || '';

    const matchesSearch =
      action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'TODOS' || l.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar en logs por acción, usuario, IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['TODOS', 'Cliente', 'Licencia', 'Usuario', 'Rol', 'Módulo', 'Acceso', 'Suscripción'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const headers = ['ID', 'Fecha', 'Usuario', 'Acción', 'Categoría', 'Cliente', 'Detalles', 'IP', 'Resultado'];
              const rows = filteredLogs.map((l) => [
                l.id,
                l.timestamp,
                l.userName,
                l.action,
                l.category,
                l.clientName || 'SISTEMA CENTRAL',
                `"${l.details.replace(/"/g, '""')}"`,
                l.ipAddress,
                l.result,
              ]);
              const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `bitacora_auditoria_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 text-xs font-bold shadow hover:opacity-90 transition-all shrink-0 ml-2"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Acción / Categoría</th>
                <th className="py-3 px-4">Cliente / Organización</th>
                <th className="py-3 px-4">Detalle de la Operación</th>
                <th className="py-3 px-4">Dirección IP</th>
                <th className="py-3 px-4 text-right">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">
                    {log.userName}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="font-bold text-purple-600">{log.action}</span>
                    <span className="block text-[10px] text-slate-400">{log.category}</span>
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-700 dark:text-slate-300">
                    {log.clientName || 'SISTEMA CENTRAL'}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{log.ipAddress}</td>
                  <td className="py-3 px-4 text-right font-sans">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        log.result === 'Éxito'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
