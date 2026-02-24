import Link from "next/link"

export function AppHeader() {
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
            href="/dashboard"
            className="hover:text-primary transition-colors"
          >
            Network
          </Link>
          <Link
            href="/mobile"
            className="hover:text-primary transition-colors"
          >
            Mobile Preview
          </Link>
          <span className="hover:text-primary transition-colors cursor-pointer">
            Registry
          </span>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-lg font-bold text-sm transition-all glow-border"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            Login
          </Link>
        </div>
      </div>
    </header>
  )
}
