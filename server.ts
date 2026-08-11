import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_CLIENTS,
  INITIAL_LICENSES,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_USERS,
  INITIAL_PLANS,
  INITIAL_MODULES,
  INITIAL_ROLES,
  INITIAL_PERMISSIONS,
  INITIAL_CAMPAIGNS,
  INITIAL_INVOICES,
  INITIAL_AUDIT_LOGS,
  INITIAL_SESSIONS,
  INITIAL_NOTIFICATIONS,
} from './src/data/initialData.js';
import {
  Client,
  License,
  Subscription,
  User,
  Plan,
  ModuleDefinition,
  Role,
  Permission,
  Campaign,
  Invoice,
  AuditLog,
  Session,
  SystemNotification,
  AccessCheckResult,
} from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Database Store for Server Session Persistence
let clientsDb: Client[] = [...INITIAL_CLIENTS];
let licensesDb: License[] = [...INITIAL_LICENSES];
let subscriptionsDb: Subscription[] = [...INITIAL_SUBSCRIPTIONS];
let usersDb: User[] = [...INITIAL_USERS];
let plansDb: Plan[] = [...INITIAL_PLANS];
let modulesDb: ModuleDefinition[] = [...INITIAL_MODULES];
let rolesDb: Role[] = [...INITIAL_ROLES];
let permissionsDb: Permission[] = [...INITIAL_PERMISSIONS];
let campaignsDb: Campaign[] = [...INITIAL_CAMPAIGNS];
let invoicesDb: Invoice[] = [...INITIAL_INVOICES];
let auditLogsDb: AuditLog[] = [...INITIAL_AUDIT_LOGS];
let sessionsDb: Session[] = [...INITIAL_SESSIONS];
let notificationsDb: SystemNotification[] = [...INITIAL_NOTIFICATIONS];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS headers for multi-tenant integration
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Client-ID');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Campaña Ganadora AI - Panel Central API',
      timestamp: new Date().toISOString(),
      activeTenants: clientsDb.filter((c) => c.status === 'Activo').length,
    });
  });

  // ==========================================
  // 19. ELECTORAL SOFTWARE LICENSE & ACCESS VERIFICATION GATEWAY
  // ==========================================
  app.post('/api/verify-access', (req, res) => {
    const { email, clientId, requestedModuleCode } = req.body || {};

    let client = clientsDb.find((c) => c.id === clientId || c.email === email);
    let user = usersDb.find((u) => u.email === email || (clientId && u.clientId === clientId));

    if (!client && user) {
      client = clientsDb.find((c) => c.id === user?.clientId);
    }

    if (!client) {
      const deniedResponse: AccessCheckResult = {
        allowed: false,
        code: 'SUSPENDED_CLIENT',
        title: 'CLIENTE NO ENCONTRADO O INHABILITADO',
        message: 'No se encontró una organización activa registrada con las credenciales proporcionadas.',
      };
      return res.status(403).json(deniedResponse);
    }

    // Check Client status
    if (client.status === 'Suspendido') {
      const response: AccessCheckResult = {
        allowed: false,
        code: 'SUSPENDED_CLIENT',
        title: 'CUENTA SUSPENDIDA',
        message: `El acceso para ${client.organizationName} ha sido suspendido temporalmente por el Administrador Central.`,
        clientInfo: {
          name: client.organizationName,
          status: client.status,
          plan: client.planName,
        },
      };
      return res.status(403).json(response);
    }

    // Find active license
    const license = licensesDb.find((l) => l.clientId === client?.id);

    if (!license) {
      const response: AccessCheckResult = {
        allowed: false,
        code: 'EXPIRED_LICENSE',
        title: 'SIN LICENCIA ASIGNADA',
        message: `La organización ${client.organizationName} no cuenta con una licencia activa registrada.`,
        clientInfo: {
          name: client.organizationName,
          status: client.status,
          plan: client.planName,
        },
      };
      return res.status(403).json(response);
    }

    if (license.status === 'Vencida' || license.status === 'Suspendida') {
      const response: AccessCheckResult = {
        allowed: false,
        code: 'EXPIRED_LICENSE',
        title: 'ACCESO DENEGADO - LICENCIA VENCIDA',
        message: `La licencia ${license.id} de ${client.organizationName} expiró el ${license.expiresAt}. Por favor contacta al proveedor para renovar.`,
        clientInfo: {
          name: client.organizationName,
          status: client.status,
          plan: client.planName,
        },
        licenseInfo: {
          id: license.id,
          expiresAt: license.expiresAt,
          type: license.licenseType,
          status: license.status,
        },
      };
      return res.status(403).json(response);
    }

    // Check module permission if requested
    if (requestedModuleCode && !license.enabledModuleCodes.includes(requestedModuleCode)) {
      const mod = modulesDb.find((m) => m.code === requestedModuleCode);
      const response: AccessCheckResult = {
        allowed: false,
        code: 'MODULE_DISABLED',
        title: 'MÓDULO NO INCLUIDO EN TU PLAN',
        message: `El módulo "${mod ? mod.name : requestedModuleCode}" no está habilitado en tu licencia actual (${license.planName}).`,
        clientInfo: {
          name: client.organizationName,
          status: client.status,
          plan: client.planName,
        },
        licenseInfo: {
          id: license.id,
          expiresAt: license.expiresAt,
          type: license.licenseType,
          status: license.status,
        },
        enabledModules: license.enabledModuleCodes,
      };
      return res.status(403).json(response);
    }

    // Access granted
    const allowedResponse: AccessCheckResult = {
      allowed: true,
      code: 'OK',
      title: 'ACCESO AUTORIZADO',
      message: 'Licencia válida y cliente activo en Campaña Ganadora AI.',
      clientInfo: {
        name: client.organizationName,
        status: client.status,
        plan: client.planName,
      },
      licenseInfo: {
        id: license.id,
        expiresAt: license.expiresAt,
        type: license.licenseType,
        status: license.status,
      },
      enabledModules: license.enabledModuleCodes,
      redirectUrl: 'https://softwarecompletoelectoral.netlify.app/',
    };

    return res.json(allowedResponse);
  });

  // ==========================================
  // METRICS & DASHBOARD STATS API
  // ==========================================
  app.get('/api/stats', (req, res) => {
    const totalClients = clientsDb.length;
    const activeClients = clientsDb.filter((c) => c.status === 'Activo').length;
    const suspendedClients = clientsDb.filter((c) => c.status === 'Suspendido').length;

    const activeLicenses = licensesDb.filter((l) => l.status === 'Activa').length;
    const expiringLicenses = licensesDb.filter((l) => l.status === 'Próxima a vencer').length;
    const expiredLicenses = licensesDb.filter((l) => l.status === 'Vencida').length;

    const activeSubscriptions = subscriptionsDb.filter((s) => s.status === 'Activa').length;
    const totalUsers = usersDb.length;
    const activeUsers = usersDb.filter((u) => u.status === 'Activo').length;

    const totalRevenue = invoicesDb
      .filter((i) => i.status === 'Pagada')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    res.json({
      totalClients,
      activeClients,
      suspendedClients,
      activeLicenses,
      expiringLicenses,
      expiredLicenses,
      activeSubscriptions,
      totalUsers,
      activeUsers,
      totalRevenue,
    });
  });

  // CLIENTS API
  app.get('/api/clients', (req, res) => res.json(clientsDb));
  app.post('/api/clients', (req, res) => {
    const newClient: Client = {
      ...req.body,
      id: `CLI-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().split('T')[0],
      activeUsersCount: req.body.activeUsersCount || 1,
      activeCampaignsCount: req.body.activeCampaignsCount || 1,
    };
    clientsDb.unshift(newClient);

    // Auto log audit
    auditLogsDb.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: 'usr-admin-master',
      userName: 'Super Admin CG',
      userEmail: 'admin@campanaganadora.ai',
      clientId: newClient.id,
      clientName: newClient.organizationName,
      action: 'Cliente Creado',
      category: 'Cliente',
      details: `Creó nuevo cliente ${newClient.organizationName} con el plan ${newClient.planName}.`,
      ipAddress: '190.158.204.12',
      result: 'Éxito',
    });

    res.status(201).json(newClient);
  });

  app.put('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    const index = clientsDb.findIndex((c) => c.id === id);
    if (index !== -1) {
      clientsDb[index] = { ...clientsDb[index], ...req.body };
      return res.json(clientsDb[index]);
    }
    res.status(404).json({ error: 'Cliente no encontrado' });
  });

  // LICENSES API
  app.get('/api/licenses', (req, res) => res.json(licensesDb));
  app.put('/api/licenses/:id', (req, res) => {
    const { id } = req.params;
    const index = licensesDb.findIndex((l) => l.id === id);
    if (index !== -1) {
      licensesDb[index] = { ...licensesDb[index], ...req.body };
      return res.json(licensesDb[index]);
    }
    res.status(404).json({ error: 'Licencia no encontrada' });
  });

  // USERS API
  app.get('/api/users', (req, res) => res.json(usersDb));
  app.post('/api/users', (req, res) => {
    const newUser: User = {
      ...req.body,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastAccessAt: 'Nunca',
      status: req.body.status || 'Pendiente Invitación',
    };
    usersDb.unshift(newUser);
    res.status(201).json(newUser);
  });

  // MODULES API
  app.get('/api/modules', (req, res) => res.json(modulesDb));

  // PLANS API
  app.get('/api/plans', (req, res) => res.json(plansDb));

  // AUDIT LOGS API
  app.get('/api/audit-logs', (req, res) => res.json(auditLogsDb));

  // INVOICES API
  app.get('/api/invoices', (req, res) => res.json(invoicesDb));

  // SESSIONS API
  app.get('/api/sessions', (req, res) => res.json(sessionsDb));
  app.delete('/api/sessions/:id', (req, res) => {
    const { id } = req.params;
    sessionsDb = sessionsDb.filter((s) => s.id !== id);
    res.json({ success: true, message: 'Sesión terminada exitosamente' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
