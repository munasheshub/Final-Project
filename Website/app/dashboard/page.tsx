import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardContent } from "@/components/dashboard-content"

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <DashboardSidebar />
      <DashboardContent />
    </div>
  )
}
