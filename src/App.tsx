import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { ClientsView } from './components/clients/ClientsView';
import { LicensesView } from './components/licenses/LicensesView';
import { SubscriptionsView } from './components/subscriptions/SubscriptionsView';
import { PlansView } from './components/plans/PlansView';
import { UsersView } from './components/users/UsersView';
import { CampaignsView } from './components/campaigns/CampaignsView';
import { ModulesView } from './components/modules/ModulesView';
import { BillingView } from './components/billing/BillingView';
import { AuditView } from './components/audit/AuditView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SimulatorView } from './components/simulator/SimulatorView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginView } from './components/auth/LoginView';
import { supabase } from './services/supabaseClient';
import { ShieldCheck } from 'lucide-react';

const MainLayout: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { currentView } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'clients':
        return <ClientsView />;
      case 'licenses':
        return <LicensesView />;
      case 'subscriptions':
        return <SubscriptionsView />;
      case 'plans':
        return <PlansView />;
      case 'users':
        return <UsersView />;
      case 'campaigns':
        return <CampaignsView />;
      case 'modules':
        return <DashboardView />;
      case 'billing':
        return <BillingView />;
      case 'audit':
        return <AuditView />;
      case 'notifications':
        return <NotificationsView />;
      case 'simulator':
        return <SimulatorView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header Bar */}
          <Header onOpenMobileMenu={() => setMobileOpen(true)} onLogout={onLogout} />

          {/* Page View Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {renderCurrentView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For security, sign out immediately on page load/reload
    const clearSession = async () => {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
      setUser(null);
      setLoading(false);
    };
    clearSession();
  }, []);

  const handleLoginSuccess = (userData: any) => {
    // Retrieve the user from Supabase Auth to ensure full sync
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || userData);
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 text-white shadow-xl shadow-purple-900/50 border border-purple-400/30 animate-bounce">
          <ShieldCheck className="h-9 w-9" />
        </div>
        <p className="text-xs font-bold tracking-widest text-purple-400 uppercase animate-pulse">
          Validando Sesión en Supabase...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AppProvider user={user}>
      <MainLayout onLogout={handleLogout} />
    </AppProvider>
  );
}
