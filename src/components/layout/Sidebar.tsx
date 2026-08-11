import React from 'react';
import { useApp, ActiveView } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  KeyRound,
  CreditCard,
  Layers,
  UserCheck,
  Shield,
  Flag,
  Boxes,
  Receipt,
  History,
  Bell,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  DollarSign,
  X,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { currentView, setCurrentView, licenses, clients, notifications } = useApp();

  const expiringCount = licenses.filter((l) => l.status === 'Próxima a vencer').length;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Building2, badge: clients.length },
    { id: 'licenses', label: 'Licencias', icon: KeyRound, badge: expiringCount > 0 ? expiringCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'subscriptions', label: 'Suscripciones', icon: CreditCard },
    { id: 'plans', label: 'Planes', icon: Layers },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'campaigns', label: 'Campañas', icon: Flag },
    { id: 'billing', label: 'Facturación & Pagos', icon: Receipt },
    { id: 'audit', label: 'Actividad & Auditoría', icon: History },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined, badgeColor: 'bg-rose-500' },
    { id: 'simulator', label: 'Simulador Acceso', icon: Sparkles },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const handleSelectView = (id: ActiveView) => {
    setCurrentView(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40">
            <ShieldCheck className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="text-sm font-black tracking-tight text-white block">
                CAMPAÑA GANADORA
              </span>
              <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                ADMIN CENTRAL AI
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-slate-400 hover:text-white p-1"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Módulos Administrativos
          </p>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectView(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />

              {!collapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}

              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${
                    item.badgeColor || 'bg-purple-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System info / Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {!collapsed ? (
          <div className="rounded-xl bg-slate-800/60 p-3 border border-slate-700/50 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-200">Servidor Operativo</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Aislamiento Multi-tenant activo • v2.6 Enterprise
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-full mt-2 py-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="fixed top-0 bottom-0 z-40 transition-all duration-300" style={{ width: collapsed ? '5rem' : '16rem' }}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          />
          <div className="fixed top-0 bottom-0 left-0 w-72 z-50 animate-in slide-in-from-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
