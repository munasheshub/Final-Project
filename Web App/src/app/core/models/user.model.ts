

export enum UserRole {
  SuperAdmin = 0,
  InstitutionAdmin = 1,
  Registrar = 2,
  VerificationOfficer = 3,
  Auditor = 4
}

// Utility functions for UserRole
export function getUserRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.SuperAdmin:
      return 'Super Admin';
    case UserRole.InstitutionAdmin:
      return 'Institution Admin';
    case UserRole.Registrar:
      return 'Registrar';
    case UserRole.VerificationOfficer:
      return 'Verification Officer';
    case UserRole.Auditor:
      return 'Auditor';
    default:
      return 'Unknown';
  }
}

export function getUserRoleSeverity(role: UserRole): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
  switch (role) {
    case UserRole.SuperAdmin:
      return 'danger';
    case UserRole.InstitutionAdmin:
      return 'warn';
    case UserRole.Registrar:
      return 'info';
    case UserRole.VerificationOfficer:
      return 'success';
    case UserRole.Auditor:
      return 'secondary';
    default:
      return 'contrast';
  }
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
  AUDIT_EXPORT = 'audit:export',

  // Students
  STUDENT_VIEW = 'student:view',
  STUDENT_MANAGE = 'student:manage',
  STUDENT_BULK_UPLOAD = 'student:bulk-upload',

  // Programs
  PROGRAM_VIEW = 'program:view',
  PROGRAM_MANAGE = 'program:manage',

  // Faculties
  FACULTY_VIEW = 'faculty:view',
  FACULTY_MANAGE = 'faculty:manage',

  // Dashboard
  DASHBOARD_VIEW = 'dashboard:view'
}

export interface User {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  permissions: Permission[]
  role: UserRole;
  tenantId?: string;
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

export interface RegisterDto {
  tenantId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  password: string;
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
  [UserRole.SuperAdmin]: Object.values(Permission),
  
  [UserRole.InstitutionAdmin]: [
    Permission.DASHBOARD_VIEW,
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
    Permission.AUDIT_EXPORT,
    Permission.PROGRAM_VIEW,
    Permission.PROGRAM_MANAGE,
    Permission.FACULTY_VIEW,
    Permission.FACULTY_MANAGE,
    Permission.STUDENT_VIEW,
    Permission.STUDENT_MANAGE,
    Permission.STUDENT_BULK_UPLOAD
  ],
  
  [UserRole.Registrar]: [
    Permission.DASHBOARD_VIEW,
    Permission.CERTIFICATE_CREATE,
    Permission.CERTIFICATE_VIEW,
    Permission.CERTIFICATE_UPDATE,
    Permission.CERTIFICATE_REVOKE,
    Permission.CERTIFICATE_BATCH_UPLOAD,
    Permission.VERIFY_CERTIFICATE,
    Permission.VIEW_VERIFICATION_HISTORY,
    Permission.RUN_FRAUD_DETECTION,
    Permission.REPORTS_VIEW,
    Permission.PROGRAM_VIEW,
    Permission.FACULTY_VIEW,
    Permission.STUDENT_VIEW,
    Permission.STUDENT_MANAGE,
    Permission.STUDENT_BULK_UPLOAD
  ],
  
  [UserRole.VerificationOfficer]: [
    Permission.DASHBOARD_VIEW,
    Permission.CERTIFICATE_VIEW,
    Permission.VERIFY_CERTIFICATE,
    Permission.VIEW_VERIFICATION_HISTORY,
    Permission.RUN_FRAUD_DETECTION,
    Permission.REPORTS_VIEW
  ],
  
  [UserRole.Auditor]: [
    Permission.DASHBOARD_VIEW,
    Permission.CERTIFICATE_VIEW,
    Permission.VIEW_VERIFICATION_HISTORY,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
    Permission.AUDIT_VIEW,
    Permission.AUDIT_EXPORT
  ]
};