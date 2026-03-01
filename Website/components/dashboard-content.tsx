/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import type { VerificationLog, DashboardStats, UserProfile } from "@/lib/types"
import { computeStats } from "@/lib/types"
import type { Session } from "next-auth"

interface DashboardContentProps {
  onMenuToggle: () => void
  session: Session | null
  profile: UserProfile | null
  logs: VerificationLog[]
  isLoading: boolean
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
  }
}

function truncateHash(hash: string) {
  if (hash.length <= 14) return hash
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

function StatusBadge({
  isSuccess,
  failureReason,
}: {
  isSuccess: boolean
  failureReason?: string | null
}) {
  if (isSuccess) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase font-mono">
        <span className="material-symbols-outlined text-[14px]">
          check_circle
        </span>{" "}
        Verified
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase font-mono"
      title={failureReason ?? undefined}
    >
      <span className="material-symbols-outlined text-[14px]">cancel</span>{" "}
      Failed
    </span>
  )
}

export function DashboardContent({
  onMenuToggle,
  session,
  profile,
  logs,
  isLoading,
}: DashboardContentProps) {
  const stats: DashboardStats = computeStats(logs)
  const user = session?.user

  // Prefer backend profile over Google session for display
  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : (user?.name ?? "User")
  const displayEmail = profile?.email ?? user?.email ?? "—"
  const displayPhoto = profile?.photoUrl ?? user?.image ?? null
  const displayRole = profile?.role ?? "Authenticated"
  const displayId = profile ? String(profile.id) : (user?.id ?? "—")

  return (
    <main className="flex-1 overflow-y-auto min-w-0">
      {/* Top bar */}
      <header className="h-14 sm:h-16 border-b border-border flex items-center justify-between px-4 sm:px-8 sticky top-0 bg-card/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden p-1.5 mr-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={onMenuToggle}
            aria-label="Open sidebar"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
            Pages
          </span>
          <span className="text-border hidden sm:inline">/</span>
          <span className="text-sm font-bold">Profile Dashboard</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-[20px]">
              search
            </span>
            <input
              className="pl-10 pr-4 py-1.5 rounded-lg border border-border bg-card text-xs font-mono outline-none w-40 md:w-64"
              placeholder="Search hash..."
              type="text"
            />
          </div>
          <button className="sm:hidden h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground">
            <span className="material-symbols-outlined text-[20px]">
              search
            </span>
          </button>
          <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground">
            <span className="material-symbols-outlined text-[20px]">
              notifications
            </span>
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* ── Profile + Stats Row ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile card */}
          <div className="lg:col-span-2 bg-card rounded-xl p-4 sm:p-6 border border-border shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="relative shrink-0">
              <div className="h-20 w-20 sm:h-32 sm:w-32 rounded-2xl overflow-hidden ring-4 ring-card shadow-xl">
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    className="h-full w-full object-cover"
                    alt={displayName}
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <span className="material-symbols-outlined text-muted-foreground text-[40px]">
                      person
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 h-6 w-6 sm:h-8 sm:w-8 bg-green-500 rounded-full border-4 border-card flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[12px] sm:text-[16px]">
                  check
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between mb-2 gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-sans">
                  {displayName}
                </h2>
                <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest font-mono">
                  {displayRole}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-tighter">
                    Email
                  </p>
                  <p className="text-sm font-mono truncate">
                    {displayEmail}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-tighter">
                    User ID
                  </p>
                  <p className="text-sm font-mono truncate">
                    {displayId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats card */}
          <div className="bg-primary rounded-xl p-4 sm:p-6 text-primary-foreground flex flex-col justify-between overflow-hidden relative group shadow-xl shadow-primary/20">
            <div className="absolute -right-8 -top-8 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            <div>
              <p className="text-xs font-mono opacity-80 mb-1">Total Scans</p>
              <h3 className="text-3xl sm:text-4xl font-bold font-sans">
                {isLoading ? "—" : stats.totalScans.toLocaleString()}
              </h3>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span>Verification Integrity</span>
                <span>{isLoading ? "—" : `${stats.successRate}%`}</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{
                    width: `${isLoading ? 0 : stats.successRate}%`,
                  }}
                />
              </div>
            </div>
            <Link
              href="/verify"
              className="mt-4 w-full py-2 bg-white text-primary rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                add
              </span>{" "}
              New Verification
            </Link>
          </div>
        </section>

        {/* ── Recent Verifications Table ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold font-sans">
              Recent Verifications
            </h3>
            <button className="text-primary text-xs font-bold hover:underline">
              View All Logs
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined animate-spin text-muted-foreground text-[28px]">
                  progress_activity
                </span>
                <p className="text-sm text-muted-foreground mt-2 font-mono">
                  Fetching verification logs…
                </p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-muted-foreground text-[40px]">
                  search_off
                </span>
                <p className="text-sm text-muted-foreground mt-2">
                  No verification logs yet.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-accent border-b border-border">
                        <th className="px-4 lg:px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground font-mono">
                          Date &amp; Time
                        </th>
                        <th className="px-4 lg:px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground font-mono">
                          Certificate Hash
                        </th>
                        <th className="px-4 lg:px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground font-mono">
                          Certificate ID
                        </th>
                        <th className="px-4 lg:px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground font-mono">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {logs.map((log) => {
                        const { date, time } = formatDate(log.verifiedAt)
                        return (
                          <tr key={log.id}>
                            <td className="px-4 lg:px-6 py-4">
                              <p className="text-xs font-medium">{date}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {time}
                              </p>
                            </td>
                            <td className="px-4 lg:px-6 py-4 font-mono text-xs text-muted-foreground">
                              {truncateHash(log.certificateHash)}
                            </td>
                            <td className="px-4 lg:px-6 py-4 font-mono text-xs">
                              {log.certificateId}
                            </td>
                            <td className="px-4 lg:px-6 py-4">
                              <StatusBadge
                                isSuccess={log.isSuccess}
                                failureReason={log.failureReason}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card layout */}
                <div className="sm:hidden divide-y divide-border">
                  {logs.map((log) => {
                    const { date, time } = formatDate(log.verifiedAt)
                    return (
                      <div key={log.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold font-mono">
                            {truncateHash(log.certificateHash)}
                          </p>
                          <StatusBadge
                            isSuccess={log.isSuccess}
                            failureReason={log.failureReason}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Certificate #{log.certificateId}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                          <span>
                            {date} · {time}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
