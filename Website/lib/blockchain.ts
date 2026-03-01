import { ethers } from "ethers"
import { blockchainConfig } from "./blockchain-config"
import { CertificateVerificationABI } from "./contract-abi"

// ── Read-only provider (no wallet needed) ──

const provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl)

const contract = new ethers.Contract(
  blockchainConfig.contractAddress,
  CertificateVerificationABI,
  provider
)

// ── Types ──

export interface VerificationResult {
  isValid: boolean
  studentId: string // hex bytes16
  institutionId: number
  issueDate: Date
  ipfsCID: string // hex bytes32
}

export interface CertificateDetails {
  certHash: string
  ipfsCID: string
  issueDate: Date
  studentId: string
  institutionId: number
  status: number // 0 = invalid, 1 = valid, 2 = revoked
  exists: boolean
}

// ── Public API ──

/**
 * Normalise a hash string to a proper bytes32.
 * Accepts "0x..." (64 hex chars) or a raw 64-char hex string.
 */
export function normalizeHash(input: string): string {
  let hash = input.trim()
  if (!hash.startsWith("0x")) hash = "0x" + hash
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    throw new Error(
      "Invalid certificate hash. Expected 32-byte hex (64 characters)."
    )
  }
  return hash
}

/** Call `verifyCertificate(bytes32)` on-chain (read-only, no gas) */
export async function verifyCertificateOnChain(
  certHash: string
): Promise<VerificationResult> {
  const hash = normalizeHash(certHash)
  const [isValid, studentId, institutionId, issueDate, ipfsCID] =
    await contract.verifyCertificate(hash)

  return {
    isValid,
    studentId,
    institutionId: Number(institutionId),
    issueDate: new Date(Number(issueDate) * 1000),
    ipfsCID,
  }
}

/** Call `getCertificateDetails(bytes32)` on-chain */
export async function getCertificateDetailsOnChain(
  certHash: string
): Promise<CertificateDetails> {
  const hash = normalizeHash(certHash)
  const cert = await contract.getCertificateDetails(hash)

  return {
    certHash: cert.certHash,
    ipfsCID: cert.ipfsCID,
    issueDate: new Date(Number(cert.issueDate) * 1000),
    studentId: cert.studentId,
    institutionId: Number(cert.institutionId),
    status: Number(cert.status),
    exists: cert.exists,
  }
}

/** Check whether a certificate exists on-chain */
export async function certificateExists(certHash: string): Promise<boolean> {
  const hash = normalizeHash(certHash)
  return contract.certificateExists(hash)
}

/** Get total number of certificates on-chain */
export async function getCertificateCount(): Promise<number> {
  const count = await contract.certificateCount()
  return Number(count)
}
