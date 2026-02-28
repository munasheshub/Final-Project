

export enum CertificateStatus {
  Draft = 0,
  PendingVerification = 1,
  Verified = 2,
  Revoked = 3,
  Flagged = 4,
  Expired = 5
}

export enum QualificationType {
  Certificate = 0,
  Diploma = 1,
  Degree = 2,
  MastersDegree = 3,
  Doctorate = 4
}

export enum AwardClass {
  Pass = 0,
  LowerSecond = 1,
  UpperSecond = 2,
  FirstClass = 3,
  Distinction = 4
}

export interface Student {
  id: number;
  tenantId: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | string;
  email: string;
  phoneNumber?: string;
  photoUrl?: string;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  student: Student;
  studentId: string;
  qualificationType: QualificationType;
  programName: string;
  specialization?: string;
  awardClass: AwardClass;
  graduationDate: Date;
  issueDate: Date;
  status: CertificateStatus;
  
  // Blockchain related
  blockchainTxHash?: string;
  certificateHash: string;
  ipfsCid?: string;
  qrCode?: string;
  verificationCode: string;
  
  // Document
  documentUrl?: string;
  documentType: 'PDF' | 'IMAGE';
  
  // Metadata
  issuedBy: string;
  signatureUrl?: string;
  sealUrl?: string;
  
  // Revocation
  isRevoked: boolean;
  revocationDate?: Date;
  revocationReason?: string;
  revokedBy?: string;
  
  // AI Fraud Detection
  fraudCheckScore?: number;
  fraudCheckResult?: 'AUTHENTIC' | 'SUSPICIOUS' | 'FRAUDULENT';
  fraudCheckDate?: Date;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CertificateCreateDto {
  studentId: string;
  programId: number;
  qualificationType: QualificationType;
  programName: string;
  specialization?: string;
  awardClass: AwardClass;
  graduationDate: Date;
  documentFile: File;
  signatureId: string;
  performFraudCheck?: boolean;
}

export interface CertificateBatchUpload {
  file: File;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errors: BatchUploadError[];
}

export interface BatchUploadError {
  row: number;
  field: string;
  error: string;
}

export interface CertificateRevocationDto {
  certificateId: string;
  reason: string;
  effectiveDate: Date;
  notifyStudent: boolean;
}

export interface CertificateFilter {
  search?: string;
  status?: CertificateStatus[];
  qualificationType?: QualificationType[];
  dateFrom?: Date;
  dateTo?: Date;
  studentId?: string;
  isRevoked?: boolean;
}

export interface CertificateStats {
  totalIssued: number;
  totalVerified: number;
  totalRevoked: number;
  pendingIssuance: number;
  monthlyIssuance: MonthlyStats[];
  byQualificationType: TypeStats[];
  byProgram: ProgramStats[];
}

export interface MonthlyStats {
  month: string;
  count: number;
}

export interface TypeStats {
  type: QualificationType;
  count: number;
  percentage: number;
}

export interface ProgramStats {
  program: string;
  count: number;
}