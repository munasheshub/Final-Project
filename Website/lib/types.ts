// ── User Profile Model ──

export type UserRole = string

export interface UserProfile {
  id: number
  tenantId: string
  email: string
  isActive: boolean
  firstName: string
  lastName: string
  photoUrl?: string | null
  role: UserRole
  permissions: string[]
  creationTime: string   // ISO 8601
  lastModificationTime: string // ISO 8601
}

// ── Auth Token Models ──

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiration: string // ISO 8601
  permissions: string[]
}

// ── Verification Log Models ──

export interface CreateVerificationLogRequest {
  certificateHash: string
  isSuccess: boolean
  failureReason?: string
}

export interface VerificationLog {
  id: string
  tenantId: string
  certificateHash: string
  certificateId: number
  verifiedAt: string // ISO 8601 datetime
  verifiedBy?: string | null
  isSuccess: boolean
  failureReason?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}

// ── Certificate / Institution Models (from backend) ──

export interface Address {
  id: number
  street: string
  city: string
  province: string
  country: string
  postalCode: string
}

export interface Institution {
  id: number
  tenantId: string
  name: string
  code: string
  logoUrl: string | null
  sealUrl: string | null
  email: string
  phone: string
  website: string
  walletAddress: string | null
  smartContractAddress: string | null
  isBlockchainAuthorized: boolean
  ipfsGateway: string | null
  verifiedAt: string | null
  createdAt: string
  isDeleted: boolean
  address: Address | null
}

export interface Student {
  id: number
  tenantId: string
  studentNumber: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  phoneNumber: string | null
  photoUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface CertificateVerificationLog {
  id: string
  verifiedAt: string
  verifiedBy: string
  method: string
  result: string
}

export interface Certificate {
  id: number
  certificateNumber: string
  studentName: string
  programName: string
  qualificationType: string
  awardClass: string
  graduationDate: string
  status: string
  blockchainTxHash: string | null
  ipfsCid: string | null
  verificationCode: string | null
  createdAt: string
  studentId: number | null
  student: Student | null
  institutionId: number | null
  institution: Institution | null
  certificateHash: string | null
  qrCodeData: string | null
  revokedAt: string | null
  revocationReason: string | null
  fraudConfidenceScore: number
  fraudDetected: boolean
  verificationLogs: CertificateVerificationLog[]
}

// ── Dashboard Computed Stats ──

export interface DashboardStats {
  totalScans: number
  successRate: number // 0–100
  successCount: number
  failureCount: number
}

export function computeStats(logs: VerificationLog[]): DashboardStats {
  const total = logs.length
  const successCount = logs.filter((l) => l.isSuccess).length
  const failureCount = total - successCount

  return {
    totalScans: total,
    successRate: total > 0 ? Math.round((successCount / total) * 1000) / 10 : 0,
    successCount,
    failureCount,
  }
}
