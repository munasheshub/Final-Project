/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import type { UserProfile } from "@/lib/types"

type Page = "dashboard" | "verify"

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile | null
  activePage?: Page
}

export function DashboardSidebar({ isOpen, onClose, profile, activePage = "dashboard" }: DashboardSidebarProps) {
  const navItems: { page: Page; href: string; icon: string; label: string }[] = [
    { page: "dashboard", href: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { page: "verify", href: "/verify", icon: "verified", label: "Verify Certificate" },
  ]

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col
        transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0 lg:flex-shrink-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="p-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={onClose}
        >
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-foreground">
              verified_user
            </span>
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg leading-tight">
              Certify Chain
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Blockchain v2.1
            </p>
          </div>
        </Link>
        <button
          className="lg:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.page}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activePage === item.page
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
        <div className="pt-4 pb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
          Account
        </div>
        <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span className="text-sm font-medium">Profile Settings</span>
        </span>
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-accent">
          <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                className="h-full w-full object-cover"
                alt={`${profile.firstName} ${profile.lastName}`}
              />
            ) : (
              <span className="material-symbols-outlined h-full w-full flex items-center justify-center text-muted-foreground text-[20px]">
                person
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">
              {profile ? `${profile.firstName} ${profile.lastName}` : "User"}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              {profile?.email ?? ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
