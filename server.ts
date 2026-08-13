import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Import Mongoose models and connection
import {
  connectDB,
  seedDatabase,
  hashPassword,
  ClientModel,
  LicenseModel,
  SubscriptionModel,
  UserModel,
  CampaignModel,
  InvoiceModel,
  AuditLogModel,
  NotificationModel,
  PlanModel,
  ModuleModel,
  RoleModel,
  SessionModel,
} from './models.js';

import { AccessCheckResult } from './src/types.js';
import {
  INITIAL_CLIENTS,
  INITIAL_LICENSES,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_USERS,
  INITIAL_PLANS,
  INITIAL_MODULES,
  INITIAL_ROLES,
  INITIAL_CAMPAIGNS,
  INITIAL_INVOICES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from './src/data/initialData.js';

dotenv.config();

// Helper to parse cookies from requests
const parseCookies = (req: any) => {
  const list: any = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie: string) => {
    let [name, ...rest] = cookie.split('=');
    name = name.trim();
    if (!name) return;
    const val = rest.join('=').trim();
    list[name] = decodeURIComponent(val);
  });
  return list;
};

// Helper to map route collection names to Mongoose models
function getModelByCollectionName(name: string): any {
  switch (name) {
    case 'clients': return ClientModel;
    case 'licenses': return LicenseModel;
    case 'subscriptions': return SubscriptionModel;
    case 'users':
    case 'users_list': return UserModel;
    case 'campaigns': return CampaignModel;
    case 'invoices': return InvoiceModel;
    case 'audit_logs': return AuditLogModel;
    case 'notifications': return NotificationModel;
    case 'plans': return PlanModel;
    case 'modules': return ModuleModel;
    case 'roles': return RoleModel;
    case 'sessions': return SessionModel;
    default: throw new Error(`Unknown collection: ${name}`);
  }
}

async function startServer() {
  let isConnected = false;
  const memoryDb: any = {
    clients: [...INITIAL_CLIENTS],
    licenses: [...INITIAL_LICENSES],
    subscriptions: [...INITIAL_SUBSCRIPTIONS],
    users: [...INITIAL_USERS],
    campaigns: [...INITIAL_CAMPAIGNS],
    invoices: [...INITIAL_INVOICES],
    audit_logs: [...INITIAL_AUDIT_LOGS],
    notifications: [...INITIAL_NOTIFICATIONS],
    plans: [...INITIAL_PLANS],
    modules: [...INITIAL_MODULES],
    roles: [...INITIAL_ROLES],
    sessions: [],
  };

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campana_ganadora';
  if (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
    console.warn('⚠️ WARNING: Connecting to local MongoDB. Ensure the MONGODB_URI environment variable is set on the Render dashboard for production.');
  } else {
    console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`); // Hide credentials in log
  }
  isConnected = await connectDB(mongoUri);
  if (isConnected) {
    await seedDatabase();
  } else {
    console.warn('⚠️ WARNING: Skipping database seeding because MongoDB connection failed. Database operations will use in-memory fallback.');
  }

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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
  app.get('/api/health', async (req, res) => {
    try {
      const activeTenants = isConnected
        ? await ClientModel.countDocuments({ status: 'Activo' })
        : (memoryDb.clients || []).filter((x: any) => x.status === 'Activo').length;
      res.json({
        status: 'ok',
        service: 'Campaña Ganadora AI - Panel Central API (MongoDB)',
        timestamp: new Date().toISOString(),
        activeTenants,
        databaseConnected: isConnected,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // CUSTOM AUTHENTICATION API
  // ==========================================

  // Register Super Admin
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || 'Admin';
      const lastName = nameParts.slice(1).join(' ') || 'CG';
      const newUserId = `usr-${Date.now()}`;

      if (isConnected) {
        const existingUser = await UserModel.findOne({ email }).lean();
        if (existingUser) {
          return res.status(400).json({ error: 'El usuario ya existe' });
        }
        
        const user = await UserModel.create({
          id: newUserId,
          firstName,
          lastName,
          email,
          password: hashPassword(password),
          clientId: 'CLI-GLOBAL',
          clientName: 'Administración Central',
          roleId: 'role-super-admin',
          roleName: 'Super Admin',
          status: 'Activo',
          lastAccessAt: new Date().toISOString(),
          createdAt: new Date().toISOString().split('T')[0]
        }) as any;
        
        res.setHeader('Set-Cookie', `session_token=${user.id}; Path=/; HttpOnly; SameSite=Lax`);
        return res.status(201).json({
          user: {
            id: user.id,
            email: user.email,
            user_metadata: { name: `${user.firstName} ${user.lastName}` },
            role: 'Super Admin'
          }
        });
      } else {
        const existingUser = (memoryDb.users || []).find((x: any) => x.email === email);
        if (existingUser) {
          return res.status(400).json({ error: 'El usuario ya existe' });
        }
        const user = {
          id: newUserId,
          firstName,
          lastName,
          email,
          password: hashPassword(password),
          clientId: 'CLI-GLOBAL',
          clientName: 'Administración Central',
          roleId: 'role-super-admin',
          roleName: 'Super Admin',
          status: 'Activo',
          lastAccessAt: new Date().toISOString(),
          createdAt: new Date().toISOString().split('T')[0]
        };
        memoryDb.users.push(user);
        res.setHeader('Set-Cookie', `session_token=${user.id}; Path=/; HttpOnly; SameSite=Lax`);
        return res.status(201).json({
          user: {
            id: user.id,
            email: user.email,
            user_metadata: { name: `${user.firstName} ${user.lastName}` },
            role: 'Super Admin'
          }
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, isOAuth } = req.body;
      let user: any;
      
      if (isConnected) {
        user = await UserModel.findOne({ email }).lean();
        if (isOAuth) {
          if (!user) {
            user = await UserModel.create({
              id: 'usr-admin-master',
              firstName: 'Super',
              lastName: 'Admin CG',
              email: email || 'admin@campanaganadora.ai',
              password: hashPassword('password'),
              clientId: 'CLI-GLOBAL',
              clientName: 'Administración Central',
              roleId: 'role-super-admin',
              roleName: 'Super Admin',
              status: 'Activo',
              lastAccessAt: new Date().toISOString(),
              createdAt: new Date().toISOString().split('T')[0]
            }) as any;
          }
        } else {
          if (!user) {
            return res.status(401).json({ error: 'Credenciales incorrectas. El correo no está registrado.' });
          }
          if (user.password !== hashPassword(password)) {
            return res.status(401).json({ error: 'Credenciales incorrectas. Contraseña inválida.' });
          }
        }
      } else {
        user = (memoryDb.users || []).find((x: any) => x.email === email);
        if (isOAuth) {
          if (!user) {
            user = {
              id: 'usr-admin-master',
              firstName: 'Super',
              lastName: 'Admin CG',
              email: email || 'admin@campanaganadora.ai',
              password: hashPassword('password'),
              clientId: 'CLI-GLOBAL',
              clientName: 'Administración Central',
              roleId: 'role-super-admin',
              roleName: 'Super Admin',
              status: 'Activo',
              lastAccessAt: new Date().toISOString(),
              createdAt: new Date().toISOString().split('T')[0]
            };
            memoryDb.users.push(user);
          }
        } else {
          if (!user) {
            return res.status(401).json({ error: 'Credenciales incorrectas. El correo no está registrado.' });
          }
          if (user.password !== hashPassword(password)) {
            return res.status(401).json({ error: 'Credenciales incorrectas. Contraseña inválida.' });
          }
        }
      }
      
      res.setHeader('Set-Cookie', `session_token=${user.id}; Path=/; HttpOnly; SameSite=Lax`);
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { name: `${user.firstName} ${user.lastName}` },
          role: user.roleName || 'Super Admin'
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Me
  app.get('/api/auth/me', async (req, res) => {
    try {
      const cookies = parseCookies(req);
      const token = cookies.session_token;
      if (!token) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      
      let user: any;
      if (isConnected) {
        user = await UserModel.findOne({ id: token }).lean();
      } else {
        user = (memoryDb.users || []).find((x: any) => x.id === token);
      }

      if (!user) {
        return res.status(401).json({ error: 'Sesión inválida' });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        user_metadata: { name: `${user.firstName} ${user.lastName}` },
        role: user.roleName || 'Super Admin'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'session_token=; Path=/; HttpOnly; Max-Age=0');
    res.json({ success: true });
  });

  // ==========================================
  // ELECTORAL SOFTWARE LICENSE & ACCESS VERIFICATION GATEWAY
  // ==========================================
  app.post('/api/verify-access', async (req, res) => {
    try {
      const { email, clientId, requestedModuleCode } = req.body || {};
      let client: any;
      let user: any;

      if (isConnected) {
        client = await ClientModel.findOne({ $or: [{ id: clientId }, { email }] }).lean();
        user = await UserModel.findOne({ $or: [{ email }, { clientId, email }] }).lean();
        if (!client && user) {
          client = await ClientModel.findOne({ id: user.clientId }).lean() as any;
        }
      } else {
        client = (memoryDb.clients || []).find((x: any) => x.id === clientId || x.email === email);
        user = (memoryDb.users || []).find((x: any) => x.email === email || (x.clientId === clientId && x.email === email));
        if (!client && user) {
          client = (memoryDb.clients || []).find((x: any) => x.id === user.clientId);
        }
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
      let license: any;
      if (isConnected) {
        license = await LicenseModel.findOne({ clientId: client.id }).lean();
      } else {
        license = (memoryDb.licenses || []).find((x: any) => x.clientId === client.id);
      }

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
        let mod: any;
        if (isConnected) {
          mod = await ModuleModel.findOne({ code: requestedModuleCode }).lean() as any;
        } else {
          mod = (memoryDb.modules || []).find((x: any) => x.code === requestedModuleCode);
        }
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
        redirectUrl: 'https://fusionsoftware.netlify.app/',
      };

      return res.json(allowedResponse);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // METRICS & DASHBOARD STATS API
  // ==========================================
  app.get('/api/stats', async (req, res) => {
    try {
      let totalClients, activeClients, suspendedClients;
      let activeLicenses, expiringLicenses, expiredLicenses;
      let activeSubscriptions, totalUsers, activeUsers;
      let paidInvoices: any[];

      if (isConnected) {
        totalClients = await ClientModel.countDocuments();
        activeClients = await ClientModel.countDocuments({ status: 'Activo' });
        suspendedClients = await ClientModel.countDocuments({ status: 'Suspendido' });
        activeLicenses = await LicenseModel.countDocuments({ status: 'Activa' });
        expiringLicenses = await LicenseModel.countDocuments({ status: 'Próxima a vencer' });
        expiredLicenses = await LicenseModel.countDocuments({ status: 'Vencida' });
        activeSubscriptions = await SubscriptionModel.countDocuments({ status: 'Activa' });
        totalUsers = await UserModel.countDocuments();
        activeUsers = await UserModel.countDocuments({ status: 'Activo' });
        paidInvoices = await InvoiceModel.find({ status: 'Pagada' }).lean() as any[];
      } else {
        totalClients = memoryDb.clients.length;
        activeClients = memoryDb.clients.filter((x: any) => x.status === 'Activo').length;
        suspendedClients = memoryDb.clients.filter((x: any) => x.status === 'Suspendido').length;
        activeLicenses = memoryDb.licenses.filter((x: any) => x.status === 'Activa').length;
        expiringLicenses = memoryDb.licenses.filter((x: any) => x.status === 'Próxima a vencer').length;
        expiredLicenses = memoryDb.licenses.filter((x: any) => x.status === 'Vencida').length;
        activeSubscriptions = memoryDb.subscriptions.filter((x: any) => x.status === 'Activa').length;
        totalUsers = memoryDb.users.length;
        activeUsers = memoryDb.users.filter((x: any) => x.status === 'Activo').length;
        paidInvoices = memoryDb.invoices.filter((x: any) => x.status === 'Pagada');
      }

      const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // SIMULATED RPC GATEWAY
  // ==========================================
  app.post('/api/rpc/create_client_auth_user', async (req, res) => {
    try {
      const { p_email, p_password, p_first_name, p_last_name, p_client_id } = req.body;
      
      if (isConnected) {
        let user: any = await UserModel.findOne({ email: p_email }).lean();
        if (user) {
          return res.json(user.id);
        }
        
        const newUserId = `usr-${Date.now()}`;
        const newUser: any = await UserModel.create({
          id: newUserId,
          firstName: p_first_name,
          lastName: p_last_name,
          email: p_email,
          password: hashPassword(p_password || 'password'),
          clientId: p_client_id,
          clientName: 'Organización Creada',
          roleId: 'role-client-admin',
          roleName: 'Administrador de Campaña',
          status: 'Activo',
          lastAccessAt: 'Nunca',
          createdAt: new Date().toISOString().split('T')[0]
        });
        
        return res.json(newUser.id);
      } else {
        let user = (memoryDb.users || []).find((x: any) => x.email === p_email);
        if (user) {
          return res.json(user.id);
        }
        
        const newUserId = `usr-${Date.now()}`;
        const newUser = {
          id: newUserId,
          firstName: p_first_name,
          lastName: p_last_name,
          email: p_email,
          password: hashPassword(p_password || 'password'),
          clientId: p_client_id,
          clientName: 'Organización Creada',
          roleId: 'role-client-admin',
          roleName: 'Administrador de Campaña',
          status: 'Activo',
          lastAccessAt: 'Nunca',
          createdAt: new Date().toISOString().split('T')[0]
        };
        memoryDb.users.push(newUser);
        return res.json(newUser.id);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // GENERIC REST CRUD API FOR ALL COLLECTIONS
  // ==========================================

  // Query and list documents
  app.get('/api/:collection', async (req, res) => {
    try {
      const { collection } = req.params;
      const endpoint = collection === 'users_list' ? 'users' : collection;

      if (isConnected) {
        const model = getModelByCollectionName(collection);
        const sortQuery = collection === 'audit_logs' ? { timestamp: -1 } : {};
        const data = await model.find({}).sort(sortQuery as any).lean();
        return res.json(data);
      } else {
        let data = memoryDb[endpoint] || [];
        if (collection === 'audit_logs') {
          data = [...data].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        return res.json(data);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Insert document(s)
  app.post('/api/:collection', async (req, res) => {
    try {
      const { collection } = req.params;
      const body = req.body;
      const endpoint = collection === 'users_list' ? 'users' : collection;

      if (!body.id && !Array.isArray(body)) {
        if (collection === 'clients') {
          body.id = `CLI-2026-${Math.floor(100 + Math.random() * 900)}`;
        } else {
          body.id = `obj-${Date.now()}`;
        }
      }
      if (!Array.isArray(body) && !body.createdAt && !body.created_at) {
        body.createdAt = new Date().toISOString().split('T')[0];
      }

      if (isConnected) {
        const model = getModelByCollectionName(collection);
        let data;
        if (!Array.isArray(body)) {
          data = await model.create(body);
          if (collection === 'clients') {
            await AuditLogModel.create({
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              userId: 'usr-admin-master',
              userName: 'Super Admin CG',
              userEmail: 'admin@campanaganadora.ai',
              clientId: body.id,
              clientName: body.organizationName,
              action: 'Cliente Creado',
              category: 'Cliente',
              details: `Creó nuevo cliente ${body.organizationName} con el plan ${body.planName || 'Básico'}.`,
              ipAddress: '190.158.204.12',
              result: 'Éxito',
            });
          }
        } else {
          data = await model.insertMany(body);
        }
        return res.status(201).json(data);
      } else {
        if (!memoryDb[endpoint]) memoryDb[endpoint] = [];
        if (!Array.isArray(body)) {
          memoryDb[endpoint].push(body);
          if (collection === 'clients') {
            memoryDb.audit_logs.push({
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              userId: 'usr-admin-master',
              userName: 'Super Admin CG',
              userEmail: 'admin@campanaganadora.ai',
              clientId: body.id,
              clientName: body.organizationName,
              action: 'Cliente Creado',
              category: 'Cliente',
              details: `Creó nuevo cliente ${body.organizationName} con el plan ${body.planName || 'Básico'}.`,
              ipAddress: '190.158.204.12',
              result: 'Éxito',
            });
          }
        } else {
          memoryDb[endpoint].push(...body);
        }
        return res.status(201).json(body);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk update or query-based update
  app.put('/api/:collection', async (req, res) => {
    try {
      const { collection } = req.params;
      const { field, value } = req.query;
      const endpoint = collection === 'users_list' ? 'users' : collection;

      if (field && value) {
        if (isConnected) {
          const model = getModelByCollectionName(collection);
          const result = await model.updateMany({ [field as string]: value }, req.body);
          return res.json({ success: true, count: result.modifiedCount });
        } else {
          const items = memoryDb[endpoint] || [];
          let count = 0;
          items.forEach((item: any) => {
            if (String(item[field as string]) === String(value)) {
              Object.assign(item, req.body);
              count++;
            }
          });
          return res.json({ success: true, count });
        }
      }
      return res.status(400).json({ error: 'Missing field or value for bulk update' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update specific document by 'id'
  app.put('/api/:collection/:id', async (req, res) => {
    try {
      const { collection, id } = req.params;
      const endpoint = collection === 'users_list' ? 'users' : collection;

      if (isConnected) {
        const model = getModelByCollectionName(collection);
        const data = await model.findOneAndUpdate({ id }, req.body, { new: true }).lean();
        if (!data) return res.status(404).json({ error: 'Document not found' });
        return res.json(data);
      } else {
        const items = memoryDb[endpoint] || [];
        const index = items.findIndex((x: any) => x.id === id);
        if (index === -1) return res.status(404).json({ error: 'Document not found' });
        items[index] = { ...items[index], ...req.body };
        return res.json(items[index]);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk delete or query-based delete
  app.delete('/api/:collection', async (req, res) => {
    try {
      const { collection } = req.params;
      const { field, value } = req.query;
      const endpoint = collection === 'users_list' ? 'users' : collection;

      if (field && value) {
        if (isConnected) {
          const model = getModelByCollectionName(collection);
          const result = await model.deleteMany({ [field as string]: value });
          return res.json({ success: true, count: result.deletedCount });
        } else {
          const items = memoryDb[endpoint] || [];
          const initialLength = items.length;
          memoryDb[endpoint] = items.filter((item: any) => String(item[field as string]) !== String(value));
          return res.json({ success: true, count: initialLength - memoryDb[endpoint].length });
        }
      }
      return res.status(400).json({ error: 'Missing field or value for bulk delete' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete specific document by 'id'
  app.delete('/api/:collection/:id', async (req, res) => {
    try {
      const { collection, id } = req.params;
      const endpoint = collection === 'users_list' ? 'users' : collection;

      if (isConnected) {
        const model = getModelByCollectionName(collection);
        const result = await model.deleteOne({ id });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Document not found' });
        return res.json({ success: true });
      } else {
        const items = memoryDb[endpoint] || [];
        const index = items.findIndex((x: any) => x.id === id);
        if (index === -1) return res.status(404).json({ error: 'Document not found' });
        items.splice(index, 1);
        return res.json({ success: true });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
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
