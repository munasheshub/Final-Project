import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 sm:pt-20 pb-20 sm:pb-32 border-b border-primary/10 grid-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold mb-6">
          <span className="material-symbols-outlined text-xs">verified</span>
          MAINNET v4.2 LIVE
        </div>
        <h1 className="font-sans text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 leading-tight max-w-4xl mx-auto tracking-tight text-balance">
          Trust Your Credentials with{" "}
          <span className="text-primary">Blockchain</span> &{" "}
          <span className="text-secondary">AI</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-light text-muted-foreground">
          The future of secure, immutable, and AI-verified identity. Ensuring
          authenticity in every digital certificate with zero-knowledge proofs.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/verify"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            Verify Certificate
            <span className="material-symbols-outlined">verified</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            View Ledger
          </Link>
        </div>
      </div>
    </section>
  )
}
