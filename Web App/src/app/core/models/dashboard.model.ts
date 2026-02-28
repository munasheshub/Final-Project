// Dashboard Metrics Response
export interface DashboardMetricsDto {
  totalCertificates: number;
  totalCertificatesChange: number;
  activeCertificates: number;
  activeCertificatesChange: number;
  revokedCertificates: number;
  revokedCertificatesChange: number;
  totalVerifications: number;
  totalVerificationsChange: number;
  pendingVerifications: number;
  pendingVerificationsChange: number;
  fraudDetected: number;
  fraudDetectedChange: number;
  gasSpentEth: number;
  gasSpentChange: number;
}

// Activity Chart Response
export interface ActivityChartDto {
  labels: string[]; // Month names: ['Sep', 'Oct', 'Nov', ...]
  issued: number[]; // Issued certificates per month
  verified: number[]; // Verified certificates per month
}

// Monthly Overview Response
export interface MonthlyOverviewDto {
  labels: string[]; // Month names
  issued: number[]; // Issued per month
  revoked: number[]; // Revoked per month
}

// Recent Activity Response
export interface RecentActivityDto {
  user: string;
  action: string;
  certNumber?: string;
  timestamp: string; // ISO date string or relative time
  type: 'issued' | 'revoked' | 'verified' | 'login';
}

// Recent Certificates Response
export interface RecentCertificateDto {
  id: number;
  studentName: string;
  programName: string;
  certificateNumber: string;
  status: 'active' | 'revoked' | 'pending';
  issuedDate: string; // ISO date string
  studentInitials?: string; // Optional, can be computed on frontend
}

// Verification Requests Response
export interface VerificationRequestDto {
  certificateNumber: string;
  verifierName: string; // Employer or institution name
  verificationDate: string; // ISO date string
  status: 'verified' | 'pending' | 'fraud';
}

// Top Programs Response
export interface TopProgramDto {
  rank: number;
  programName: string;
  certificateCount: number;
  changePercentage: number; // Can be positive or negative
}
