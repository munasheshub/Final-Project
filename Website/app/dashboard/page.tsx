"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { getMyVerificationLogs, getProfile } from "@/lib/api"
import type { VerificationLog, UserProfile } from "@/lib/types"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logs, setLogs] = useState<VerificationLog[]>([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

  // Fetch profile + verification logs when session is available
  const fetchData = useCallback(async () => {
    if (!session?.accessToken) return
    setLogsLoading(true)
    try {
      const [logsData, profileData] = await Promise.all([
        getMyVerificationLogs(session.accessToken),
        getProfile(session.accessToken),
      ])
      setLogs(logsData)
      setProfile(profileData)
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
    } finally {
      setLogsLoading(false)
    }
  }, [session?.accessToken])

  useEffect(() => {
    if (session?.accessToken) {
      fetchData()
    }
  }, [session?.accessToken, fetchData])

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <span className="material-symbols-outlined animate-spin text-primary text-[40px]">
            progress_activity
          </span>
          <p className="text-sm text-muted-foreground font-mono">
            Loading session…
          </p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") return null

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
        activePage="dashboard"
      />
      <DashboardContent
        onMenuToggle={() => setSidebarOpen(true)}
        session={session}
        profile={profile}
        logs={logs}
        isLoading={logsLoading}
      />
    </div>
  )
}
