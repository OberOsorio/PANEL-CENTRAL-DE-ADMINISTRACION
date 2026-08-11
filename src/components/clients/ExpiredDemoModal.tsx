import React from 'react';
import {
  X,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Lock,
  MessageCircle,
  CreditCard,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ExpiredDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
  expiresAt?: string;
}

export const ExpiredDemoModal: React.FC<ExpiredDemoModalProps> = ({
  isOpen,
  onClose,
  clientName = 'Campaña Electoral Demo',
  expiresAt = 'Hace 1 día',
}) => {
  const { setCurrentView, addAuditLog } = useApp();

  if (!isOpen) return null;

  const handleGoToPlans = () => {
    addAuditLog(
      'Intento de Upgrade Plan',
      'Cliente',
      `El usuario de la cuenta demo ${clientName} inició solicitud de cambio a plan de pago.`
    );
    onClose();
    setCurrentView('plans');
  };

  const handleContactSales = () => {
    addAuditLog(
      'Solicitud de Asesoría Comercial',
      'Cliente',
      `Solicitó contacto directo para extender cuenta demo ${clientName}.`
    );
    alert(
      `¡Gracias! Un ejecutivo comercial de Campaña Ganadora se pondrá en contacto inmediatamente para habilitar tu plan comercial para ${clientName}.`
    );
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-3xl border border-purple-500/30 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
      >
        
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-rose-600 via-purple-700 to-indigo-700 p-6 text-white overflow-hidden">
          {/* Subtle Background Glow Elements */}
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />
          <div className="absolute left-1/3 -top-10 h-32 w-32 rounded-full bg-rose-400/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner border border-white/30 shrink-0">
                <Lock className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-200 backdrop-blur-md mb-1">
                  <AlertTriangle className="h-3 w-3" />
                  Prueba de 3 Días Finalizada
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                  ¡Tu Periodo de Prueba Demo ha Expirado!
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-6 space-y-5 text-slate-900 dark:text-white">
          
          {/* Organization & Expiration Summary Card */}
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="text-rose-900 dark:text-rose-200 flex items-center gap-1.5 text-sm">
                <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                {clientName}
              </span>
              <span className="text-rose-700 dark:text-rose-300 font-mono text-[11px] bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-md">
                Límite: 3 Días Alcanzado
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              El tiempo máximo de evaluación gratuita de <strong>3 días</strong> asignado para esta cuenta demo ha finalizado. Para reactivar el acceso completo al Software Electoral y seguir procesando datos de campaña, debes seleccionar un plan comercial de pago.
            </p>
          </div>

          {/* Value Proposition Grid */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Al pasar a un Plan de Pago obtendrás:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Acceso continuo sin fecha de vencimiento demo
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Gestión total de Testigos de Mesa E-14
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Asistente IA Copilot para discurso y estrategia
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Soporte técnico prioritario 24/7 en elecciones
                </span>
              </div>
            </div>
          </div>

          {/* Quick Plans Overview Box */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Planes de Pago Disponibles:
            </h4>
            <div className="grid grid-cols-3 gap-2.5 text-xs text-center">
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="font-black text-slate-900 dark:text-white block">Plan Básico</span>
                <span className="text-purple-600 dark:text-purple-400 font-extrabold text-sm block mt-0.5">$450 USD</span>
                <span className="text-[10px] text-slate-400">Hasta 5 Usuarios</span>
              </div>
              <div className="p-3 rounded-2xl border-2 border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 relative shadow-md">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  Recomendado
                </span>
                <span className="font-black text-purple-950 dark:text-purple-200 block">Plan Pro</span>
                <span className="text-purple-600 dark:text-purple-300 font-extrabold text-sm block mt-0.5">$1,250 USD</span>
                <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold">Hasta 25 Usuarios</span>
              </div>
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="font-black text-slate-900 dark:text-white block">Enterprise</span>
                <span className="text-purple-600 dark:text-purple-400 font-extrabold text-sm block mt-0.5">$3,800 USD</span>
                <span className="text-[10px] text-slate-400">Usuarios Ilimitados</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cerrar
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleContactSales}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Contactar Asesor
            </button>

            <button
              onClick={handleGoToPlans}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
              <CreditCard className="h-4 w-4" />
              Pasar a un Plan de Pago
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
