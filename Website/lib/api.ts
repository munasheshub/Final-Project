import type {
  AuthTokens,
  Certificate,
  CreateVerificationLogRequest,
  Institution,
  UserProfile,
  VerificationLog,
} from "./types"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? ""
const SERVER_BACKEND_URL = process.env.BACKEND_API_URL ?? BACKEND_URL

// ── Generic authenticated fetch helper ──

/** Backend responses are wrapped in { data, message, isSuccess, timeStamp } */
interface ApiEnvelope<T> {
  data: T
  message: string
  isSuccess: boolean
  timeStamp: string
}

async function apiFetch<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`API ${res.status}: ${body}`)
  }

  const json = await res.json()

  // Unwrap the backend envelope if present
  if (json && typeof json === "object" && "data" in json && "isSuccess" in json) {
    const envelope = json as ApiEnvelope<T>
    if (!envelope.isSuccess) {
      throw new Error(envelope.message || "API returned isSuccess=false")
    }
    return envelope.data
  }

  return json as T
}

// ── Auth ──

/**
 * Exchange a refresh token for a new access + refresh token pair.
 * Uses the server-side BACKEND_API_URL (no Bearer needed).
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<AuthTokens> {
  const res = await fetch(`${SERVER_BACKEND_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Refresh failed ${res.status}: ${body}`)
  }

  const json = await res.json()

  // Unwrap the backend envelope if present
  if (json && typeof json === "object" && "data" in json && "isSuccess" in json) {
    const envelope = json as ApiEnvelope<AuthTokens>
    if (!envelope.isSuccess) {
      throw new Error(envelope.message || "Refresh returned isSuccess=false")
    }
    return envelope.data
  }

  return json as AuthTokens
}

// ── User Profile ──

/** Get the authenticated user's profile from the backend */
export async function getProfile(
  accessToken: string
): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/auth/profile", accessToken)
}

// ── Verification Logs ──

/** Get all verification logs for the current user */
export async function getMyVerificationLogs(
  accessToken: string
): Promise<VerificationLog[]> {
  return apiFetch<VerificationLog[]>(
    "/api/verification-logs/mine",
    accessToken
  )
}

/** Get all verification logs (admin / global) */
export async function getAllVerificationLogs(
  accessToken: string
): Promise<VerificationLog[]> {
  return apiFetch<VerificationLog[]>("/api/verification-logs", accessToken)
}

/** Get verification logs by certificate hash */
export async function getVerificationLogsByHash(
  accessToken: string,
  certificateHash: string
): Promise<VerificationLog[]> {
  return apiFetch<VerificationLog[]>(
    `/api/verification-logs/by-hash/${encodeURIComponent(certificateHash)}`,
    accessToken
  )
}

/** Get verification logs by certificate ID */
export async function getVerificationLogsByCertificate(
  accessToken: string,
  certificateId: number
): Promise<VerificationLog[]> {
  return apiFetch<VerificationLog[]>(
    `/api/verification-logs/by-certificate/${certificateId}`,
    accessToken
  )
}

/** Create a new verification log */
export async function createVerificationLog(
  accessToken: string,
  data: CreateVerificationLogRequest
): Promise<VerificationLog> {
  return apiFetch<VerificationLog>("/api/verification-logs", accessToken, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// ── Certificates ──

/** Get a certificate by its blockchain hash */
export async function getCertificateByHash(
  accessToken: string,
  certHash: string
): Promise<Certificate> {
  return apiFetch<Certificate>(
    `/api/certificates/by-hash/${encodeURIComponent(certHash)}`,
    accessToken
  )
}

// ── Institutions ──

/** Get an institution by ID */
export async function getInstitutionById(
  accessToken: string,
  id: number
): Promise<Institution> {
  return apiFetch<Institution>(`/api/institution/${id}`, accessToken)
}

/** Public: Get a minimal list of institutions (id + name) for the AI scan picker */
export async function getInstitutionsPublic(): Promise<{ id: number; name: string }[]> {
  const res = await fetch(`${BACKEND_URL}/api/institution/public-list`)
  if (!res.ok) return []
  const json = await res.json()
  return json?.data ?? []
}

// ── AI Fraud Detection ──

export interface AiFraudResult {
  id: string
  fraud_probability: number
  risk_level: string
  verdict: string
  action: string
  inference_ms: number
  forgery_type: string
  handcrafted_features: Record<string, number>
  created_at: string
}

/** Upload a certificate document (PDF/image) for AI fraud detection */
export async function verifyDocumentWithAi(
  file: File,
  institutionId?: number,
  studentId?: number
): Promise<AiFraudResult> {
  const formData = new FormData()
  formData.append("file", file)
  if (institutionId) {
    formData.append("institutionId", institutionId.toString())
  }
  if (studentId) {
    formData.append("studentId", studentId.toString())
  }

  const res = await fetch(`${BACKEND_URL}/api/certificates/verify-document`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`AI analysis failed (${res.status}): ${body}`)
  }

  return res.json()
}
