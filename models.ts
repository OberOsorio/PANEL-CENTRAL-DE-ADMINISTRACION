import mongoose from 'mongoose';
import crypto from 'crypto';
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

// Connection function
export async function connectDB(uri: string) {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Native SHA-256 Hashing helper
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Client Schema
const ClientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  organizationName: { type: String, required: true },
  responsibleName: { type: String, required: true },
  taxId: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  department: { type: String, required: true },
  city: { type: String, required: true },
  createdAt: { type: String, required: true },
  status: { type: String, required: true },
  planId: { type: String, required: true },
  planName: { type: String, required: true },
  activeUsersCount: { type: Number, default: 0 },
  maxUsersAllowed: { type: Number, default: 0 },
  activeCampaignsCount: { type: Number, default: 0 },
  notes: { type: String },
  logoUrl: { type: String },
  aspiration: { type: String }
});

// License Schema
const LicenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  planId: { type: String, required: true },
  planName: { type: String, required: true },
  createdAt: { type: String, required: true },
  activatedAt: { type: String, required: true },
  expiresAt: { type: String, required: true },
  status: { type: String, required: true },
  licenseType: { type: String, required: true },
  maxUsers: { type: Number, default: 0 },
  usedUsers: { type: Number, default: 0 },
  maxCampaigns: { type: Number, default: 0 },
  usedCampaigns: { type: Number, default: 0 },
  maxStorageGB: { type: Number, default: 0 },
  enabledModuleCodes: { type: [String], default: [] },
  licenseKey: { type: String, required: true },
  autoRenew: { type: Boolean, default: false }
});

// Subscription Schema
const SubscriptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  planId: { type: String, required: true },
  planName: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, required: true },
  periodicity: { type: String, required: true },
  startDate: { type: String, required: true },
  nextBillingDate: { type: String, required: true },
  expirationDate: { type: String, required: true },
  status: { type: String, required: true },
  paymentMethod: { type: String }
});

// User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  campaignId: { type: String },
  campaignName: { type: String },
  roleId: { type: String, required: true },
  roleName: { type: String, required: true },
  status: { type: String, required: true },
  lastAccessAt: { type: String, required: true },
  createdAt: { type: String, required: true },
  ipAddress: { type: String },
  avatarUrl: { type: String }
});

// Campaign Schema
const CampaignSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  name: { type: String, required: true },
  candidateName: { type: String, required: true },
  electionType: { type: String, required: true },
  territory: { type: String, required: true },
  startDate: { type: String, required: true },
  electionDate: { type: String, required: true },
  status: { type: String, required: true },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  logoUrl: { type: String }
});

// Invoice Schema
const InvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  planName: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  currency: { type: String, required: true },
  issueDate: { type: String, required: true },
  dueDate: { type: String, required: true },
  paidAt: { type: String },
  status: { type: String, required: true }
});

// AuditLog Schema
const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  clientId: { type: String },
  clientName: { type: String },
  action: { type: String, required: true },
  category: { type: String, required: true },
  details: { type: String, required: true },
  ipAddress: { type: String },
  result: { type: String, required: true }
});

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  timestamp: { type: String, required: true },
  read: { type: Boolean, default: false },
  clientId: { type: String }
});

// Plan Schema
const PlanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  monthlyPrice: { type: Number, required: true },
  annualPrice: { type: Number, required: true },
  maxUsers: { type: Number, required: true },
  maxCampaigns: { type: Number, required: true },
  maxStorageGB: { type: Number, required: true },
  allowedModuleCodes: { type: [String], default: [] },
  supportLevel: { type: String, required: true },
  hasAiFeatures: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  features: { type: [String], default: [] }
});

// Module Schema
const ModuleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  icon: { type: String, required: true },
  isRequiredForBasic: { type: Boolean, default: false },
  defaultEnabled: { type: Boolean, default: false }
});

// Role Schema
const RoleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  isSystemRole: { type: Boolean, default: false },
  permissionCodes: { type: [String], default: [] }
});

// Session Schema
const SessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  clientName: { type: String, required: true },
  roleName: { type: String, required: true },
  loginAt: { type: String, required: true },
  lastActiveAt: { type: String, required: true },
  ipAddress: { type: String, required: true },
  device: { type: String, required: true },
  browser: { type: String, required: true }
});

export const ClientModel = mongoose.model('Client', ClientSchema);
export const LicenseModel = mongoose.model('License', LicenseSchema);
export const SubscriptionModel = mongoose.model('Subscription', SubscriptionSchema);
export const UserModel = mongoose.model('User', UserSchema);
export const CampaignModel = mongoose.model('Campaign', CampaignSchema);
export const InvoiceModel = mongoose.model('Invoice', InvoiceSchema);
export const AuditLogModel = mongoose.model('AuditLog', AuditLogSchema);
export const NotificationModel = mongoose.model('Notification', NotificationSchema);
export const PlanModel = mongoose.model('Plan', PlanSchema);
export const ModuleModel = mongoose.model('Module', ModuleSchema);
export const RoleModel = mongoose.model('Role', RoleSchema);
export const SessionModel = mongoose.model('Session', SessionSchema);

// Database Seeder
export async function seedDatabase() {
  try {
    const clientCount = await ClientModel.countDocuments();
    if (clientCount === 0) {
      console.log('🌱 Database is empty. Seeding initial data from initialData.ts...');
      
      // Seed clients
      await ClientModel.insertMany(INITIAL_CLIENTS);
      
      // Seed licenses
      const mappedLicenses = INITIAL_LICENSES.map((l: any) => ({
        ...l,
        enabledModuleCodes: l.enabledModuleCodes || []
      }));
      await LicenseModel.insertMany(mappedLicenses);
      
      // Seed subscriptions
      await SubscriptionModel.insertMany(INITIAL_SUBSCRIPTIONS);
      
      // Seed users (with hashed default password "password")
      const hashedDefaultPassword = hashPassword('password');
      const mappedUsers = INITIAL_USERS.map((u: any) => ({
        ...u,
        password: hashedDefaultPassword
      }));
      await UserModel.insertMany(mappedUsers);
      
      // Seed campaigns
      const mappedCampaigns = INITIAL_CAMPAIGNS.map((c: any) => ({
        id: c.id,
        clientId: c.clientId,
        clientName: c.clientName,
        name: c.name,
        candidateName: c.candidateName,
        electionType: c.electionType,
        territory: c.territory,
        startDate: c.startDate,
        electionDate: c.electionDate,
        status: c.status,
        budget: c.budget || 0,
        spent: c.spent || 0,
        logoUrl: c.logoUrl
      }));
      await CampaignModel.insertMany(mappedCampaigns);
      
      // Seed invoices
      const mappedInvoices = INITIAL_INVOICES.map((i: any) => ({
        id: i.id,
        clientId: i.clientId,
        clientName: i.clientName,
        invoiceNumber: i.id,
        planName: i.planName,
        totalAmount: i.totalAmount,
        currency: i.currency || 'USD',
        issueDate: i.issueDate,
        dueDate: i.dueDate,
        paidAt: i.paidAt,
        status: i.status
      }));
      await InvoiceModel.insertMany(mappedInvoices);
      
      // Seed audit logs
      await AuditLogModel.insertMany(INITIAL_AUDIT_LOGS);
      
      // Seed notifications
      await NotificationModel.insertMany(INITIAL_NOTIFICATIONS);
      
      // Seed plans
      await PlanModel.insertMany(INITIAL_PLANS);
      
      // Seed modules
      await ModuleModel.insertMany(INITIAL_MODULES);
      
      // Seed roles
      await RoleModel.insertMany(INITIAL_ROLES);
      
      console.log('🌱 MongoDB seeding completed successfully!');
    } else {
      console.log('📂 MongoDB database already contains data. Skipping seeding.');
    }
  } catch (error) {
    console.error('❌ Error seeding MongoDB:', error);
  }
}
