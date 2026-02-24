export function ScannerSection() {
  return (
    <section className="py-24 bg-muted border-y border-border">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-sans text-3xl font-bold mb-4 text-foreground">
          Instant Verification
        </h2>
        <p className="text-muted-foreground mb-12">
          Point your camera at a certificate&apos;s QR code to begin the
          AI-driven validation process.
        </p>
        <div className="relative max-w-md mx-auto aspect-square bg-[#000000] rounded-3xl border-4 border-slate-800 overflow-hidden flex flex-col items-center justify-center gap-6 group hover:border-primary/50 transition-colors">
          <div className="absolute inset-8 border border-primary/30 rounded-2xl animate-scan-pulse pointer-events-none" />
          <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-primary rounded-tl-lg" />
          <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-primary rounded-tr-lg" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-primary rounded-bl-lg" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-primary rounded-br-lg" />

          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-full border border-primary/20">
            <div className="size-1.5 bg-secondary rounded-full animate-pulse" />
            <span className="text-[10px] text-slate-300 font-mono uppercase tracking-[0.2em]">
              Scanning for AI tampering...
            </span>
          </div>

          <div className="z-10 flex flex-col items-center gap-8">
            <div className="relative">
              <span className="material-symbols-outlined text-7xl text-slate-600/50 group-hover:text-primary/40 transition-colors duration-500">
                qr_code_2
              </span>
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <button className="relative px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(13,127,242,0.4)]">
              <span className="relative z-10 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">
                  photo_camera
                </span>
                Open Camera
              </span>
            </button>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest opacity-60">
              E2E Encrypted Protocol
            </p>
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent -translate-y-full group-hover:scan-line-anim" />
        </div>
      </div>
    </section>
  )
}
