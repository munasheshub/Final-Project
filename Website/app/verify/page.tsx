"use client"

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { getCertificateByHash, getInstitutionById, getProfile, createVerificationLog } from "@/lib/api"
import {
  getCertificateDetailsOnChain,
  normalizeHash,
  type CertificateDetails,
} from "@/lib/blockchain"
import { blockchainConfig, txUrl, contractUrl } from "@/lib/blockchain-config"
import type { Certificate, Institution, UserProfile } from "@/lib/types"

type Status = "idle" | "verifying" | "success" | "failed" | "error"

export default function VerifyPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [hashInput, setHashInput] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [blockchainCert, setBlockchainCert] = useState<CertificateDetails | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      const currentUrl = `/verify${window.location.search}`
      router.replace(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`)
    }
  }, [authStatus, router])

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!session?.accessToken) return
    try {
      const p = await getProfile(session.accessToken)
      setProfile(p)
    } catch (err) {
      console.error("Failed to load profile:", err)
    }
  }, [session?.accessToken])

  useEffect(() => {
    if (session?.accessToken) fetchProfile()
  }, [session?.accessToken, fetchProfile])

  // Auto-fill hash from URL param
  useEffect(() => {
    const hashParam = searchParams.get("hash")
    if (hashParam) setHashInput(hashParam)
  }, [searchParams])

  // Auto-verify when hash comes from URL
  useEffect(() => {
    const hashParam = searchParams.get("hash")
    if (hashParam && authStatus === "authenticated" && status === "idle" && session?.accessToken) {
      verify(hashParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, searchParams, session?.accessToken])

  async function verify(raw: string) {
    if (!session?.accessToken) return
    setErrorMsg("")
    setCertificate(null)
    setBlockchainCert(null)

    let hash: string
    try {
      hash = normalizeHash(raw)
    } catch {
      setStatus("error")
      setErrorMsg("Invalid hash — expected a 64-character hex string (with or without 0x prefix).")
      return
    }

    setHashInput(hash)
    setStatus("verifying")

    try {
      // Run backend API + blockchain verification in parallel
      const [cert, chainResult] = await Promise.all([
        getCertificateByHash(session.accessToken, hash).catch(() => null),
        getCertificateDetailsOnChain(hash).catch(() => null),
      ])

      setCertificate(cert)
      setBlockchainCert(chainResult)

      // Always fetch institution from backend
      // Try cert.institutionId first, then blockchain institutionId
      const instId = cert?.institutionId
        ?? cert?.institution?.id
        ?? (chainResult ? Number(chainResult.institutionId) : null)

      if (instId && instId > 0) {
        getInstitutionById(session.accessToken, instId)
          .then((inst) => setInstitution(inst))
          .catch((e) => console.error("Failed to fetch institution:", e))
      } else if (cert?.institution) {
        setInstitution(cert.institution)
      }

      const isSuccess = !!(cert || (chainResult?.exists && chainResult.status !== 0))
      setStatus(isSuccess ? "success" : "failed")

      // Log the verification attempt
      createVerificationLog(session.accessToken, {
        certificateHash: hash,
        isSuccess,
        failureReason: isSuccess ? undefined : "Certificate not found on blockchain or in records",
      }).catch((logErr) => console.error("Failed to log verification:", logErr))
    } catch (err) {
      setStatus("error")
      const msg = err instanceof Error ? err.message : "Verification failed."
      setErrorMsg(msg)

      // Log the failed verification
      createVerificationLog(session.accessToken, {
        certificateHash: hash,
        isSuccess: false,
        failureReason: msg,
      }).catch((logErr) => console.error("Failed to log verification:", logErr))
    }
  }

  function reset() {
    setStatus("idle")
    setCertificate(null)
    setInstitution(null)
    setBlockchainCert(null)
    setHashInput("")
    setErrorMsg("")  
  }

  // Loading / redirecting states
  if (authStatus === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <span className="material-symbols-outlined animate-spin text-primary text-[40px]">
            progress_activity
          </span>
          <p className="text-sm text-muted-foreground font-mono">Loading session…</p>
        </div>
      </div>
    )
  }

  if (authStatus === "unauthenticated") return null

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={profile}
        activePage="verify"
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-4 sm:px-6 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
            Verify Certificate
          </h2>
          <div className="ml-auto flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            <span>{blockchainConfig.network}</span>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Title */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold font-mono uppercase tracking-widest mb-3">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                On-Chain Verification
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-sans mb-2">Verify a Certificate</h1>
              <p className="text-sm text-muted-foreground">
                Paste the certificate hash to verify authenticity on the{" "}
                <a href={contractUrl()} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Sepolia blockchain
                </a>{" "}
                and retrieve certificate details.
              </p>
            </div>

            {/* Input area */}
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-wider mb-2">
                  Certificate Hash
                </label>
                <input
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm font-mono outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => verify(hashInput)}
                  disabled={!hashInput.trim() || status === "verifying"}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {status === "verifying" ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Verifying…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      Verify
                    </>
                  )}
                </button>
                {status !== "idle" && status !== "verifying" && (
                  <button onClick={reset} className="px-6 py-3 bg-accent text-foreground font-bold rounded-lg hover:bg-accent/80 transition-colors">
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* ── SUCCESS ── */}
            {status === "success" && (() => {
              const blockchainStatus = blockchainCert?.status ?? -1
              const isRevokedOnBlockchain = blockchainStatus === 2
              const isValidOnBlockchain = blockchainStatus === 1
              const isInvalidOnBlockchain = blockchainStatus === 0
              const isRevokedInUI = certificate?.status === "Revoked"
              const hasFraud = certificate?.fraudDetected ?? false
              const isWarning = isRevokedOnBlockchain || isRevokedInUI || hasFraud

              const blockchainLabel = isValidOnBlockchain
                ? "Confirmed"
                : isRevokedOnBlockchain
                  ? "Revoked"
                  : isInvalidOnBlockchain
                    ? "Invalid"
                    : blockchainCert?.exists
                      ? "Found"
                      : "Not found"

              const blockchainBadgeColor = isValidOnBlockchain
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : isRevokedOnBlockchain
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"

              const headlineText = isRevokedOnBlockchain || isRevokedInUI
                ? "Certificate Revoked"
                : hasFraud
                  ? "Fraud Detected"
                  : "Certificate Verified"

              return (
              <div className="space-y-4">
                {/* Status banner */}
                <div className={`bg-card border rounded-2xl p-4 sm:p-6 shadow-sm ${isWarning ? "border-red-500/30" : "border-green-500/30"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${isWarning ? "bg-red-500/20" : "bg-green-500/20"}`}>
                      <span className={`material-symbols-outlined text-[28px] ${isWarning ? "text-red-500" : "text-green-500"}`}>
                        {isWarning ? "gpp_maybe" : "check_circle"}
                      </span>
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${isWarning ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                        {headlineText}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${blockchainBadgeColor}`}>
                          <span className="material-symbols-outlined text-[12px]">link</span>
                          Blockchain: {blockchainLabel}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${certificate ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"}`}>
                          <span className="material-symbols-outlined text-[12px]">database</span>
                          Records: {certificate ? "Found" : "Not found"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {certificate ? (
                  <>
                    {/* Certificate details */}
                    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">description</span>
                        Certificate Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Detail label="Certificate Number" value={certificate.certificateNumber} mono />
                        <Detail label="Status" value={certificate.status} badge={certificate.status === "Active" ? "green" : certificate.status === "Revoked" ? "red" : "yellow"} />
                        <Detail label="Student Name" value={certificate.studentName} />
                        <Detail label="Program" value={certificate.programName} />
                        <Detail label="Qualification" value={certificate.qualificationType} />
                        <Detail label="Award Class" value={certificate.awardClass} />
                        <Detail
                          label="Graduation Date"
                          value={new Date(certificate.graduationDate).toLocaleDateString("en-US", {
                            year: "numeric", month: "long", day: "numeric",
                          })}
                        />
                        <Detail
                          label="Issued On"
                          value={new Date(certificate.createdAt).toLocaleDateString("en-US", {
                            year: "numeric", month: "long", day: "numeric",
                          })}
                        />
                        {certificate.blockchainTxHash && (
                          <div className="sm:col-span-2">
                            <Detail
                              label="Blockchain Tx"
                              value={certificate.blockchainTxHash}
                              mono
                              href={txUrl(certificate.blockchainTxHash)}
                            />
                          </div>
                        )}
                      </div>

                      {/* Fraud detection */}
                      {certificate.fraudDetected && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                          <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
                          <span className="text-xs font-bold text-red-600 dark:text-red-400">
                            Fraud detected — confidence score: {certificate.fraudConfidenceScore}%
                          </span>
                        </div>
                      )}

                      {certificate.revokedAt && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">block</span>
                            Revoked on {new Date(certificate.revokedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                          {certificate.revocationReason && (
                            <p className="text-xs text-muted-foreground mt-1 ml-7">
                              Reason: {certificate.revocationReason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Student info */}
                    {certificate.student && (
                      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                          Student Information
                        </h3>
                        <div className="flex items-start gap-4">
                          {certificate.student.photoUrl && (
                            <img
                              src={certificate.student.photoUrl}
                              alt={`${certificate.student.firstName} ${certificate.student.lastName}`}
                              className="h-16 w-16 rounded-xl object-cover border border-border shrink-0"
                            />
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                            <Detail label="Full Name" value={`${certificate.student.firstName} ${certificate.student.lastName}`} />
                            <Detail label="Student Number" value={certificate.student.studentNumber} mono />
                            <Detail label="Email" value={certificate.student.email} />
                            <Detail
                              label="Date of Birth"
                              value={new Date(certificate.student.dateOfBirth).toLocaleDateString("en-US", {
                                year: "numeric", month: "long", day: "numeric",
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Institution info */}
                    {institution && (
                      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">apartment</span>
                          Issuing Institution
                        </h3>
                        <div className="flex items-start gap-4">
                          {institution.logoUrl && (
                            <img
                              src={institution.logoUrl}
                              alt={institution.name}
                              className="h-14 w-14 rounded-xl object-contain bg-white p-1 border border-border shrink-0"
                            />
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                            <Detail label="Name" value={institution.name} />
                            <Detail label="Code" value={institution.code} mono />
                            {institution.email && (
                              <Detail label="Email" value={institution.email} />
                            )}
                            {institution.website && (
                              <Detail label="Website" value={institution.website} href={institution.website.startsWith("http") ? institution.website : `https://${institution.website}`} />
                            )}
                            {institution.address && (
                              <div className="sm:col-span-2">
                                <Detail
                                  label="Address"
                                  value={[
                                    institution.address.street,
                                    institution.address.city,
                                    institution.address.province,
                                    institution.address.country,
                                    institution.address.postalCode,
                                  ].filter(Boolean).join(", ")}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verification history */}
                    {certificate.verificationLogs.length > 0 && (
                      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                          Verification History
                          <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                            {certificate.verificationLogs.length} record{certificate.verificationLogs.length !== 1 ? "s" : ""}
                          </span>
                        </h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {certificate.verificationLogs.map((log) => (
                            <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-accent/50 text-xs">
                              <span className={`material-symbols-outlined text-[16px] ${log.result === "Valid" ? "text-green-500" : "text-red-500"}`}>
                                {log.result === "Valid" ? "check_circle" : "cancel"}
                              </span>
                              <span className="font-mono text-muted-foreground">
                                {new Date(log.verifiedAt).toLocaleString()}
                              </span>
                              <span className="text-muted-foreground">{log.method}</span>
                              <span className={`ml-auto font-bold ${log.result === "Valid" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                {log.result}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Blockchain-only result — no backend record */
                  <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                      Blockchain Only
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      This certificate hash was confirmed on the blockchain but no matching record was found in the certificate database. 
                      The certificate may have been issued by an institution that has not yet synced its records.
                    </p>
                  </div>
                )}
              </div>
              )
            })()}

            {/* ── FAILED ── */}
            {status === "failed" && (
              <div className="bg-card border border-red-500/30 rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-red-500 text-[28px]">cancel</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-red-600 dark:text-red-400">Certificate Not Found</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      This hash was not found on the blockchain or in the certificate records.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── ERROR ── */}
            {status === "error" && (
              <div className="bg-card border border-red-500/30 rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-red-500 text-[28px]">error</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-red-600 dark:text-red-400">Verification Error</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{errorMsg}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contract info footer */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono text-muted-foreground pb-4">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">link</span>
                Contract:{" "}
                <a href={contractUrl()} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {blockchainConfig.contractAddress.slice(0, 6)}…{blockchainConfig.contractAddress.slice(-4)}
                </a>
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">hub</span>
                Chain ID: {blockchainConfig.chainId}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

/* ── Detail helper ── */
function Detail({
  label,
  value,
  mono,
  badge,
  href,
}: {
  label: string
  value: string
  mono?: boolean
  badge?: "green" | "red" | "yellow"
  href?: string
}) {
  const badgeColors = {
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  }

  return (
    <div className="bg-accent/50 rounded-lg p-3">
      <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-wider mb-1">
        {label}
      </p>
      {badge ? (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${badgeColors[badge]}`}>
          {value}
        </span>
      ) : href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm text-primary hover:underline truncate block ${mono ? "font-mono" : ""}`}
          title={value}
        >
          {value}
        </a>
      ) : (
        <p className={`text-sm truncate ${mono ? "font-mono text-muted-foreground" : ""}`} title={value}>
          {value}
        </p>
      )}
    </div>
  )
}
