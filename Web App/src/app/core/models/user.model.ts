

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  INSTITUTION_ADMIN = 'INSTITUTION_ADMIN',
  REGISTRAR = 'REGISTRAR',
  VERIFICATION_OFFICER = 'VERIFICATION_OFFICER',
  AUDITOR = 'AUDITOR'
}

export enum Permission {
  // Certificate permissions
  CERTIFICATE_CREATE = 'certificate:create',
  CERTIFICATE_VIEW = 'certificate:view',
  CERTIFICATE_UPDATE = 'certificate:update',
  CERTIFICATE_REVOKE = 'certificate:revoke',
  CERTIFICATE_BATCH_UPLOAD = 'certificate:batch-upload',
  
  // User management
  USER_CREATE = 'user:create',
  USER_VIEW = 'user:view',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // Verification
  VERIFY_CERTIFICATE = 'verify:certificate',
  VIEW_VERIFICATION_HISTORY = 'verify:history',
  RUN_FRAUD_DETECTION = 'verify:fraud-detection',
  
  // Settings
  SETTINGS_INSTITUTION = 'settings:institution',
  SETTINGS_BLOCKCHAIN = 'settings:blockchain',
  SETTINGS_SIGNATURES = 'settings:signatures',
  SETTINGS_TEMPLATES = 'settings:templates',
  
  // Reports & Audit
  REPORTS_VIEW = 'reports:view',
  REPORTS_EXPORT = 'reports:export',
  AUDIT_VIEW = 'audit:view',
  AUDIT_EXPORT = 'audit:export'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  permissions: Permission[]
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  creationTime: Date;
  lastModificationTime: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface TwoFactorVerification {
  userId: string;
  code: string;
}

export interface PasswordReset {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserCreateDto {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  sendWelcomeEmail?: boolean;
}

export interface UserUpdateDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserFilter {
  search?: string;
  role?: UserRole[];
  isActive?: boolean;
}

// Role to Permissions mapping
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  
  [UserRole.INSTITUTION_ADMIN]: [
    Permission.CERTIFICATE_CREATE,
    Permission.CERTIFICATE_VIEW,
    Permission.CERTIFICATE_UPDATE,
    Permission.CERTIFICATE_REVOKE,
    Permission.CERTIFICATE_BATCH_UPLOAD,
    Permission.USER_CREATE,
    Permission.USER_VIEW,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.VERIFY_CERTIFICATE,
    Permission.VIEW_VERIFICATION_HISTORY,
    Permission.RUN_FRAUD_DETECTION,
    Permission.SETTINGS_INSTITUTION,
    Permission.SETTINGS_BLOCKCHAIN,
    Permission.SETTINGS_SIGNATURES,
    Permission.SETTINGS_TEMPLATES,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    Permission.AUDIT_VIEW,
    Permission.AUDIT_EXPORT
  ],
  
  [UserRole.REGISTRAR]: [
    Permission.CERTIFICATE_CREATE,
    Permission.CERTIFICATE_VIEW,
    Permission.CERTIFICATE_UPDATE,
    Permission.CERTIFICATE_REVOKE,
    Permission.CERTIFICATE_BATCH_UPLOAD,
    Permission.VERIFY_CERTIFICATE,
    Permission.VIEW_VERIFICATION_HISTORY,
    Permission.RUN_FRAUD_DETECTION,
    Permission.REPORTS_VIEW
  ],
  
  [UserRole.VERIFICATION_OFFICER]: [
    Permission.CERTIFICATE_VIEW,
    Permission.VERIFY_CERTIFICATE,
    Permission.VIEW_VERIFICATION_HISTORY,
    Permission.RUN_FRAUD_DETECTION,
    Permission.REPORTS_VIEW
  ],
  
  [UserRole.AUDITOR]: [
    Permission.CERTIFICATE_VIEW,
    Permission.VIEW_VERIFICATION_HISTORY,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    Permission.AUDIT_VIEW,
    Permission.AUDIT_EXPORT
  ]
};