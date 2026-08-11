export type ClientStatus = 'Activo' | 'Próximo a vencer' | 'Vencido' | 'Suspendido' | 'Pendiente';
export type LicenseStatus = 'Activa' | 'Próxima a vencer' | 'Vencida' | 'Suspendida';
export type LicenseType = 'Anual' | 'Semestral' | 'Trimestral' | 'Mensual' | 'Especial Demo' | 'Vitalicia';
export type SubscriptionPeriod = 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual' | 'Personalizada';
export type SubscriptionStatus = 'Activa' | 'Pendiente' | 'Cancelada' | 'Suspendida' | 'Prueba';
export type InvoiceStatus = 'Pagada' | 'Pendiente' | 'Vencida' | 'Cancelada' | 'Reembolsada';
export type UserStatus = 'Activo' | 'Inactivo' | 'Suspendido' | 'Pendiente Invitación';

export interface ModuleDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'Electoral' | 'Estrategia' | 'Operación' | 'Inteligencia';
  icon: string;
  isRequiredForBasic: boolean;
  defaultEnabled: boolean;
}

export interface Plan {
  id: string;
  name: string; // Free, Plus, Pro, Enterprise
  code: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  maxUsers: number; // -1 for unlimited
  maxCampaigns: number;
  maxStorageGB: number;
  allowedModuleCodes: string[];
  supportLevel: 'Estándar' | 'Prioritario' | 'Premium 24/7' | 'Estándar Demo';
  hasAiFeatures: boolean;
  isPopular?: boolean;
  features?: string[];
  activeUsersCount?: number;
}

export interface Client {
  id: string; // Tenant ID (e.g., CLI-2026-101)
  organizationName: string;
  responsibleName: string;
  taxId: string; // NIT / Documento
  email: string;
  phone: string;
  country: string;
  department: string; // State/Province
  city: string;
  createdAt: string;
  status: ClientStatus;
  planId: string;
  planName: string;
  activeUsersCount: number;
  maxUsersAllowed: number;
  activeCampaignsCount: number;
  notes?: string;
  logoUrl?: string;
}

export interface License {
  id: string; // LIC-2026-000125
  clientId: string;
  clientName: string;
  planId: string;
  planName: string;
  createdAt: string;
  activatedAt: string;
  expiresAt: string;
  status: LicenseStatus;
  licenseType: LicenseType;
  maxUsers: number;
  usedUsers: number;
  maxCampaigns: number;
  usedCampaigns: number;
  maxStorageGB: number;
  enabledModuleCodes: string[];
  licenseKey: string; // Secure token representation
  autoRenew: boolean;
}

export interface Subscription {
  id: string; // SUB-90812
  clientId: string;
  clientName: string;
  planId: string;
  planName: string;
  price: number;
  currency: string;
  periodicity: SubscriptionPeriod;
  startDate: string;
  nextBillingDate: string;
  expirationDate: string;
  status: SubscriptionStatus;
  paymentMethod?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  clientId: string;
  clientName: string;
  campaignId?: string;
  campaignName?: string;
  roleId: string;
  roleName: string;
  status: UserStatus;
  lastAccessAt: string;
  createdAt: string;
  ipAddress?: string;
  avatarUrl?: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  isSystemRole: boolean; // Cannot be deleted if system
  permissionCodes: string[];
}

export interface Permission {
  code: string;
  name: string;
  group: 'Clientes' | 'Usuarios' | 'Licencias' | 'Suscripciones' | 'Finanzas' | 'IA' | 'Reportes' | 'Sistema';
  description: string;
}

export interface Campaign {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  candidateName: string;
  electionType: 'Presidencial' | 'Gobernación' | 'Alcaldía' | 'Senado' | 'Cámara' | 'Concejo';
  territory: string;
  startDate: string;
  electionDate: string;
  status: 'En Ejecución' | 'Planificación' | 'Finalizada' | 'Suspendida';
  registeredVotersTarget: number;
  registeredVotersCurrent: number;
}

export interface Invoice {
  id: string; // FAC-2026-891
  clientId: string;
  clientName: string;
  subscriptionId: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  description: string;
  paymentMethod?: string;
  paidAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  clientId?: string;
  clientName?: string;
  action: string;
  category: 'Cliente' | 'Licencia' | 'Suscripción' | 'Usuario' | 'Rol' | 'Módulo' | 'Acceso' | 'Sistema';
  details: string;
  ipAddress: string;
  userAgent?: string;
  result: 'Éxito' | 'Advertencia' | 'Fallido';
}

export interface Session {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  clientName: string;
  roleName: string;
  loginAt: string;
  lastActiveAt: string;
  ipAddress: string;
  device: string;
  browser: string;
  isCurrentSession?: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  timestamp: string;
  read: boolean;
  clientId?: string;
  linkToView?: string;
}

export interface AccessCheckResult {
  allowed: boolean;
  code: 'OK' | 'EXPIRED_LICENSE' | 'SUSPENDED_CLIENT' | 'USER_INACTIVE' | 'MODULE_DISABLED' | 'EXCEEDED_USERS';
  title: string;
  message: string;
  clientInfo?: {
    name: string;
    status: ClientStatus;
    plan: string;
  };
  licenseInfo?: {
    id: string;
    expiresAt: string;
    type: string;
    status: LicenseStatus;
  };
  enabledModules?: string[];
  redirectUrl?: string;
}
