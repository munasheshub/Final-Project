/* eslint-disable @next/next/no-img-element */
export function VerificationEngine() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-sans text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-primary">01</span> The Verification Engine
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Our dual-layer security model ensures that every credential is not
            only authentic but also untampered through its entire lifecycle.
          </p>
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-3xl">
                  psychology
                </span>
                <div>
                  <h3 className="font-bold text-lg mb-1">AI Detection</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced neural networks detect tampering, deepfakes, and
                    verify visual authenticity in real-time using biometric
                    cross-referencing.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-xl border border-secondary/20 bg-secondary/5 hover:bg-secondary/10 transition-colors">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary text-3xl">
                  account_tree
                </span>
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    Blockchain Immutability
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Every record is cryptographically hashed and anchored to a
                    decentralized ledger, creating a permanent, audit-ready proof
                    of existence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1000"
              alt="Blockchain visualization"
              className="w-full h-auto rounded-lg opacity-80"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="size-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                Network Secure
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
