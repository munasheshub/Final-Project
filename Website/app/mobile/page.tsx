import Link from "next/link"

export default function MobileDashboardPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background overflow-x-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-card/50 border-b border-border sticky top-0 z-10 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-foreground text-2xl">
              verified
            </span>
          </div>
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            Certify Chain
          </h2>
        </Link>
        <button className="text-muted-foreground p-2">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        {/* Profile Card */}
        <section className="p-4">
          <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
            <div
              className="size-16 rounded-full bg-muted bg-cover bg-center ring-2 ring-primary/20"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200")',
              }}
            />
            <div className="flex flex-col">
              <p className="text-foreground text-lg font-bold">Alex Thompson</p>
              <p className="text-muted-foreground text-sm font-mono">
                alex.t@certifychain.io
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
                  Premium Member
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Certificate + Stats */}
        <section className="p-4 space-y-4">
          <div className="flex flex-col rounded-xl overflow-hidden border border-border bg-card shadow-sm">
            <div
              className="h-40 bg-muted bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1549489271-f9260c679905?auto=format&fit=crop&q=80&w=1000")',
              }}
            />
            <div className="p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">
                    Current Result
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-foreground">
                      Authentic
                    </p>
                    <span className="material-symbols-outlined text-emerald-500">
                      check_circle
                    </span>
                  </div>
                </div>
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20">
                  View NFT
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs font-mono">
                    TX HASH
                  </span>
                  <span className="text-foreground text-xs font-mono bg-accent px-2 py-1 rounded">
                    0x7f3...a92b
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs font-mono">
                    BLOCK
                  </span>
                  <span className="text-foreground text-xs font-mono">
                    14,289,402
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-primary rounded-xl p-5 text-primary-foreground shadow-xl shadow-primary/30 relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <p className="text-primary-foreground text-sm font-medium opacity-80">
                  Total Scans
                </p>
                <h3 className="text-4xl font-bold mt-1 font-mono">1,284</h3>
              </div>
              <div className="size-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-foreground">
                  analytics
                </span>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 size-32 bg-white/10 rounded-full blur-2xl" />
          </div>
        </section>

        {/* Recent Verifications */}
        <section className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">
              Recent Verifications
            </h3>
            <span className="text-primary text-sm font-semibold cursor-pointer">
              View All
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-card p-3 rounded-xl border border-border">
              <div
                className="size-12 rounded-lg bg-muted bg-cover bg-center shrink-0"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1523170335258-f5ed11844a1b?auto=format&fit=crop&q=80&w=200")',
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-bold truncate">
                  Rolex Submariner Date
                </p>
                <p className="text-muted-foreground text-xs font-mono">
                  2 mins ago - Verified
                </p>
              </div>
              <span className="material-symbols-outlined text-emerald-500 text-xl">
                check_circle
              </span>
            </div>
            <div className="flex items-center gap-4 bg-card p-3 rounded-xl border border-border">
              <div
                className="size-12 rounded-lg bg-muted bg-cover bg-center shrink-0"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200")',
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-bold truncate">
                  Birkin 30 Epsom Blue
                </p>
                <p className="text-muted-foreground text-xs font-mono">
                  1 hour ago - Verified
                </p>
              </div>
              <span className="material-symbols-outlined text-emerald-500 text-xl">
                check_circle
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border px-6 py-3 z-20">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <span className="flex flex-col items-center gap-1 text-primary cursor-pointer">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Home
            </span>
          </span>
          <span className="flex flex-col items-center gap-1 text-muted-foreground cursor-pointer">
            <span className="material-symbols-outlined">history</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              History
            </span>
          </span>
          <div className="relative -top-8">
            <button className="bg-primary text-primary-foreground size-14 rounded-full shadow-xl shadow-primary/40 flex items-center justify-center border-4 border-background">
              <span className="material-symbols-outlined text-3xl">
                qr_code_scanner
              </span>
            </button>
          </div>
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-muted-foreground"
          >
            <span className="material-symbols-outlined">database</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Assets
            </span>
          </Link>
          <span className="flex flex-col items-center gap-1 text-muted-foreground cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Settings
            </span>
          </span>
        </div>
      </nav>
    </div>
  )
}
