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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campana_ganadora';
  console.log(`Connecting to MongoDB at: ${mongoUri}`);
  await connectDB(mongoUri);
  await seedDatabase();

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
  app.get('/api/health', async (req, res) => {
    try {
      const activeTenants = await ClientModel.countDocuments({ status: 'Activo' });
      res.json({
        status: 'ok',
        service: 'Campaña Ganadora AI - Panel Central API (MongoDB)',
        timestamp: new Date().toISOString(),
        activeTenants,
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
      const existingUser = await UserModel.findOne({ email }).lean();
      if (existingUser) {
        return res.status(400).json({ error: 'El usuario ya existe' });
      }
      
      const newUserId = `usr-${Date.now()}`;
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || 'Admin';
      const lastName = nameParts.slice(1).join(' ') || 'CG';
      
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
      
      // Auto-set cookie
      res.setHeader('Set-Cookie', `session_token=${user.id}; Path=/; HttpOnly; SameSite=Lax`);
      
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { name: `${user.firstName} ${user.lastName}` },
          role: 'Super Admin'
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, isOAuth } = req.body;
      
      let user: any = await UserModel.findOne({ email }).lean();
      
      // For testing/OAuth, auto-create or find the admin user
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
      
      // Set session cookie
      res.setHeader('Set-Cookie', `session_token=${user.id}; Path=/; HttpOnly; SameSite=Lax`);
      
      res.json({
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
      
      const user: any = await UserModel.findOne({ id: token }).lean();
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

      let client: any = await ClientModel.findOne({ $or: [{ id: clientId }, { email }] }).lean();
      let user: any = await UserModel.findOne({ $or: [{ email }, { clientId, email }] }).lean();

      if (!client && user) {
        client = await ClientModel.findOne({ id: user.clientId }).lean() as any;
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
      const license: any = await LicenseModel.findOne({ clientId: client.id }).lean();

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
        const mod = await ModuleModel.findOne({ code: requestedModuleCode }).lean() as any;
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
        redirectUrl: 'http://localhost:3001/',
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
      const totalClients = await ClientModel.countDocuments();
      const activeClients = await ClientModel.countDocuments({ status: 'Activo' });
      const suspendedClients = await ClientModel.countDocuments({ status: 'Suspendido' });

      const activeLicenses = await LicenseModel.countDocuments({ status: 'Activa' });
      const expiringLicenses = await LicenseModel.countDocuments({ status: 'Próxima a vencer' });
      const expiredLicenses = await LicenseModel.countDocuments({ status: 'Vencida' });

      const activeSubscriptions = await SubscriptionModel.countDocuments({ status: 'Activa' });
      const totalUsers = await UserModel.countDocuments();
      const activeUsers = await UserModel.countDocuments({ status: 'Activo' });

      const paidInvoices = await InvoiceModel.find({ status: 'Pagada' }).lean() as any[];
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
      
      // Check if user already exists
      let user: any = await UserModel.findOne({ email: p_email }).lean();
      if (user) {
        return res.json(user.id);
      }
      
      // Create user
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
      
      res.json(newUser.id);
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
      const model = getModelByCollectionName(collection);
      
      // Sort audit logs by timestamp descending
      const sortQuery = collection === 'audit_logs' ? { timestamp: -1 } : {};
      const data = await model.find({}).sort(sortQuery as any).lean();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Insert document(s)
  app.post('/api/:collection', async (req, res) => {
    try {
      const { collection } = req.params;
      const model = getModelByCollectionName(collection);
      
      const body = req.body;
      let data;
      
      // Create appropriate id if missing and it's single object insert
      if (!Array.isArray(body)) {
        if (!body.id) {
          if (collection === 'clients') {
            body.id = `CLI-2026-${Math.floor(100 + Math.random() * 900)}`;
          } else {
            body.id = `obj-${Date.now()}`;
          }
        }
        if (!body.createdAt && !body.created_at) {
          body.createdAt = new Date().toISOString().split('T')[0];
        }
        data = await model.create(body);
        
        // Custom logging trigger for Client Creation (mimic original server.ts)
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
        // Bulk insert mapping (InsForge takes arrays)
        data = await model.insertMany(body);
      }
      
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk update or query-based update
  app.put('/api/:collection', async (req, res) => {
    try {
      const { collection } = req.params;
      const { field, value } = req.query;
      const model = getModelByCollectionName(collection);
      
      if (field && value) {
        const result = await model.updateMany({ [field as string]: value }, req.body);
        return res.json({ success: true, count: result.modifiedCount });
      }
      
      res.status(400).json({ error: 'Missing field or value for bulk update' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update specific document by 'id'
  app.put('/api/:collection/:id', async (req, res) => {
    try {
      const { collection, id } = req.params;
      const model = getModelByCollectionName(collection);
      const data = await model.findOneAndUpdate({ id }, req.body, { new: true }).lean();
      if (!data) return res.status(404).json({ error: 'Document not found' });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk delete or query-based delete
  app.delete('/api/:collection', async (req, res) => {
    try {
      const { collection } = req.params;
      const { field, value } = req.query;
      const model = getModelByCollectionName(collection);
      
      if (field && value) {
        const result = await model.deleteMany({ [field as string]: value });
        return res.json({ success: true, count: result.deletedCount });
      }
      res.status(400).json({ error: 'Missing field or value for bulk delete' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete specific document by 'id'
  app.delete('/api/:collection/:id', async (req, res) => {
    try {
      const { collection, id } = req.params;
      const model = getModelByCollectionName(collection);
      const result = await model.deleteOne({ id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Document not found' });
      res.json({ success: true });
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
