/* eslint-disable @next/next/no-img-element */
import Link from "next/link"

export function DashboardSidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <Link
          href="/"
          className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-primary-foreground">
            verified_user
          </span>
        </Link>
        <div>
          <h1 className="font-sans font-bold text-lg leading-tight">
            Certify Chain
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Blockchain v2.1
          </p>
        </div>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        <span className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">
            dashboard
          </span>
          <span className="text-sm font-medium">Dashboard</span>
        </span>
        <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">shield</span>
          <span className="text-sm font-medium">Verifications</span>
        </span>
        <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">
            database
          </span>
          <span className="text-sm font-medium">Blockchain Log</span>
        </span>
        <div className="pt-4 pb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
          Account
        </div>
        <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span className="text-sm font-medium">Profile Settings</span>
        </span>
        <Link
          href="/mobile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">
            smartphone
          </span>
          <span className="text-sm font-medium">Switch to Mobile</span>
        </Link>
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-accent">
          <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
              className="h-full w-full object-cover"
              alt="Alex Thompson"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">Alex Thompson</p>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              ID: CC-98234-XJ
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
