import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  UserPlus,
  CreditCard,
  HardDrive,
  TrendingUp,
  ChevronDown,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Check,
  RefreshCw,
  FileSpreadsheet,
  Activity,
  Layers,
  Database,
  ArrowRight,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Data for charts matching the screenshot
export const DashboardView: React.FC = () => {
  const { setCurrentView, addAuditLog, clients, users, subscriptions, invoices } = useApp();
  const [periodFilter, setPeriodFilter] = useState('Todo el periodo');
  const [activeModal, setActiveModal] = useState<
    'total_users' | 'active_users' | 'new_registers' | 'subscriptions' | 'storage' | null
  >(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === 'Activo').length;
  const newUsersCount = users.filter((u) => u.status === 'Pendiente' || u.status === 'Activo' || u.status === 'Pendiente Invitación').length;
  const activeSubscriptionsCount = subscriptions.filter((s) => s.status === 'Activa').length;

  // 1. Dynamic User Growth Data
  const monthsOrder = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const currentMonthIdx = new Date().getMonth();
  const targetMonths: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const idx = (currentMonthIdx - i + 12) % 12;
    targetMonths.push(monthsOrder[idx]);
  }

  const userCountByMonth: Record<string, number> = {};
  targetMonths.forEach(m => { userCountByMonth[m] = 0; });
  
  users.forEach(u => {
    if (u.createdAt) {
      const date = new Date(u.createdAt);
      if (!isNaN(date.getTime())) {
        const monthName = monthsOrder[date.getMonth()];
        if (monthName in userCountByMonth) {
          userCountByMonth[monthName]++;
        }
      }
    }
  });

  let cumulative = 0;
  const userGrowthData = targetMonths.map(month => {
    cumulative += userCountByMonth[month];
    return { month, usuarios: cumulative };
  });

  const maxUsersValue = Math.max(...userGrowthData.map(d => d.usuarios), 10);

  // 2. Dynamic Monthly Revenue Data (Form Invoices)
  const revenueByMonth: Record<string, number> = {};
  targetMonths.forEach(m => { revenueByMonth[m] = 0; });

  invoices.forEach(inv => {
    if (inv.issueDate && inv.status === 'Pagada') {
      const date = new Date(inv.issueDate);
      if (!isNaN(date.getTime())) {
        const monthName = monthsOrder[date.getMonth()];
        if (monthName in revenueByMonth) {
          revenueByMonth[monthName] += inv.totalAmount;
        }
      }
    }
  });

  const monthlyRevenueData = targetMonths.map(month => {
    return { month, ingresos: revenueByMonth[month] };
  });

  const maxRevenueValue = Math.max(...monthlyRevenueData.map(d => d.ingresos), 100);

  // 3. Dynamic Plan Distribution Data
  const planCounts: Record<string, number> = {
    'Free': 0,
    'Plus': 0,
    'Pro': 0,
    'Enterprise': 0,
  };

  users.forEach(u => {
    const client = clients.find(c => c.id === u.clientId);
    if (client) {
      if (client.planId === 'plan-free') planCounts['Free']++;
      else if (client.planId === 'plan-plus') planCounts['Plus']++;
      else if (client.planId === 'plan-pro') planCounts['Pro']++;
      else if (client.planId === 'plan-enterprise') planCounts['Enterprise']++;
    }
  });

  const totalPlanUsers = Object.values(planCounts).reduce((a, b) => a + b, 0);

  const planDistributionData = [
    { name: 'Free', count: planCounts['Free'], percentage: totalPlanUsers > 0 ? Math.round((planCounts['Free'] / totalPlanUsers) * 100) : 0, color: '#94a3b8' },
    { name: 'Plus', count: planCounts['Plus'], percentage: totalPlanUsers > 0 ? Math.round((planCounts['Plus'] / totalPlanUsers) * 100) : 0, color: '#7c3aed' },
    { name: 'Pro', count: planCounts['Pro'], percentage: totalPlanUsers > 0 ? Math.round((planCounts['Pro'] / totalPlanUsers) * 100) : 0, color: '#ea580c' },
    { name: 'Enterprise', count: planCounts['Enterprise'], percentage: totalPlanUsers > 0 ? Math.round((planCounts['Enterprise'] / totalPlanUsers) * 100) : 0, color: '#10b981' },
  ];

  const triggerActionMessage = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Action Notification Toast */}
      {actionSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 dark:bg-purple-950 text-white p-4 shadow-2xl border border-purple-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 text-xs font-semibold">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        <div className="relative shrink-0">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 pr-9 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
          >
            <option value="Todo el periodo">Todo el periodo</option>
            <option value="Este mes">Este mes</option>
            <option value="Último trimestre">Último trimestre</option>
            <option value="Este año">Este año</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Top Row: KPI Cards 1 to 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Usuarios totales */}
        <div
          onClick={() => setActiveModal('total_users')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 dark:bg-purple-950/60 p-2.5 text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Usuarios totales
              </span>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {totalUsersCount}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>0% vs mes anterior</span>
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Detalles <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Usuarios activos */}
        <div
          onClick={() => setActiveModal('active_users')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 dark:bg-purple-950/60 p-2.5 text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-110 transition-transform">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Usuarios activos
              </span>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {activeUsersCount}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>0% vs mes anterior</span>
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Detalles <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Nuevos registros */}
        <div
          onClick={() => setActiveModal('new_registers')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 dark:bg-purple-950/60 p-2.5 text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-110 transition-transform">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Nuevos registros
              </span>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {newUsersCount}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>0% vs mes anterior</span>
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Detalles <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Suscripciones activas */}
        <div
          onClick={() => setActiveModal('subscriptions')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 dark:bg-purple-950/60 p-2.5 text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-110 transition-transform">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Suscripciones activas
              </span>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {activeSubscriptionsCount}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>0% vs mes anterior</span>
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Detalles <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Second Row: Card (Almacenamiento total) */}
      <div className="w-full sm:w-72">
        <div
          onClick={() => setActiveModal('storage')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 dark:bg-purple-950/60 p-2.5 text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-110 transition-transform">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Almacenamiento total
              </span>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                0.0 GB
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>Estable (1 TB Capacidad Total)</span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
              Diagnóstico <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Row: 3 Columns matching image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Crecimiento de usuarios */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Crecimiento de usuarios
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Usuarios totales por mes
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0, maxUsersValue]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`${value} usuarios`, 'Total']}
                />
                <Line
                  type="monotone"
                  dataKey="usuarios"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  dot={{ fill: '#7c3aed', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#7c3aed', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Ingresos por mes */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Ingresos por mes
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Ingresos totales facturados
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis
                  domain={[0, maxRevenueValue]}
                  tickFormatter={(v) => `$${v.toLocaleString()}`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`$ ${value.toLocaleString()}`, 'Ingresos']}
                />
                <Bar dataKey="ingresos" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Distribución por plan */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Distribución por plan
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Usuarios activos por tipo de plan
            </p>
          </div>

          {/* Donut Chart with percentages overlaid */}
          <div className="relative h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {planDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                  formatter={(value, name) => [`${value} usuarios`, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Percentage labels floating overlay matching image positions */}
            {planDistributionData[0].percentage > 0 && (
              <div className="absolute top-2 right-12 text-xs font-extrabold text-slate-400">
                {planDistributionData[0].percentage}%
              </div>
            )}
            {planDistributionData[1].percentage > 0 && (
              <div className="absolute bottom-10 left-10 text-xs font-extrabold text-purple-600 dark:text-purple-400">
                {planDistributionData[1].percentage}%
              </div>
            )}
            {planDistributionData[2].percentage > 0 && (
              <div className="absolute bottom-6 right-16 text-xs font-extrabold text-orange-500">
                {planDistributionData[2].percentage}%
              </div>
            )}
            {planDistributionData[3].percentage > 0 && (
              <div className="absolute right-6 top-24 text-xs font-extrabold text-emerald-500">
                {planDistributionData[3].percentage}%
              </div>
            )}
          </div>

          {/* Legend row matching exact design in screenshot */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3 flex-wrap text-xs font-medium">
            {planDistributionData.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-slate-500 dark:text-slate-400">{p.name}</span>
                <span className="font-bold text-slate-900 dark:text-white">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= FUNCTIONAL DETAIL MODALS FOR EACH METRIC CARD ================= */}

      {/* MODAL 1: USUARIOS TOTALES */}
      {activeModal === 'total_users' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Desglose de Usuarios Totales</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Métrica consolidada de 1.130 cuentas registradas en la plataforma.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium block">Operadores Electorales</span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">620 usuarios</p>
                <span className="text-[10px] text-purple-600 dark:text-purple-400">54.8% del total</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium block">Testigos de Mesa E-14</span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">340 usuarios</p>
                <span className="text-[10px] text-purple-600 dark:text-purple-400">30.1% del total</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium block">Directores de Campaña</span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">120 usuarios</p>
                <span className="text-[10px] text-purple-600 dark:text-purple-400">10.6% del total</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium block">Super Admins / Auditores</span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">50 usuarios</p>
                <span className="text-[10px] text-purple-600 dark:text-purple-400">4.5% del total</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 text-xs space-y-2">
              <h4 className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
                Funcionalidad de esta Métrica:
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Permite monitorear el crecimiento orgánico de la base de usuarios por rol, verificar límites de seats por cliente y generar reportes de trazabilidad para la acreditación oficial de testigos electorales.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  addAuditLog('Exportar Usuarios', 'Sistema', 'Descargó reporte consolidado de 1,130 usuarios.');
                  triggerActionMessage('Reporte consolidado de usuarios exportado en CSV.');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                Exportar CSV
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setCurrentView('users');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow-md transition-all"
              >
                Ir a Gestión de Usuarios
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: USUARIOS ACTIVOS */}
      {activeModal === 'active_users' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Monitor de Usuarios Activos</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    842 usuarios con sesión concurrente activa en los últimos 15 minutos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">App Móvil Testigos E-14</span>
                    <span className="text-slate-400 text-[11px]">Subida de fotos de actas electorales</span>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">512 activos</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Panel Web Central</span>
                    <span className="text-slate-400 text-[11px]">Supervisores y coordinadores</span>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400">280 activos</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Integraciones API REST</span>
                    <span className="text-slate-400 text-[11px]">Sincronización externa de llamadas</span>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">50 sockets</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs space-y-2">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-emerald-600" />
                Funcionalidad de esta Métrica:
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Supervisa en tiempo real la carga de red en el servidor, garantiza baja latencia durante el conteo de votos de las elecciones y detecta picos inusuales de tráfico concurrente.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  triggerActionMessage('Sesiones inactivas actualizadas y refrescadas.');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4 text-emerald-600" />
                Refrescar Conexiones
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setCurrentView('audit');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow-md transition-all"
              >
                Ver Bitácora de Accesos
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: NUEVOS REGISTROS */}
      {activeModal === 'new_registers' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Nuevos Registros de la Semana</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    58 nuevas incorporaciones registradas en el periodo seleccionado (+18%).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Campaña Bogotá Centro - 12 operadores</p>
                  <p className="text-slate-400 text-[10px]">Onboarding completado • Hace 2 horas</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  Aprobado
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Valle del Cauca Norte - 25 testigos</p>
                  <p className="text-slate-400 text-[10px]">Verificación de documento E-14 • Hace 5 horas</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                  En Revisión
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Antioquia Gobernación - 21 operadores</p>
                  <p className="text-slate-400 text-[10px]">Asignación de rol de auditoría • Ayer</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  Aprobado
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 text-xs space-y-2">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                Funcionalidad de esta Métrica:
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Mide la velocidad de reclutamiento y despliegue de personal electoral en campo, asegurando que cada mesa de votación cuente con testigos calificados y verificados a tiempo.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  triggerActionMessage('Todos los registros pendientes han sido validados.');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Check className="h-4 w-4 text-emerald-600" />
                Validar Pendientes
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setCurrentView('campaigns');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow-md transition-all"
              >
                Ir a Campañas
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SUSCRIPCIONES ACTIVAS */}
      {activeModal === 'subscriptions' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Distribución de Suscripciones Activas</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    618 organizaciones con licencias contratadas en vigor (+2.4%).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Plan Free</span>
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                </div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">512 cuentas</p>
                <span className="text-[10px] text-slate-400">Pruebas gratuitas limitadas</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-600 dark:text-purple-400">Plan Plus</span>
                  <span className="h-2 w-2 rounded-full bg-purple-600" />
                </div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">348 licencias</p>
                <span className="text-[10px] text-purple-600 dark:text-purple-400">$1.2M COP/mes por cliente</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-500">Plan Pro</span>
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                </div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">196 licencias</p>
                <span className="text-[10px] text-orange-500">$3.5M COP/mes por cliente</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-500">Plan Enterprise</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">74 licencias</p>
                <span className="text-[10px] text-emerald-500">$12M COP/mes por campaña</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 text-xs space-y-2">
              <h4 className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-purple-600" />
                Funcionalidad de esta Métrica:
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Muestra el volumen de ingresos recurrentes por nivel de servicio, alertando sobre renovaciones próximas y oportunidades de upgrade a cuentas con alta demanda de procesamiento de actas.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setCurrentView('plans');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Ver Planes de Servicio
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setCurrentView('subscriptions');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow-md transition-all"
              >
                Ir a Suscripciones
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ALMACENAMIENTO TOTAL */}
      {activeModal === 'storage' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300">
                  <HardDrive className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Diagnóstico de Almacenamiento en Disco</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    318.4 GB ocupados de 1.000 GB asignados en la infraestructura en la nube.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Fotos de Actas E-14 (Imágenes OCR)</span>
                  <span className="text-purple-600 dark:text-purple-400">185.2 GB (58%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: '58%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Bitácora e Historial de Auditoría Inmutable</span>
                  <span className="text-blue-600 dark:text-blue-400">72.4 GB (23%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '23%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Base de Datos Relacional Multi-Tenant</span>
                  <span className="text-emerald-600 dark:text-emerald-400">41.8 GB (13%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '13%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Archivos Temporales y Caché</span>
                  <span className="text-amber-600 dark:text-amber-400">19.0 GB (6%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: '6%' }} />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 text-xs space-y-2">
              <h4 className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-purple-600" />
                Funcionalidad de esta Métrica:
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Controla la cuota de espacio en disco utilizada por los escaneos E-14 de alta resolución, logs de auditoría y backups automáticos para prevenir caídas durante eventos masivos.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  addAuditLog('Limpieza Caché', 'Sistema', 'Liberó 19.0 GB de archivos temporales en el servidor.');
                  triggerActionMessage('Se liberaron 19.0 GB de almacenamiento temporal.');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4 text-purple-600" />
                Purgar Caché Temporal
              </button>
              <button
                onClick={() => {
                  addAuditLog('Backup Servidor', 'Sistema', 'Inició copia de seguridad completa del almacenamiento.');
                  triggerActionMessage('Copia de seguridad en proceso de empaquetado...');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow-md transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                Crear Backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


