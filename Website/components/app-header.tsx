/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const isLoggedIn = status === "authenticated"

  return (
    <header className="border-b border-primary/20 bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-foreground text-2xl">
              verified
            </span>
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-foreground">
            Certify Chain
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="/verify"
            className="hover:text-primary transition-colors"
          >
            Verify
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-primary transition-colors"
          >
            Network
          </Link>
          <span className="hover:text-primary transition-colors cursor-pointer">
            Registry
          </span>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-8 h-8 rounded-full ring-2 ring-primary/20"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {session.user?.name}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  logout
                </span>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-lg font-bold text-sm transition-all glow-border"
              >
                <span className="material-symbols-outlined text-sm">
                  login
                </span>
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>
      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-md">
          <nav className="flex flex-col px-4 py-4 space-y-3 text-sm font-medium">
            <Link
              href="/verify"
              className="hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Verify
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Network
            </Link>
            <span className="hover:text-primary transition-colors cursor-pointer py-2">
              Registry
            </span>
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 py-2 border-t border-border pt-4">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full ring-2 ring-primary/20"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">
                      {session.user?.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate font-mono">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    signOut({ callbackUrl: "/" })
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">
                    logout
                  </span>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 rounded-lg font-bold text-sm transition-all glow-border mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-sm">
                    login
                  </span>
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center justify-center px-5 py-3 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
