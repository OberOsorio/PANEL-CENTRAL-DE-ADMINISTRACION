import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plan } from '../../types';
import { Check, Edit2, X } from 'lucide-react';

export const PlansView: React.FC = () => {
  const { plans, updatePlan } = useApp();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    monthlyPrice: number;
    description: string;
    activeUsersCount: number;
    featuresText: string;
  }>({
    name: '',
    monthlyPrice: 0,
    description: '',
    activeUsersCount: 0,
    featuresText: '',
  });

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setEditForm({
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      description: plan.description,
      activeUsersCount: plan.activeUsersCount || 0,
      featuresText: (plan.features || []).join('\n'),
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const featuresArray = editForm.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    updatePlan(editingPlan.id, {
      name: editForm.name,
      monthlyPrice: Number(editForm.monthlyPrice),
      description: editForm.description,
      activeUsersCount: Number(editForm.activeUsersCount),
      features: featuresArray,
    });

    setEditingPlan(null);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return `$ ${price.toLocaleString('es-CO')}`;
  };

  return (
    <div className="space-y-6">
      {/* Plans Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
          >
            <div>
              {/* Header: Name and Status Indicator */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    plan.monthlyPrice === 0
                      ? 'bg-slate-300 dark:bg-slate-700'
                      : 'bg-purple-600'
                  }`}
                />
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatPrice(plan.monthlyPrice)}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-xs font-semibold text-slate-400">/ mes</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 min-h-[36px]">
                {plan.description}
              </p>

              {/* Features List with checkmarks */}
              <div className="space-y-3 mb-6">
                {(plan.features || []).map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer: Active Users & Edit Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{plan.activeUsersCount || 0} usuarios activos</span>
              <button
                onClick={() => handleOpenEdit(plan)}
                className="inline-flex items-center gap-1.5 font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div
          onClick={() => setEditingPlan(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-purple-600" />
                Editar Plan: {editingPlan.name}
              </h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Plan
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Precio Mensual ($ COP)
                  </label>
                  <input
                    type="number"
                    value={editForm.monthlyPrice}
                    onChange={(e) => setEditForm({ ...editForm, monthlyPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Usuarios Activos (Muestra)
                  </label>
                  <input
                    type="number"
                    value={editForm.activeUsersCount}
                    onChange={(e) => setEditForm({ ...editForm, activeUsersCount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Características (Una por línea)
                </label>
                <textarea
                  value={editForm.featuresText}
                  onChange={(e) => setEditForm({ ...editForm, featuresText: e.target.value })}
                  rows={4}
                  placeholder="Mensajería 1 a 1&#10;Hasta 3 grupos&#10;1 GB de almacenamiento"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 text-white font-bold hover:bg-purple-500 shadow"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

