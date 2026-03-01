"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function SignUpPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0d12]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Initializing...
          </span>
        </div>
      </div>
    )
  }

  if (status === "authenticated") return null

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0d12]">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12 bg-[#0c1018] border-r border-slate-800/60">
        {/* Grid dot background */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(16,185,129,0.15) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/3 -right-16 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 -left-10 w-48 h-48 bg-primary/8 rounded-full blur-[80px]" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-primary-foreground text-2xl">
                verified
              </span>
            </div>
            <span className="font-sans text-2xl font-bold tracking-tight text-white">
              Certify Chain
            </span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">
              Join the
              <br />
              <span className="text-secondary">Verification</span>{" "}
              <span className="text-primary">Network</span>
            </h2>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Become part of a decentralized ecosystem that secures digital
              credentials using AI and blockchain technology.
            </p>
          </div>

          {/* Feature blocks */}
          <div className="space-y-3 max-w-sm">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#080b10] border border-slate-800/60 group hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">
                  psychology
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">AI Detection</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Neural tampering analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#080b10] border border-slate-800/60 group hover:border-secondary/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-xl">
                  account_tree
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Blockchain Ledger
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Immutable record storage
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#080b10] border border-slate-800/60 group hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">
                  fingerprint
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Zero-Knowledge Proofs
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Privacy-preserving verification
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex items-center gap-8">
          <div>
            <p className="text-2xl font-black text-white font-mono">1.2M+</p>
            <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
              Verifications
            </p>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <p className="text-2xl font-black text-white font-mono">99.9%</p>
            <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
              Accuracy
            </p>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <p className="text-2xl font-black text-white font-mono">12.8K</p>
            <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
              Nodes
            </p>
          </div>
        </div>
      </div>

      {/* Right — signup form */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile header */}
        <header className="lg:hidden border-b border-slate-800/60 bg-[#0c1018]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-primary p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-primary-foreground text-xl">
                  verified
                </span>
              </div>
              <span className="font-sans text-lg font-bold tracking-tight text-white">
                Certify Chain
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full max-w-sm space-y-8">
            {/* Heading */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-mono font-bold uppercase tracking-widest mb-5">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                New Identity Protocol
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Create Account
              </h1>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Register on the decentralized verification network
              </p>
            </div>

            {/* What you get — mobile only */}
            <div className="lg:hidden space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-secondary text-base">
                  check_circle
                </span>
                <span className="text-slate-400">
                  AI-powered certificate verification
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-secondary text-base">
                  check_circle
                </span>
                <span className="text-slate-400">
                  Blockchain-backed immutable records
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-secondary text-base">
                  check_circle
                </span>
                <span className="text-slate-400">
                  Zero-knowledge proof privacy
                </span>
              </div>
            </div>

            {/* Google button */}
            <div className="space-y-4">
              <button
                onClick={() =>
                  signIn("google", { callbackUrl: "/dashboard" })
                }
                className="group w-full flex items-center gap-4 px-5 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-secondary/40 rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(16,185,129,0.12)] active:scale-[0.98]"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="block text-sm font-bold text-white group-hover:text-secondary transition-colors">
                    Sign up with Google
                  </span>
                  <span className="block text-[11px] text-slate-500 font-mono">
                    One-click onboarding
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-600 ml-auto text-xl group-hover:text-secondary transition-colors">
                  arrow_forward
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-800" />
              <span className="text-[10px] font-mono text-slate-600 tracking-wider">
                0xNEW...NODE
              </span>
              <div className="flex-1 border-t border-slate-800" />
            </div>

            {/* Trust signals */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-lg">
                  gpp_good
                </span>
                <div>
                  <p className="text-xs font-bold text-white">
                    Your data stays yours
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    We only store name & email from Google
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">
                  delete_forever
                </span>
                <div>
                  <p className="text-xs font-bold text-white">
                    Delete anytime
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Full account removal on request
                  </p>
                </div>
              </div>
            </div>

            {/* Terms */}
            <p className="text-center text-[10px] text-slate-600 font-mono leading-relaxed">
              By creating an account you agree to our{" "}
              <span className="text-primary cursor-pointer hover:underline">
                Terms
              </span>{" "}
              and{" "}
              <span className="text-primary cursor-pointer hover:underline">
                Privacy Policy
              </span>
            </p>

            {/* Login link */}
            <p className="text-center text-sm text-slate-500">
              Already on the network?{" "}
              <Link
                href="/login"
                className="text-primary font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
