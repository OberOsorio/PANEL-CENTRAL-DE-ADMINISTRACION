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

export async function connectDB(uri: string): Promise<boolean> {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB successfully.');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Client Schema
const ClientSchema = new mongoose.Schema({
  id: { type: String, required: true },
  organizationName: { type: String },
  organization_name: { type: String },
  responsibleName: { type: String },
  responsible_name: { type: String },
  taxId: { type: String },
  tax_id: { type: String },
  email: { type: String },
  phone: { type: String },
  country: { type: String },
  department: { type: String },
  city: { type: String },
  createdAt: { type: String },
  created_at: { type: String },
  status: { type: String },
  planId: { type: String },
  plan_id: { type: String },
  planName: { type: String },
  plan_name: { type: String },
  activeUsersCount: { type: Number, default: 0 },
  maxUsersAllowed: { type: Number, default: 0 },
  activeCampaignsCount: { type: Number, default: 0 },
  notes: { type: String },
  logoUrl: { type: String },
  aspiration: { type: String }
}, { strict: false });

// License Schema
const LicenseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  clientId: { type: String },
  client_id: { type: String },
  clientName: { type: String },
  client_name: { type: String },
  planId: { type: String },
  plan_id: { type: String },
  planName: { type: String },
  plan_name: { type: String },
  createdAt: { type: String },
  created_at: { type: String },
  activatedAt: { type: String },
  activated_at: { type: String },
  expiresAt: { type: String },
  expires_at: { type: String },
  status: { type: String },
  licenseType: { type: String },
  license_type: { type: String },
  maxUsers: { type: Number, default: 0 },
  usedUsers: { type: Number, default: 0 },
  maxCampaigns: { type: Number, default: 0 },
  usedCampaigns: { type: Number, default: 0 },
  maxStorageGB: { type: Number, default: 0 },
  enabledModuleCodes: { type: [String], default: [] },
  licenseKey: { type: String },
  license_key: { type: String },
  autoRenew: { type: Boolean, default: false }
}, { strict: false });

// Subscription Schema
const SubscriptionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  clientId: { type: String },
  client_id: { type: String },
  clientName: { type: String },
  client_name: { type: String },
  planId: { type: String },
  plan_id: { type: String },
  planName: { type: String },
  plan_name: { type: String },
  price: { type: Number },
  currency: { type: String },
  periodicity: { type: String },
  startDate: { type: String },
  start_date: { type: String },
  nextBillingDate: { type: String },
  next_billing_date: { type: String },
  expirationDate: { type: String },
  expiration_date: { type: String },
  status: { type: String },
  paymentMethod: { type: String }
}, { strict: false });

// User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true },
  firstName: { type: String },
  first_name: { type: String },
  lastName: { type: String },
  last_name: { type: String },
  email: { type: String },
  password: { type: String },
  phone: { type: String },
  clientId: { type: String },
  client_id: { type: String },
  clientName: { type: String },
  client_name: { type: String },
  campaignId: { type: String },
  campaign_id: { type: String },
  campaignName: { type: String },
  campaign_name: { type: String },
  roleId: { type: String },
  role_id: { type: String },
  roleName: { type: String },
  role_name: { type: String },
  status: { type: String },
  lastAccessAt: { type: String },
  last_access_at: { type: String },
  createdAt: { type: String },
  created_at: { type: String },
  ipAddress: { type: String },
  avatarUrl: { type: String }
}, { strict: false });

// Campaign Schema
const CampaignSchema = new mongoose.Schema({
  id: { type: String, required: true },
  clientId: { type: String },
  client_id: { type: String },
  clientName: { type: String },
  client_name: { type: String },
  name: { type: String },
  candidateName: { type: String },
  candidate_name: { type: String },
  electionType: { type: String },
  election_type: { type: String },
  territory: { type: String },
  startDate: { type: String },
  start_date: { type: String },
  electionDate: { type: String },
  election_date: { type: String },
  status: { type: String },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  logoUrl: { type: String }
}, { strict: false });

// Invoice Schema
const InvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  clientId: { type: String },
  client_id: { type: String },
  clientName: { type: String },
  client_name: { type: String },
  invoiceNumber: { type: String },
  planName: { type: String },
  totalAmount: { type: Number },
  currency: { type: String },
  issueDate: { type: String },
  dueDate: { type: String },
  paidAt: { type: String },
  status: { type: String }
}, { strict: false });

// AuditLog Schema
const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  timestamp: { type: String },
  userId: { type: String },
  userName: { type: String },
  userEmail: { type: String },
  clientId: { type: String },
  clientName: { type: String },
  action: { type: String },
  category: { type: String },
  details: { type: String },
  ipAddress: { type: String },
  result: { type: String }
}, { strict: false });

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String },
  message: { type: String },
  type: { type: String },
  timestamp: { type: String },
  read: { type: Boolean, default: false },
  clientId: { type: String }
}, { strict: false });

// Plan Schema
const PlanSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String },
  code: { type: String },
  description: { type: String },
  monthlyPrice: { type: Number },
  annualPrice: { type: Number },
  maxUsers: { type: Number },
  maxCampaigns: { type: Number },
  maxStorageGB: { type: Number },
  allowedModuleCodes: { type: [String], default: [] },
  supportLevel: { type: String },
  hasAiFeatures: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  features: { type: [String], default: [] }
}, { strict: false });

// Module Schema
const ModuleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  code: { type: String },
  name: { type: String },
  description: { type: String },
  category: { type: String },
  icon: { type: String },
  isRequiredForBasic: { type: Boolean, default: false },
  defaultEnabled: { type: Boolean, default: false }
}, { strict: false });

// Role Schema
const RoleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String },
  code: { type: String },
  description: { type: String },
  isSystemRole: { type: Boolean, default: false },
  permissionCodes: { type: [String], default: [] }
}, { strict: false });

// Session Schema
const SessionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String },
  userName: { type: String },
  userEmail: { type: String },
  clientName: { type: String },
  roleName: { type: String },
  loginAt: { type: String },
  lastActiveAt: { type: String },
  ipAddress: { type: String },
  device: { type: String },
  browser: { type: String }
}, { strict: false });

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
    console.log('🌱 Checking MongoDB database collections for seeding...');
    
    // Seed plans
    const planCount = await PlanModel.countDocuments();
    if (planCount === 0 && INITIAL_PLANS.length > 0) {
      console.log('🌱 Seeding plans...');
      await PlanModel.insertMany(INITIAL_PLANS);
    }
    
    // Seed modules
    const moduleCount = await ModuleModel.countDocuments();
    if (moduleCount === 0 && INITIAL_MODULES.length > 0) {
      console.log('🌱 Seeding modules...');
      await ModuleModel.insertMany(INITIAL_MODULES);
    }
    
    // Seed roles
    const roleCount = await RoleModel.countDocuments();
    if (roleCount === 0 && INITIAL_ROLES.length > 0) {
      console.log('🌱 Seeding roles...');
      await RoleModel.insertMany(INITIAL_ROLES);
    }

    // Seed clients
    const clientCount = await ClientModel.countDocuments();
    if (clientCount === 0 && INITIAL_CLIENTS.length > 0) {
      console.log('🌱 Seeding clients...');
      await ClientModel.insertMany(INITIAL_CLIENTS);
    }
    
    // Seed licenses
    const licenseCount = await LicenseModel.countDocuments();
    if (licenseCount === 0 && INITIAL_LICENSES.length > 0) {
      console.log('🌱 Seeding licenses...');
      const mappedLicenses = INITIAL_LICENSES.map((l: any) => ({
        ...l,
        enabledModuleCodes: l.enabledModuleCodes || []
      }));
      await LicenseModel.insertMany(mappedLicenses);
    }
    
    // Seed subscriptions
    const subCount = await SubscriptionModel.countDocuments();
    if (subCount === 0 && INITIAL_SUBSCRIPTIONS.length > 0) {
      console.log('🌱 Seeding subscriptions...');
      await SubscriptionModel.insertMany(INITIAL_SUBSCRIPTIONS);
    }
    
    // Seed users (with hashed default password "password")
    const userCount = await UserModel.countDocuments();
    if (userCount === 0 && INITIAL_USERS.length > 0) {
      console.log('🌱 Seeding users...');
      const hashedDefaultPassword = hashPassword('password');
      const mappedUsers = INITIAL_USERS.map((u: any) => ({
        ...u,
        password: hashedDefaultPassword
      }));
      await UserModel.insertMany(mappedUsers);
    }
    
    // Seed campaigns
    const campaignCount = await CampaignModel.countDocuments();
    if (campaignCount === 0 && INITIAL_CAMPAIGNS.length > 0) {
      console.log('🌱 Seeding campaigns...');
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
    }
    
    // Seed invoices
    const invoiceCount = await InvoiceModel.countDocuments();
    if (invoiceCount === 0 && INITIAL_INVOICES.length > 0) {
      console.log('🌱 Seeding invoices...');
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
    }
    
    // Seed audit logs
    const auditCount = await AuditLogModel.countDocuments();
    if (auditCount === 0 && INITIAL_AUDIT_LOGS.length > 0) {
      console.log('🌱 Seeding audit logs...');
      await AuditLogModel.insertMany(INITIAL_AUDIT_LOGS);
    }
    
    // Seed notifications
    const notifCount = await NotificationModel.countDocuments();
    if (notifCount === 0 && INITIAL_NOTIFICATIONS.length > 0) {
      console.log('🌱 Seeding notifications...');
      await NotificationModel.insertMany(INITIAL_NOTIFICATIONS);
    }
    
    console.log('🌱 MongoDB seeding check completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding MongoDB:', error);
  }
}
