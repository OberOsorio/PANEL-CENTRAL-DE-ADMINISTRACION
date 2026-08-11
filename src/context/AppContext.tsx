import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExpiredDemoModal } from '../components/clients/ExpiredDemoModal';
import { supabase } from '../services/supabaseClient';
import { insforge } from '../services/insforgeClient';
import {
  Client,
  License,
  Subscription,
  Plan,
  ModuleDefinition,
  User,
  Role,
  Permission,
  Campaign,
  Invoice,
  AuditLog,
  Session,
  SystemNotification,
  AccessCheckResult,
  ClientStatus,
  LicenseStatus,
  UserStatus,
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_LICENSES,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_PLANS,
  INITIAL_MODULES,
  INITIAL_USERS,
  INITIAL_ROLES,
  INITIAL_PERMISSIONS,
  INITIAL_CAMPAIGNS,
  INITIAL_INVOICES,
  INITIAL_AUDIT_LOGS,
  INITIAL_SESSIONS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

export type ActiveView =
  | 'dashboard'
  | 'clients'
  | 'licenses'
  | 'subscriptions'
  | 'plans'
  | 'users'
  | 'roles'
  | 'campaigns'
  | 'modules'
  | 'billing'
  | 'audit'
  | 'notifications'
  | 'simulator'
  | 'settings';

interface AppContextType {
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  activeTenantId: string | 'GLOBAL';
  setActiveTenantId: (id: string | 'GLOBAL') => void;

  // Data
  clients: Client[];
  licenses: License[];
  subscriptions: Subscription[];
  plans: Plan[];
  modules: ModuleDefinition[];
  users: User[];
  roles: Role[];
  permissions: Permission[];
  campaigns: Campaign[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  sessions: Session[];
  notifications: SystemNotification[];

  // CRUD & Handlers
  addClientWithLicense: (
    clientData: Omit<Client, 'id' | 'createdAt' | 'status' | 'activeUsersCount' | 'activeCampaignsCount'>,
    durationMonths: number,
    enabledModules: string[],
    adminUserEmail: string,
    adminUserName: string,
    licenseTypeOverride?: string,
    demoDurationDays?: number,
    adminPassword?: string
  ) => { client: Client; license: License };

  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  toggleClientStatus: (id: string, status: ClientStatus) => void;
  updateLicense: (id: string, data: Partial<License>) => void;
  renewLicense: (id: string, months: number) => void;
  updateLicenseModules: (id: string, enabledModuleCodes: string[]) => void;
  updatePlan: (id: string, data: Partial<Plan>) => void;
  markInvoiceAsPaid: (invoiceId: string) => void;
  updateSubscription: (id: string, data: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;

  addUser: (userData: Omit<User, 'id' | 'createdAt' | 'lastAccessAt'>) => User;
  updateUserStatus: (id: string, status: UserStatus) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  terminateSession: (id: string) => void;

  updateRolePermissions: (roleId: string, permissionCodes: string[]) => void;
  markNotificationRead: (id: string) => void;
  addAuditLog: (action: string, category: AuditLog['category'], details: string, clientId?: string, clientName?: string) => void;

  // License verification gateway tester
  runAccessCheck: (email: string, clientId?: string, requestedModuleCode?: string) => AccessCheckResult;

  // Demo Expired Modal Trigger
  isExpiredDemoModalOpen: boolean;
  expiredDemoModalData: { clientName?: string; expiresAt?: string };
  triggerExpiredDemoModal: (clientName?: string, expiresAt?: string) => void;
  closeExpiredDemoModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode; user?: any }> = ({ children, user }) => {
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('cg_theme') === 'dark';
  });
  const [activeTenantId, setActiveTenantId] = useState<string | 'GLOBAL'>('GLOBAL');

  // Expired Demo Modal Popup State
  const [isExpiredDemoModalOpen, setIsExpiredDemoModalOpen] = useState(false);
  const [expiredDemoModalData, setExpiredDemoModalData] = useState<{ clientName?: string; expiresAt?: string }>({});

  const triggerExpiredDemoModal = (clientName?: string, expiresAt?: string) => {
    setExpiredDemoModalData({ clientName, expiresAt });
    setIsExpiredDemoModalOpen(true);
  };

  const closeExpiredDemoModal = () => {
    setIsExpiredDemoModalOpen(false);
  };

  // Load or fallback state from localStorage
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('cg_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [licenses, setLicenses] = useState<License[]>(() => {
    const saved = localStorage.getItem('cg_licenses');
    return saved ? JSON.parse(saved) : INITIAL_LICENSES;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('cg_subscriptions');
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  const [plans, setPlans] = useState<Plan[]>(() => {
    const saved = localStorage.getItem('cg_plans');
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });
  const [modules, setModules] = useState<ModuleDefinition[]>(INITIAL_MODULES);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('cg_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [roles, setRoles] = useState<Role[]>(() => {
    const saved = localStorage.getItem('cg_roles');
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });

  const [permissions] = useState<Permission[]>(INITIAL_PERMISSIONS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('cg_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('cg_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('cg_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('cg_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cg_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cg_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('cg_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('cg_licenses', JSON.stringify(licenses));
  }, [licenses]);

  useEffect(() => {
    localStorage.setItem('cg_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('cg_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cg_roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('cg_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('cg_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('cg_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('cg_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('cg_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  // Real-time synchronization with Supabase DB
  useEffect(() => {
    // Check connection and subscribe to live changes
    try {
      console.log('⚡ Conectando motor en vivo de Supabase DB...');
      const clientsChannel = supabase
        .channel('public:clients')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'clients' },
          (payload: any) => {
            if (payload?.eventType === 'UPDATE' || payload?.eventType === 'INSERT') {
              setClients((prev) => {
                const exists = prev.some((c) => c.id === payload.new.id);
                if (exists) {
                  return prev.map((c) => (c.id === payload.new.id ? { ...c, ...payload.new } : c));
                }
                return [payload.new, ...prev];
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(clientsChannel);
      };
    } catch (e) {
      console.warn('Supabase sync initialized with fallback mode.');
    }
  }, []);

  // Load data from InsForge DB when authenticated
  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      try {
        console.log('📦 Descargando datos reales de Supabase DB para el usuario:', user.email);

        // 1. Clients
        const { data: clientsData } = await insforge.database.from('clients').select('*');
        if (clientsData && clientsData.length > 0) {
          const mappedClients = clientsData.map((c: any) => ({
            id: c.id,
            organizationName: c.organization_name,
            responsibleName: c.responsible_name,
            taxId: c.tax_id,
            email: c.email,
            phone: c.phone,
            country: c.country,
            department: c.department,
            city: c.city,
            createdAt: c.created_at,
            status: c.status,
            planId: c.plan_id,
            planName: c.plan_name,
            activeUsersCount: c.active_users_count || 0,
            maxUsersAllowed: c.max_users_allowed || 0,
            activeCampaignsCount: c.active_campaigns_count || 0,
            notes: c.notes,
            logoUrl: c.logo_url
          }));
          setClients(mappedClients);
        } else {
          setClients([]);
        }

        // 2. Licenses
        const { data: licensesData } = await insforge.database.from('licenses').select('*');
        if (licensesData && licensesData.length > 0) {
          const mappedLicenses = licensesData.map((l: any) => ({
            id: l.id,
            clientId: l.client_id,
            clientName: l.client_name,
            planId: l.plan_id,
            planName: l.plan_name,
            createdAt: l.created_at,
            activatedAt: l.activated_at,
            expiresAt: l.expiresAt || l.expires_at,
            status: l.status,
            licenseType: l.license_type,
            maxUsers: l.max_users || 0,
            usedUsers: l.used_users || 0,
            maxCampaigns: l.max_campaigns || 0,
            usedCampaigns: l.used_campaigns || 0,
            maxStorageGB: l.max_storage_gb || 0,
            enabledModuleCodes: l.enabled_module_codes || [],
            licenseKey: l.license_key,
            autoRenew: l.auto_renew || false
          }));
          setLicenses(mappedLicenses);
        } else {
          setLicenses([]);
        }

        // 3. Subscriptions
        const { data: subsData } = await insforge.database.from('subscriptions').select('*');
        if (subsData && subsData.length > 0) {
          const mappedSubs = subsData.map((s: any) => ({
            id: s.id,
            clientId: s.client_id,
            clientName: s.client_name,
            planId: s.plan_id,
            planName: s.plan_name,
            price: Number(s.price || 0),
            currency: s.currency,
            periodicity: s.periodicity,
            startDate: s.start_date,
            nextBillingDate: s.next_billing_date,
            expirationDate: s.expiration_date,
            status: s.status,
            paymentMethod: s.payment_method
          }));
          setSubscriptions(mappedSubs);
        } else {
          setSubscriptions([]);
        }

        // 4. Users (from users_list)
        const { data: usersData } = await insforge.database.from('users_list').select('*');
        if (usersData && usersData.length > 0) {
          const mappedUsers = usersData.map((u: any) => ({
            id: u.id,
            firstName: u.first_name,
            lastName: u.last_name,
            email: u.email,
            phone: u.phone,
            clientId: u.client_id,
            clientName: u.client_name,
            campaignId: u.campaign_id,
            campaignName: u.campaign_name,
            roleId: u.role_id,
            roleName: u.role_name,
            status: u.status,
            lastAccessAt: u.last_access_at,
            createdAt: u.created_at,
            ipAddress: u.ip_address,
            avatarUrl: u.avatar_url
          }));
          setUsers(mappedUsers);
        } else {
          setUsers([]);
        }

        // 5. Campaigns
        const { data: campaignsData } = await insforge.database.from('campaigns').select('*');
        if (campaignsData && campaignsData.length > 0) {
          const mappedCampaigns = campaignsData.map((camp: any) => ({
            id: camp.id,
            clientId: camp.client_id,
            clientName: camp.client_name,
            name: camp.name,
            candidateName: camp.candidate_name,
            electionType: camp.election_type,
            territory: camp.territory,
            startDate: camp.start_date,
            electionDate: camp.election_date,
            status: camp.status,
            budget: Number(camp.budget || 0),
            spent: Number(camp.spent || 0),
            logoUrl: camp.logo_url
          }));
          setCampaigns(mappedCampaigns);
        } else {
          setCampaigns([]);
        }

        // 6. Invoices
        const { data: invoicesData } = await insforge.database.from('invoices').select('*');
        if (invoicesData && invoicesData.length > 0) {
          const mappedInvoices = invoicesData.map((i: any) => ({
            id: i.id,
            clientId: i.client_id,
            clientName: i.client_name,
            invoiceNumber: i.invoice_number,
            planName: i.plan_name,
            totalAmount: Number(i.total_amount || 0),
            currency: i.currency,
            issueDate: i.issue_date,
            dueDate: i.due_date,
            paidAt: i.paid_at,
            status: i.status
          }));
          setInvoices(mappedInvoices);
        } else {
          setInvoices([]);
        }

        // 7. Audit logs
        const { data: auditData } = await insforge.database.from('audit_logs').select('*');
        if (auditData && auditData.length > 0) {
          const mappedAudit = auditData.map((a: any) => ({
            id: a.id,
            timestamp: a.timestamp,
            userId: a.user_id_ref,
            userName: a.user_name,
            userEmail: a.user_email,
            clientId: a.client_id,
            clientName: a.client_name,
            action: a.action,
            category: a.category,
            details: a.details,
            ipAddress: a.ip_address,
            result: a.result
          }));
          setAuditLogs(mappedAudit);
        } else {
          setAuditLogs([]);
        }

        // 8. Notifications
        const { data: notifData } = await insforge.database.from('notifications').select('*');
        if (notifData && notifData.length > 0) {
          const mappedNotif = notifData.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            timestamp: n.timestamp,
            read: n.read || false,
            clientId: n.client_id
          }));
          setNotifications(mappedNotif);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      }
    };

    fetchAllData();
  }, [user]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const addAuditLog = (
    action: string,
    category: AuditLog['category'],
    details: string,
    clientId?: string,
    clientName?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: user?.id || 'usr-admin-master',
      userName: user?.name || user?.email?.split('@')[0] || 'Super Admin CG',
      userEmail: user?.email || 'admin@campanaganadora.ai',
      clientId,
      clientName,
      action,
      category,
      details,
      ipAddress: '190.158.204.12',
      result: 'Éxito',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    if (user) {
      Promise.resolve(
        insforge.database.from('audit_logs').insert([{
          id: newLog.id,
          timestamp: newLog.timestamp,
          user_id_ref: newLog.userId,
          user_name: newLog.userName,
          user_email: newLog.userEmail,
          client_id: newLog.clientId || null,
          client_name: newLog.clientName || null,
          action: newLog.action,
          category: newLog.category,
          details: newLog.details,
          ip_address: newLog.ipAddress || null,
          result: newLog.result,
          user_id: user.id
        }])
      ).catch((err: any) => console.error('Error inserting audit_log into InsForge:', err));
    }
  };

  const addClientWithLicense = (
    clientData: Omit<Client, 'id' | 'createdAt' | 'status' | 'activeUsersCount' | 'activeCampaignsCount'>,
    durationMonths: number,
    enabledModules: string[],
    adminUserEmail: string,
    adminUserName: string,
    licenseTypeOverride?: string,
    demoDurationDays?: number,
    adminPassword?: string
  ) => {
    const clientId = `CLI-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const createdAt = now.toISOString().split('T')[0];

    const isDemo = licenseTypeOverride === 'Especial Demo' || clientData.planId === 'plan-demo';

    const expDate = new Date();
    if (isDemo) {
      const days = Math.min(Math.max(demoDurationDays || 3, 1), 3);
      expDate.setDate(expDate.getDate() + days);
    } else {
      expDate.setMonth(expDate.getMonth() + durationMonths);
    }
    const expiresAt = expDate.toISOString().split('T')[0];

    const plan = plans.find((p) => p.id === clientData.planId) || plans[1];

    const newClient: Client = {
      ...clientData,
      id: clientId,
      createdAt,
      status: 'Activo',
      activeUsersCount: 1,
      activeCampaignsCount: 1,
    };

    const licenseId = `LIC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const calculatedLicenseType = isDemo
      ? 'Especial Demo'
      : (licenseTypeOverride as any) || (durationMonths >= 12 ? 'Anual' : durationMonths >= 6 ? 'Semestral' : 'Mensual');

    const newLicense: License = {
      id: licenseId,
      clientId,
      clientName: clientData.organizationName,
      planId: plan.id,
      planName: plan.name,
      createdAt,
      activatedAt: createdAt,
      expiresAt,
      status: 'Activa',
      licenseType: calculatedLicenseType,
      maxUsers: plan.maxUsers,
      usedUsers: 1,
      maxCampaigns: plan.maxCampaigns,
      usedCampaigns: 1,
      maxStorageGB: plan.maxStorageGB,
      enabledModuleCodes: enabledModules,
      licenseKey: `CG-${plan.code}-2026-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      autoRenew: !isDemo,
    };

    const subId = `SUB-${Math.floor(10000 + Math.random() * 90000)}`;
    const newSub: Subscription = {
      id: subId,
      clientId,
      clientName: clientData.organizationName,
      planId: plan.id,
      planName: plan.name,
      price: durationMonths >= 12 ? plan.annualPrice : plan.monthlyPrice * durationMonths,
      currency: 'USD',
      periodicity: durationMonths >= 12 ? 'Anual' : 'Mensual',
      startDate: createdAt,
      nextBillingDate: expiresAt,
      expirationDate: expiresAt,
      status: 'Activa',
      paymentMethod: 'Transferencia Directa',
    };

    const nameParts = adminUserName.trim().split(' ');
    const firstName = nameParts[0] || 'Admin';
    const lastName = nameParts.slice(1).join(' ') || clientData.organizationName;

    const newAdminUser: User = {
      id: `usr-${Date.now()}`,
      firstName,
      lastName,
      email: adminUserEmail,
      password: adminPassword || 'Campaña2026!',
      phone: clientData.phone,
      clientId,
      clientName: clientData.organizationName,
      roleId: 'role-clientadmin',
      roleName: 'Administrador del Cliente',
      status: 'Activo',
      lastAccessAt: 'Aún no ingresa',
      createdAt,
      ipAddress: 'Pendiente',
    };

    const newInvoice: Invoice = {
      id: `FAC-2026-${Math.floor(800 + Math.random() * 200)}`,
      clientId,
      clientName: clientData.organizationName,
      subscriptionId: subId,
      issueDate: createdAt,
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      amount: newSub.price,
      taxAmount: 0,
      totalAmount: newSub.price,
      status: 'Pagada',
      description: `Alta de Licencia - ${plan.name} (${durationMonths} Meses)`,
      paymentMethod: 'Transferencia Bancaria',
      paidAt: createdAt,
    };

    const newCampaign: Campaign = {
      id: `CMP-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientId,
      clientName: clientData.organizationName,
      name: `Campaña Principal - ${clientData.organizationName}`,
      electionType: 'Alcaldía',
      candidateName: adminUserName,
      territory: clientData.city || clientData.department || 'Colombia',
      startDate: createdAt,
      electionDate: expiresAt,
      status: 'En Ejecución',
      registeredVotersTarget: 50000,
      registeredVotersCurrent: 0,
    };

    setClients((prev) => [newClient, ...prev]);
    setLicenses((prev) => [newLicense, ...prev]);
    setSubscriptions((prev) => [newSub, ...prev]);
    setUsers((prev) => [newAdminUser, ...prev]);
    setInvoices((prev) => [newInvoice, ...prev]);
    setCampaigns((prev) => [newCampaign, ...prev]);

    if (user) {
      Promise.resolve(
        insforge.database.from('clients').insert([{
          id: newClient.id,
          organization_name: newClient.organizationName,
          responsible_name: newClient.responsibleName,
          tax_id: newClient.taxId,
          email: newClient.email,
          phone: newClient.phone,
          country: newClient.country,
          department: newClient.department,
          city: newClient.city,
          created_at: newClient.createdAt,
          status: newClient.status,
          plan_id: newClient.planId,
          plan_name: newClient.planName,
          active_users_count: newClient.activeUsersCount,
          max_users_allowed: newClient.maxUsersAllowed,
          active_campaigns_count: newClient.activeCampaignsCount,
          notes: newClient.notes || null,
          logo_url: newClient.logoUrl || null,
          user_id: user.id
        }])
      ).catch((err: any) => console.error('Error writing client to InsForge:', err));

      Promise.resolve(
        insforge.database.from('licenses').insert([{
          id: newLicense.id,
          client_id: newLicense.clientId,
          client_name: newLicense.clientName,
          plan_id: newLicense.planId,
          plan_name: newLicense.planName,
          created_at: newLicense.createdAt,
          activated_at: newLicense.activatedAt,
          expires_at: newLicense.expiresAt,
          status: newLicense.status,
          license_type: newLicense.licenseType,
          max_users: newLicense.maxUsers,
          used_users: newLicense.usedUsers,
          max_campaigns: newLicense.maxCampaigns,
          used_campaigns: newLicense.usedCampaigns,
          max_storage_gb: newLicense.maxStorageGB,
          enabled_module_codes: newLicense.enabledModuleCodes,
          license_key: newLicense.licenseKey,
          auto_renew: newLicense.autoRenew,
          user_id: user.id
        }])
      ).catch((err: any) => console.error('Error writing license to InsForge:', err));

      Promise.resolve(
        insforge.database.from('subscriptions').insert([{
          id: newSub.id,
          client_id: newSub.clientId,
          client_name: newSub.clientName,
          plan_id: newSub.planId,
          plan_name: newSub.planName,
          price: newSub.price,
          currency: newSub.currency,
          periodicity: newSub.periodicity,
          start_date: newSub.startDate,
          next_billing_date: newSub.nextBillingDate,
          expiration_date: newSub.expirationDate,
          status: newSub.status,
          payment_method: newSub.paymentMethod || null,
          user_id: user.id
        }])
      ).catch((err: any) => console.error('Error writing subscription to InsForge:', err));

      Promise.resolve(
        insforge.database.from('users_list').insert([{
          id: newAdminUser.id,
          first_name: newAdminUser.firstName,
          last_name: newAdminUser.lastName,
          email: newAdminUser.email,
          phone: newAdminUser.phone || null,
          client_id: newAdminUser.clientId,
          client_name: newAdminUser.clientName,
          campaign_id: newAdminUser.campaignId || null,
          campaign_name: newAdminUser.campaignName || null,
          role_id: newAdminUser.roleId,
          role_name: newAdminUser.roleName,
          status: newAdminUser.status,
          last_access_at: newAdminUser.lastAccessAt,
          created_at: newAdminUser.createdAt,
          ip_address: newAdminUser.ipAddress || null,
          avatar_url: newAdminUser.avatarUrl || null,
          user_id: user.id
        }])
      ).catch((err: any) => console.error('Error writing user_list to InsForge:', err));

      Promise.resolve(
        insforge.database.from('invoices').insert([{
          id: newInvoice.id,
          client_id: newInvoice.clientId,
          client_name: newInvoice.clientName,
          invoice_number: newInvoice.id,
          plan_name: plan.name,
          total_amount: newInvoice.totalAmount,
          currency: newSub.currency,
          issue_date: newInvoice.issueDate,
          due_date: newInvoice.dueDate,
          paid_at: newInvoice.paidAt || null,
          status: newInvoice.status,
          user_id: user.id
        }])
      ).catch((err: any) => console.error('Error writing invoice to InsForge:', err));

      Promise.resolve(
        insforge.database.from('campaigns').insert([{
          id: newCampaign.id,
          client_id: newCampaign.clientId,
          client_name: newCampaign.clientName,
          name: newCampaign.name,
          candidate_name: newCampaign.candidateName,
          election_type: newCampaign.electionType,
          territory: newCampaign.territory,
          start_date: newCampaign.startDate,
          election_date: newCampaign.electionDate,
          status: newCampaign.status,
          user_id: user.id
        }])
      ).catch((err: any) => console.error('Error writing campaign to InsForge:', err));
    }

    addAuditLog(
      'Cliente Creado',
      'Cliente',
      `Creación e inducción completa de cliente ${newClient.organizationName} con licencia ${newLicense.id}.`,
      clientId,
      newClient.organizationName
    );

    return { client: newClient, license: newLicense };
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );

    if (user) {
      const updateData: any = {};
      if (data.organizationName !== undefined) updateData.organization_name = data.organizationName;
      if (data.responsibleName !== undefined) updateData.responsible_name = data.responsibleName;
      if (data.taxId !== undefined) updateData.tax_id = data.taxId;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.country !== undefined) updateData.country = data.country;
      if (data.department !== undefined) updateData.department = data.department;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.planId !== undefined) updateData.plan_id = data.planId;
      if (data.planName !== undefined) updateData.plan_name = data.planName;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;

      Promise.resolve(
        insforge.database.from('clients').update(updateData).eq('id', id)
      ).catch((err: any) => console.error('Error updating client in InsForge:', err));
    }

    addAuditLog('Cliente Actualizado', 'Cliente', `Actualizó información para ${id}`, id);
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setLicenses((prev) => prev.filter((l) => l.clientId !== id));
    setSubscriptions((prev) => prev.filter((s) => s.clientId !== id));
    setInvoices((prev) => prev.filter((i) => i.clientId !== id));
    setCampaigns((prev) => prev.filter((c) => c.clientId !== id));
    setUsers((prev) => prev.filter((u) => u.clientId !== id));

    if (user) {
      Promise.resolve(insforge.database.from('clients').delete().eq('id', id)).catch((err: any) => console.error(err));
      Promise.resolve(insforge.database.from('licenses').delete().eq('client_id', id)).catch((err: any) => console.error(err));
      Promise.resolve(insforge.database.from('subscriptions').delete().eq('client_id', id)).catch((err: any) => console.error(err));
      Promise.resolve(insforge.database.from('invoices').delete().eq('client_id', id)).catch((err: any) => console.error(err));
      Promise.resolve(insforge.database.from('campaigns').delete().eq('client_id', id)).catch((err: any) => console.error(err));
      Promise.resolve(insforge.database.from('users_list').delete().eq('client_id', id)).catch((err: any) => console.error(err));
    }

    addAuditLog('Cliente Eliminado', 'Cliente', `Eliminó el cliente ID ${id} y todos sus datos relacionados.`);
  };

  const toggleClientStatus = (id: string, status: ClientStatus) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );

    const licenseStatus: LicenseStatus =
      status === 'Activo'
        ? 'Activa'
        : status === 'Suspendido'
          ? 'Suspendida'
          : status === 'Vencido'
            ? 'Vencida'
            : 'Próxima a vencer';

    setLicenses((prev) =>
      prev.map((l) => (l.clientId === id ? { ...l, status: licenseStatus } : l))
    );

    const client = clients.find((c) => c.id === id);
    const clientName = client ? client.organizationName : id;

    if (user) {
      Promise.resolve(insforge.database.from('clients').update({ status }).eq('id', id)).catch((err: any) => console.error(err));
      Promise.resolve(insforge.database.from('licenses').update({ status: licenseStatus }).eq('client_id', id)).catch((err: any) => console.error(err));
    }

    if (status === 'Próximo a vencer') {
      const newNotif: SystemNotification = {
        id: `notif-exp-${Date.now()}`,
        title: '⚠️ Licencia Próxima a Vencer',
        message: `La licencia de "${clientName}" está próxima a vencer. Notificación enviada a administradores del sistema y al usuario responsable (${client?.responsibleName || 'Administrador'}).`,
        type: 'warning',
        timestamp: 'Justo ahora',
        read: false,
        clientId: id,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      if (user) {
        Promise.resolve(
          insforge.database.from('notifications').insert([{
            id: newNotif.id,
            title: newNotif.title,
            message: newNotif.message,
            type: newNotif.type,
            timestamp: newNotif.timestamp,
            read: newNotif.read,
            client_id: newNotif.clientId || null,
            user_id: user.id
          }])
        ).catch((err: any) => console.error(err));
      }
    }

    addAuditLog(
      status === 'Suspendido' ? 'Cliente Suspendido' : 'Estado Cliente Cambiado',
      'Cliente',
      `Cambió estado de cliente ${clientName} (${id}) a ${status}. Se emitieron las alertas de notificación correspondientes.`,
      id,
      clientName
    );
  };

  const updateLicense = (id: string, data: Partial<License>) => {
    setLicenses((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...data } : l))
    );

    const targetLic = licenses.find((l) => l.id === id);

    if (user) {
      const updateData: any = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.licenseType !== undefined) updateData.license_type = data.licenseType;
      if (data.maxUsers !== undefined) updateData.max_users = data.maxUsers;
      if (data.usedUsers !== undefined) updateData.used_users = data.usedUsers;
      if (data.maxCampaigns !== undefined) updateData.max_campaigns = data.maxCampaigns;
      if (data.usedCampaigns !== undefined) updateData.used_campaigns = data.usedCampaigns;
      if (data.enabledModuleCodes !== undefined) updateData.enabled_module_codes = data.enabledModuleCodes;
      if (data.autoRenew !== undefined) updateData.auto_renew = data.autoRenew;

      Promise.resolve(
        insforge.database.from('licenses').update(updateData).eq('id', id)
      ).catch((err: any) => console.error(err));
    }

    if (data.status === 'Próxima a vencer' && targetLic) {
      const newNotif: SystemNotification = {
        id: `notif-exp-lic-${Date.now()}`,
        title: '⚠️ Licencia Próxima a Vencer',
        message: `La licencia ${id} del cliente "${targetLic.clientName}" ha sido clasificada como PRÓXIMA A VENCER. Notificación enviada al usuario responsable y al equipo de administración.`,
        type: 'warning',
        timestamp: 'Justo ahora',
        read: false,
        clientId: targetLic.clientId,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      if (user) {
        Promise.resolve(
          insforge.database.from('notifications').insert([{
            id: newNotif.id,
            title: newNotif.title,
            message: newNotif.message,
            type: newNotif.type,
            timestamp: newNotif.timestamp,
            read: newNotif.read,
            client_id: newNotif.clientId || null,
            user_id: user.id
          }])
        ).catch((err: any) => console.error(err));
      }
    }

    addAuditLog('Licencia Modificada', 'Licencia', `Modificó parámetros de licencia ${id}.`);
  };

  const renewLicense = (id: string, months: number) => {
    let newExpiresAt = '';
    setLicenses((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const currentExp = new Date(l.expiresAt > new Date().toISOString() ? l.expiresAt : Date.now());
          currentExp.setMonth(currentExp.getMonth() + months);
          newExpiresAt = currentExp.toISOString().split('T')[0];
          return {
            ...l,
            expiresAt: newExpiresAt,
            status: 'Activa',
          };
        }
        return l;
      })
    );

    const lic = licenses.find((l) => l.id === id);
    if (lic) {
      setClients((prev) =>
        prev.map((c) => (c.id === lic.clientId ? { ...c, status: 'Activo' } : c))
      );

      if (user) {
        Promise.resolve(insforge.database.from('licenses').update({ expires_at: newExpiresAt, status: 'Activa' }).eq('id', id)).catch((err: any) => console.error(err));
        Promise.resolve(insforge.database.from('clients').update({ status: 'Activo' }).eq('id', lic.clientId)).catch((err: any) => console.error(err));
      }

      addAuditLog(
        'Licencia Renovada',
        'Licencia',
        `Renovó vigencia de licencia ${id} por ${months} meses adicionales.`,
        lic.clientId,
        lic.clientName
      );
    }
  };

  const updateLicenseModules = (id: string, enabledModuleCodes: string[]) => {
    setLicenses((prev) =>
      prev.map((l) => (l.id === id ? { ...l, enabledModuleCodes } : l))
    );

    if (user) {
      Promise.resolve(insforge.database.from('licenses').update({ enabled_module_codes: enabledModuleCodes }).eq('id', id)).catch((err: any) => console.error(err));
    }

    addAuditLog('Módulos de Licencia Actualizados', 'Módulo', `Actualizó matriz de módulos para la licencia ${id}.`);
  };

  const updatePlan = (id: string, data: Partial<Plan>) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
    const updatedPlan = plans.find((p) => p.id === id);
    addAuditLog('Plan Comercial Modificado', 'Sistema', `Actualizó configuración del plan comercial ${updatedPlan?.name || id}.`);
  };

  const markInvoiceAsPaid = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: 'Pagada', paidAt: new Date().toISOString().split('T')[0] } : i))
    );

    const lic = licenses.find((l) => l.clientId === inv.clientId);
    if (lic) {
      const currentExp = new Date(lic.expiresAt > new Date().toISOString() ? lic.expiresAt : Date.now());
      currentExp.setMonth(currentExp.getMonth() + 12);
      const newExpiresAt = currentExp.toISOString().split('T')[0];

      setLicenses((prev) =>
        prev.map((l) => (l.id === lic.id ? { ...l, expiresAt: newExpiresAt, status: 'Activa' } : l))
      );

      setClients((prev) =>
        prev.map((c) => (c.id === inv.clientId ? { ...c, status: 'Activo' } : c))
      );

      const newNotif: SystemNotification = {
        id: `notif-pay-${Date.now()}`,
        title: '✅ Pago Confirmado y Licencia Activada',
        message: `Se ha verificado el pago de la factura ${inv.id} ($${inv.totalAmount} USD) para "${inv.clientName}". La licencia ha sido activada automáticamente.`,
        type: 'success',
        timestamp: 'Justo ahora',
        read: false,
        clientId: inv.clientId,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      if (user) {
        Promise.resolve(insforge.database.from('invoices').update({ status: 'Pagada', paid_at: new Date().toISOString().split('T')[0] }).eq('id', invoiceId)).catch((err: any) => console.error(err));
        Promise.resolve(insforge.database.from('licenses').update({ expires_at: newExpiresAt, status: 'Activa' }).eq('id', lic.id)).catch((err: any) => console.error(err));
        Promise.resolve(insforge.database.from('clients').update({ status: 'Activo' }).eq('id', inv.clientId)).catch((err: any) => console.error(err));
        Promise.resolve(
          insforge.database.from('notifications').insert([{
            id: newNotif.id,
            title: newNotif.title,
            message: newNotif.message,
            type: newNotif.type,
            timestamp: newNotif.timestamp,
            read: newNotif.read,
            client_id: newNotif.clientId || null,
            user_id: user.id
          }])
        ).catch((err: any) => console.error(err));
      }

      addAuditLog(
        'Pago Registrado y Licencia Activada',
        'Suscripción',
        `Se detectó el pago de factura ${inv.id} para ${inv.clientName}. Licencia reactivada automáticamente hasta ${newExpiresAt}.`,
        inv.clientId,
        inv.clientName
      );
    }
  };

  const updateSubscription = (id: string, data: Partial<Subscription>) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );

    if (user) {
      const updateData: any = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.periodicity !== undefined) updateData.periodicity = data.periodicity;
      if (data.nextBillingDate !== undefined) updateData.next_billing_date = data.nextBillingDate;
      if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod;

      Promise.resolve(
        insforge.database.from('subscriptions').update(updateData).eq('id', id)
      ).catch((err: any) => console.error(err));
    }

    addAuditLog('Suscripción Modificada', 'Suscripción', `Modificó datos de la suscripción ${id}.`);
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));

    if (user) {
      Promise.resolve(insforge.database.from('subscriptions').delete().eq('id', id)).catch((err: any) => console.error(err));
    }

    addAuditLog('Suscripción Eliminada', 'Suscripción', `Eliminó la suscripción ID ${id}.`);
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'lastAccessAt'>) => {
    const newUser: User = {
      ...userData,
      password: userData.password || 'Campaña2026!',
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastAccessAt: 'Pendiente',
    };
    setUsers((prev) => [newUser, ...prev]);

    if (user) {
      Promise.resolve(
        insforge.database.from('users_list').insert([{
          id: newUser.id,
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone || null,
          client_id: newUser.clientId,
          client_name: newUser.clientName,
          campaign_id: newUser.campaignId || null,
          campaign_name: newUser.campaignName || null,
          role_id: newUser.roleId,
          role_name: newUser.roleName,
          status: newUser.status,
          last_access_at: newUser.lastAccessAt,
          created_at: newUser.createdAt,
          user_id: user.id
        }])
      ).catch((err: any) => console.error('Error writing user to InsForge:', err));
    }

    addAuditLog('Usuario Creado', 'Usuario', `Creó usuario ${newUser.email} para ${newUser.clientName}.`, newUser.clientId, newUser.clientName);
    return newUser;
  };

  const updateUserStatus = (id: string, status: UserStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status } : u))
    );

    if (user) {
      Promise.resolve(insforge.database.from('users_list').update({ status }).eq('id', id)).catch((err: any) => console.error(err));
    }

    addAuditLog('Estado Usuario Cambiado', 'Usuario', `Cambió estado de usuario ${id} a ${status}.`);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...data } : u))
    );

    if (user) {
      const updateData: any = {};
      if (data.firstName !== undefined) updateData.first_name = data.firstName;
      if (data.lastName !== undefined) updateData.last_name = data.lastName;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.roleId !== undefined) updateData.role_id = data.roleId;
      if (data.roleName !== undefined) updateData.role_name = data.roleName;

      Promise.resolve(
        insforge.database.from('users_list').update(updateData).eq('id', id)
      ).catch((err: any) => console.error(err));
    }

    addAuditLog('Usuario Modificado', 'Usuario', `Modificó datos de usuario ${id}.`);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));

    if (user) {
      Promise.resolve(insforge.database.from('users_list').delete().eq('id', id)).catch((err: any) => console.error(err));
    }

    addAuditLog('Usuario Eliminado', 'Usuario', `Eliminó usuario ID ${id}.`);
  };

  const terminateSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    addAuditLog('Sesión CERRADA', 'Acceso', `Terminó remotamente la sesión ${id}.`);
  };

  const updateRolePermissions = (roleId: string, permissionCodes: string[]) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissionCodes } : r))
    );
    addAuditLog('Permisos de Rol Actualizados', 'Rol', `Actualizó matriz de permisos para rol ID ${roleId}.`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    if (user) {
      Promise.resolve(insforge.database.from('notifications').update({ read: true }).eq('id', id)).catch((err: any) => console.error(err));
    }
  };

  // 19. ACCESS VERIFICATION GATEWAY (Simulates live check for Electoral Software)
  const runAccessCheck = (email: string, clientId?: string, requestedModuleCode?: string): AccessCheckResult => {
    let client = clients.find((c) => c.id === clientId || c.email.toLowerCase() === email.toLowerCase());
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() || (clientId && u.clientId === clientId));

    if (!client && user) {
      client = clients.find((c) => c.id === user?.clientId);
    }

    if (!client) {
      return {
        allowed: false,
        code: 'SUSPENDED_CLIENT',
        title: 'CLIENTE O CREDENCIAL NO ENCONTRADA',
        message: 'No existe una organización registrada con el correo o ID proporcionado.',
      };
    }

    if (client.status === 'Suspendido') {
      return {
        allowed: false,
        code: 'SUSPENDED_CLIENT',
        title: 'CUENTA SUSPENDIDA POR EL SUPER ADMIN',
        message: `El acceso para la organización "${client.organizationName}" ha sido bloqueado administrativamente. Contacte a soporte.`,
        clientInfo: { name: client.organizationName, status: client.status, plan: client.planName },
      };
    }

    const license = licenses.find((l) => l.clientId === client?.id);

    if (!license) {
      return {
        allowed: false,
        code: 'EXPIRED_LICENSE',
        title: 'SIN LICENCIA REGISTRADA',
        message: `La organización "${client.organizationName}" no posee una licencia activa en el sistema.`,
        clientInfo: { name: client.organizationName, status: client.status, plan: client.planName },
      };
    }

    const expDate = new Date(license.expiresAt);
    const graceDate = new Date(expDate);
    graceDate.setDate(graceDate.getDate() + 2); // 2 días de gracia adicionales antes de suspensión definitiva
    const graceDateStr = graceDate.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    // Se considera suspendido solo si se superan los 2 días de gracia posteriores al vencimiento
    if (license.status === 'Suspendida' || todayStr > graceDateStr) {
      const isDemo = license.licenseType === 'Especial Demo' || client.planId === 'plan-demo';
      if (isDemo) {
        triggerExpiredDemoModal(client.organizationName, license.expiresAt);
        return {
          allowed: false,
          code: 'EXPIRED_LICENSE',
          title: '¡CUENTA DEMO VENCIDA (MÁXIMO 3 DÍAS)!',
          message: `El periodo de prueba gratuita de 3 días para la cuenta "${client.organizationName}" ha finalizado. Para seguir utilizando el servicio de Software Electoral, debes adquirir un plan de pago.`,
          clientInfo: { name: client.organizationName, status: client.status, plan: client.planName },
          licenseInfo: { id: license.id, expiresAt: license.expiresAt, type: license.licenseType, status: license.status },
        };
      }

      return {
        allowed: false,
        code: 'EXPIRED_LICENSE',
        title: 'ACCESO DENEGADO - SUSPENSIÓN POR MORA',
        message: `La licencia ${license.id} de "${client.organizationName}" venció el ${license.expiresAt}. Se otorgaron 2 días adicionales de gracia pero ha sido suspendida definitivamente por falta de pago.`,
        clientInfo: { name: client.organizationName, status: client.status, plan: client.planName },
        licenseInfo: { id: license.id, expiresAt: license.expiresAt, type: license.licenseType, status: license.status },
      };
    }

    if (user && user.status === 'Suspendido') {
      return {
        allowed: false,
        code: 'USER_INACTIVE',
        title: 'USUARIO INHABILITADO',
        message: `El usuario ${user.firstName} ${user.lastName} se encuentra suspendido en la plataforma.`,
        clientInfo: { name: client.organizationName, status: client.status, plan: client.planName },
      };
    }

    if (requestedModuleCode && !license.enabledModuleCodes.includes(requestedModuleCode)) {
      const mod = modules.find((m) => m.code === requestedModuleCode);
      return {
        allowed: false,
        code: 'MODULE_DISABLED',
        title: 'MÓDULO NO HABILITADO EN LICENCIA',
        message: `El módulo "${mod ? mod.name : requestedModuleCode}" no está incluido en la licencia de ${client.organizationName}.`,
        clientInfo: { name: client.organizationName, status: client.status, plan: client.planName },
        licenseInfo: { id: license.id, expiresAt: license.expiresAt, type: license.licenseType, status: license.status },
        enabledModules: license.enabledModuleCodes,
      };
    }

    return {
      allowed: true,
      code: 'OK',
      title: 'ACCESO PERMITIDO Y AUTORIZADO',
      message: 'Licencia activa, credenciales validadas y permisos correctos para el Software Electoral.',
      clientInfo: { name: client.organizationName, status: client.status, plan: client.planName },
      licenseInfo: { id: license.id, expiresAt: license.expiresAt, type: license.licenseType, status: license.status },
      enabledModules: license.enabledModuleCodes,
      redirectUrl: 'https://softwareelectoral.netlify.app/',
    };
  };

  const clientsWithMetrics = clients.map((c) => {
    const clientUsers = users.filter((u) => u.clientId === c.id);
    const clientCampaigns = campaigns.filter((camp) => camp.clientId === c.id);
    return {
      ...c,
      activeUsersCount: clientUsers.length,
      activeCampaignsCount: clientCampaigns.length,
    };
  });

  const licensesWithMetrics = licenses.map((l) => {
    const clientUsers = users.filter((u) => u.clientId === l.clientId);
    const clientCampaigns = campaigns.filter((camp) => camp.clientId === l.clientId);
    return {
      ...l,
      usedUsers: clientUsers.length,
      usedCampaigns: clientCampaigns.length,
    };
  });

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        isDarkMode,
        toggleDarkMode,
        activeTenantId,
        setActiveTenantId,
        clients: clientsWithMetrics,
        licenses: licensesWithMetrics,
        subscriptions,
        plans,
        modules,
        users,
        roles,
        permissions,
        campaigns,
        invoices,
        auditLogs,
        sessions,
        notifications,
        addClientWithLicense,
        updateClient,
        deleteClient,
        toggleClientStatus,
        updateLicense,
        renewLicense,
        updateLicenseModules,
        updatePlan,
        markInvoiceAsPaid,
        updateSubscription,
        deleteSubscription,
        addUser,
        updateUserStatus,
        updateUser,
        deleteUser,
        terminateSession,
        updateRolePermissions,
        markNotificationRead,
        addAuditLog,
        runAccessCheck,
        isExpiredDemoModalOpen,
        expiredDemoModalData,
        triggerExpiredDemoModal,
        closeExpiredDemoModal,
      }}
    >
      {children}
      <ExpiredDemoModal
        isOpen={isExpiredDemoModalOpen}
        onClose={closeExpiredDemoModal}
        clientName={expiredDemoModalData.clientName}
        expiresAt={expiredDemoModalData.expiresAt}
      />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
