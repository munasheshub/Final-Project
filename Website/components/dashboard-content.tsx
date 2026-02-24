/* eslint-disable @next/next/no-img-element */
export function DashboardContent() {
  return (
    <main className="flex-1 overflow-y-auto">
      <header className="h-16 border-b border-border flex items-center justify-between px-8 sticky top-0 bg-card/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Pages
          </span>
          <span className="text-border">/</span>
          <span className="text-sm font-bold">Profile Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-[20px]">
              search
            </span>
            <input
              className="pl-10 pr-4 py-1.5 rounded-lg border border-border bg-card text-xs font-mono outline-none w-64"
              placeholder="Search hash..."
              type="text"
            />
          </div>
          <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground">
            <span className="material-symbols-outlined text-[20px]">
              notifications
            </span>
          </button>
        </div>
      </header>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        {/* Profile + Stats Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-card rounded-xl p-6 border border-border shadow-sm flex items-center gap-8">
            <div className="relative">
              <div className="h-32 w-32 rounded-2xl overflow-hidden ring-4 ring-card shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                  className="h-full w-full object-cover"
                  alt="Alex Thompson"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-500 rounded-full border-4 border-card flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[16px]">
                  check
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold font-sans">Alex Thompson</h2>
                <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest font-mono">
                  Premium Member
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-tighter">
                    Unique Identifier
                  </p>
                  <p className="text-sm font-mono">CC-98234-XJ-2024</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-tighter">
                    Location
                  </p>
                  <p className="text-sm font-mono">San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-primary rounded-xl p-6 text-primary-foreground flex flex-col justify-between overflow-hidden relative group shadow-xl shadow-primary/20">
            <div className="absolute -right-8 -top-8 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            <div>
              <p className="text-xs font-mono opacity-80 mb-1">Total Scans</p>
              <h3 className="text-4xl font-bold font-sans">1,284</h3>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span>Verification Integrity</span>
                <span>99.9%</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[99.9%]" />
              </div>
            </div>
            <button className="mt-4 w-full py-2 bg-white text-primary rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>{" "}
              New Verification
            </button>
          </div>
        </section>

        {/* Recent Verifications Table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-sans">
              Recent Verifications
            </h3>
            <button className="text-primary text-xs font-bold hover:underline">
              View All Logs
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent border-b border-border">
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground font-mono">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground font-mono">
                    Certificate Name
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground font-mono">
                    Hash ID
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold text-muted-foreground font-mono">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium">Oct 24, 2024</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      14:22:10
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold">
                      University Degree - CS
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Stanford University
                    </p>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground">
                    0x4a2e...f82a
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase font-mono">
                      <span className="material-symbols-outlined text-[14px]">
                        check_circle
                      </span>{" "}
                      Verified
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium">Oct 22, 2024</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      09:15:44
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold">
                      AWS Certified Architect
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Amazon Web Services
                    </p>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground">
                    0x91d2...c10b
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase font-mono">
                      <span className="material-symbols-outlined text-[14px]">
                        warning
                      </span>{" "}
                      AI Warning
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
