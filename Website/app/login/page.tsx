"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import Link from "next/link"

function LoginContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const callbackUrlParam = searchParams.get("callbackUrl")
  
  // Use query param first, then sessionStorage fallback (survives Google OAuth redirect)
  const callbackUrl = callbackUrlParam 
    || (typeof window !== "undefined" ? sessionStorage.getItem("postLoginRedirect") : null) 
    || "/dashboard"

  useEffect(() => {
    if (status === "authenticated") {
      // Clear the stored redirect after using it
      sessionStorage.removeItem("postLoginRedirect")
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])

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

  const errorMessages: Record<string, string> = {
    AccessDenied:
      "Sign-in was denied. Please check your Google account and try again.",
    OAuthAccountNotLinked:
      "This email is already associated with another account.",
    OAuthSignin: "Could not start the Google sign-in flow. Please try again.",
    OAuthCallback:
      "Something went wrong during authentication. Please try again.",
    default: "An unexpected error occurred. Please try again.",
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0d12]">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12 bg-[#0c1018] border-r border-slate-800/60">
        {/* Grid dot background */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(13,127,242,0.18) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-secondary/8 rounded-full blur-[80px]" />

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
              Authenticate.
              <br />
              <span className="text-primary">Verify.</span>{" "}
              <span className="text-secondary">Trust.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Access the decentralized verification network. Your credentials
              are secured by blockchain immutability and AI-powered validation.
            </p>
          </div>

          {/* Live status terminal */}
          <div className="bg-[#080b10] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-2.5 max-w-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="ml-2 tracking-wider">system_status</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
              <span className="text-secondary">NETWORK</span>
              <span className="text-slate-600 ml-auto">mainnet-v4.2</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
              <span className="text-secondary">NODES</span>
              <span className="text-slate-600 ml-auto">12,847 active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-primary">AUTH</span>
              <span className="text-slate-600 ml-auto">
                awaiting credentials
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
              <span className="text-secondary">ENCRYPTION</span>
              <span className="text-slate-600 ml-auto">AES-256 + ZKP</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center gap-6 text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em]">
          <span>TLS 1.3</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          <span>OAuth 2.0</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          <span>Zero-Knowledge</span>
        </div>
      </div>

      {/* Right — login form */}
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold uppercase tracking-widest mb-5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Secure Authentication
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Sign In
              </h1>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Access your dashboard and verification network
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-red-400 text-lg mt-0.5 shrink-0">
                  error
                </span>
                <span className="text-red-300 text-sm">
                  {errorMessages[error] || errorMessages.default}
                </span>
              </div>
            )}

            {/* Google button */}
            <div className="space-y-4">
              <button
                onClick={() =>
                  signIn("google", { callbackUrl })
                }
                className="group w-full flex items-center gap-4 px-5 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-primary/40 rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(13,127,242,0.12)] active:scale-[0.98]"
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
                  <span className="block text-sm font-bold text-white group-hover:text-primary transition-colors">
                    Continue with Google
                  </span>
                  <span className="block text-[11px] text-slate-500 font-mono">
                    OAuth 2.0 secured
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-600 ml-auto text-xl group-hover:text-primary transition-colors">
                  arrow_forward
                </span>
              </button>
            </div>

            {/* Divider with blockchain hash style */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-800" />
              <span className="text-[10px] font-mono text-slate-600 tracking-wider">
                0xAUTH...CHAIN
              </span>
              <div className="flex-1 border-t border-slate-800" />
            </div>

            {/* Security badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-slate-900/50 border border-slate-800/60">
                <span className="material-symbols-outlined text-secondary text-lg">
                  lock
                </span>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  Encrypted
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-slate-900/50 border border-slate-800/60">
                <span className="material-symbols-outlined text-primary text-lg">
                  shield
                </span>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  Protected
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-slate-900/50 border border-slate-800/60">
                <span className="material-symbols-outlined text-secondary text-lg">
                  token
                </span>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                  On-Chain
                </span>
              </div>
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-slate-500">
              New to the network?{" "}
              <Link
                href="/signup"
                className="text-primary font-bold hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0d12]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Initializing...
            </span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
