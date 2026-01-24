

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED'
}

export enum TransactionType {
  CERTIFICATE_ISSUE = 'CERTIFICATE_ISSUE',
  CERTIFICATE_REVOKE = 'CERTIFICATE_REVOKE',
  CERTIFICATE_UPDATE = 'CERTIFICATE_UPDATE',
  CERTIFICATE_VERIFY = 'CERTIFICATE_VERIFY'
}

export interface BlockchainTransaction {
  id: string;
  transactionHash: string;
  blockNumber?: number;
  status: TransactionStatus;
  type: TransactionType;
  certificateId?: string;
  certificateNumber?: string;
  gasUsed?: string;
  gasFee?: string;
  timestamp: Date;
  initiatedBy: string;
  error?: string;
}

export interface GasEstimate {
  estimatedGas: string;
  estimatedFeeGwei: string;
  estimatedFeeEth: string;
  estimatedFeeUsd?: string;
}

export interface BlockchainConfig {
  networkName: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  contractAddress: string;
  walletAddress: string;
  isConnected: boolean;
}

export interface SmartContractMethods {
  issueCertificate: string;
  verifyCertificate: string;
  revokeCertificate: string;
  getCertificate: string;
}

export interface IPFSUploadResult {
  cid: string;
  url: string;
  size: number;
  hash: string;
}

export interface CertificateOnChain {
  certificateHash: string;
  studentName: string;
  institutionName: string;
  qualificationType: string;
  issueDate: number;
  isRevoked: boolean;
  ipfsCid: string;
  timestamp: number;
}

export interface BlockchainStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalGasUsed: string;
  totalGasFeeEth: string;
  totalGasFeeUsd?: string;
  averageConfirmationTime: number;
}

export interface WalletConnection {
  address: string;
  balance: string;
  chainId: number;
  isConnected: boolean;
}