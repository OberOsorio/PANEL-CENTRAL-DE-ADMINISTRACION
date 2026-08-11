import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Edit, Trash2, X } from 'lucide-react';
import { Subscription } from '../../types';

export const SubscriptionsView: React.FC = () => {
  const { subscriptions, plans, updateSubscription, deleteSubscription } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  // Edit fields state
  const [planId, setPlanId] = useState('');
  const [price, setPrice] = useState(0);
  const [periodicity, setPeriodicity] = useState<'Mensual' | 'Anual'>('Mensual');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState<Subscription['status']>('Activa');

  const handleOpenEdit = (sub: Subscription) => {
    setSelectedSub(sub);
    setPlanId(sub.planId);
    setPrice(sub.price);
    setPeriodicity(sub.periodicity);
    setNextBillingDate(sub.nextBillingDate);
    setPaymentMethod(sub.paymentMethod || '');
    setStatus(sub.status);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    const plan = plans.find((p) => p.id === planId);

    updateSubscription(selectedSub.id, {
      planId,
      planName: plan ? plan.name : selectedSub.planName,
      price: Number(price),
      periodicity,
      nextBillingDate,
      paymentMethod,
      status,
    });

    setIsEditModalOpen(false);
    setSelectedSub(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta suscripción?')) {
      deleteSubscription(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Cliente / Organización</th>
                <th className="py-3.5 px-4">Plan Asignado</th>
                <th className="py-3.5 px-4">Precio / Período</th>
                <th className="py-3.5 px-4">Fecha Inicio</th>
                <th className="py-3.5 px-4">Próximo Cobro</th>
                <th className="py-3.5 px-4">Método de Pago</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subscriptions.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{s.clientName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{s.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {s.planName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    ${s.price.toLocaleString()} {s.currency}{' '}
                    <span className="text-slate-400 font-normal">({s.periodicity})</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {s.startDate}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {s.nextBillingDate}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {s.paymentMethod || 'PSE / Transferencia'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        s.status === 'Activa'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : s.status === 'Cancelada'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(s)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Modificar"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="p-1 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Subscription Modal */}
      {isEditModalOpen && selectedSub && (
        <div
          onClick={() => setIsEditModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleUpdate}
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Modificar Suscripción del Cliente
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2">
                <label className="block font-bold mb-1">Cliente</label>
                <div className="w-full rounded-xl border p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                  {selectedSub.clientName}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Plan Comercial</label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Precio (USD)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Periodicidad</label>
                <select
                  value={periodicity}
                  onChange={(e) => setPeriodicity(e.target.value as any)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Mensual">Mensual</option>
                  <option value="Anual">Anual</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Próximo Cobro</label>
                <input
                  type="date"
                  required
                  value={nextBillingDate}
                  onChange={(e) => setNextBillingDate(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold mb-1">Método de Pago</label>
                <input
                  type="text"
                  required
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                  placeholder="Ej. Tarjeta de Crédito, PSE, Transferencia..."
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold mb-1">Estado de Suscripción</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Activa">Activa</option>
                  <option value="Cancelada">Cancelada</option>
                  <option value="En Gracia (Pendiente Pago)">En Gracia (Pendiente Pago)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl border px-4 py-2 text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

