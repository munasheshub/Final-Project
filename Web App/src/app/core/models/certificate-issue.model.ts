export interface CertificateIssueDto {
  // Step 1: Student Information
  student: {
    id: string;
    fullName: string;
    dateOfBirth: string; // ISO string, e.g., '2000-05-23'
    email?: string;
    phoneNumber?: string;
  };

  // Step 2: Certificate Details
  certificate: {
    programName: string;
    specialization?: string;
    qualificationType: string;
    awardClass: string;
    graduationDate: string; // ISO string
    certificateNumber?: string; // auto-generated if blank
  };

  // Step 3: Document & AI Verification
  document: {
    fileName: string;
    fileSize: number; // in bytes
    fileHash: string; // SHA-256 hash
    aiVerified: boolean; // result of AI fraud detection
  };

  // Step 4: Blockchain Information
  blockchain: {
    walletAddress: string; // connected institutional wallet
    submittedAt: string; // ISO timestamp of submission
    transactionHash?: string; // filled after submission
    gasFee?: number; // estimated or actual fee in ETH
  };
}
