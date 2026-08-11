import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sun,
  Moon,
  Bell,
  Search,
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronDown,
  Check,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC<{ onOpenMobileMenu?: () => void; onLogout?: () => void }> = ({
  onOpenMobileMenu,
  onLogout,
}) => {
  const {
    isDarkMode,
    toggleDarkMode,
    notifications,
    markNotificationRead,
    setCurrentView,
    currentView,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Read current active logged in user from local session
  const currentUser = React.useMemo(() => {
    const raw = localStorage.getItem('cg_auth');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.user) return parsed.user;
      } catch (e) {}
    }
    return { name: 'Administrador General', email: 'admin@campanaganadora.ai' };
  }, []);

  const userInitials = (currentUser.name || 'Admin')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toLowerCase();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Resumen del Panel';
      case 'clients':
        return 'Gestión de Clientes';
      case 'licenses':
        return 'Licencias Activas';
      case 'subscriptions':
        return 'Suscripciones';
      case 'plans':
        return 'Planes de Servicio';
      case 'users':
        return 'Usuarios del Sistema';
      case 'campaigns':
        return 'Campañas Electorales';
      case 'modules':
        return 'Módulos y Add-ons';
      case 'billing':
        return 'Facturación y Pagos';
      case 'audit':
        return 'Auditoría y Registros';
      case 'notifications':
        return 'Notificaciones';
      case 'simulator':
        return 'Verificador de Acceso';
      case 'settings':
        return 'Configuración General';
      default:
        return 'Resumen del Panel';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4 lg:px-8 backdrop-blur-md transition-colors">
      {/* Left section: Mobile menu toggle + Header title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden rounded-xl p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Abrir menú lateral"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {getViewTitle()}
        </h1>
      </div>

      {/* Right actions: Search + Bell + User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search input bar matching image */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar usuarios, facturas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setCurrentView('users')}
            className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
          />
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Modo Oscuro"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* Notification Bell with Badge */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Alertas del Sistema Central</h3>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                  {unreadCount} sin leer
                </span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">Sin alertas pendientes</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                        n.read
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-transparent text-slate-500 dark:text-slate-400'
                          : 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/50 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{n.title}</span>
                        <span className="text-[10px] opacity-60">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] mt-1 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => {
                  setShowNotifications(false);
                  setCurrentView('notifications');
                }}
                className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Ver centro de notificaciones
              </button>
            </div>
          )}
        </div>

        {/* User Profile matching image */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 rounded-full py-1 px-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 font-extrabold text-xs">
              {userInitials}
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 dark:text-slate-100">
              {currentUser.name}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setCurrentView('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Configuración del Sistema
                </button>
                <button
                  onClick={() => {
                    setCurrentView('audit');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Bitácora de Auditoría
                </button>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl font-medium transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
