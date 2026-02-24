export function Footer() {
  return (
    <footer className="bg-[#0a0b0d] text-[#a0a0a0] py-16 font-mono">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">
                verified
              </span>
              <span className="text-white font-bold text-xl tracking-tight font-sans">
                Certify Chain
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-8 max-w-xs">
              High-performance blockchain and AI-driven credential verification.
              Secure, immutable, and reliable.
            </p>
            <div className="flex items-center gap-4 mb-6">
              <span className="material-symbols-outlined hover:text-white transition-colors cursor-pointer">
                terminal
              </span>
              <span className="material-symbols-outlined hover:text-white transition-colors cursor-pointer">
                hub
              </span>
            </div>
            <p className="text-xs text-[#666]">munashegandari34@gmail.com</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">
              DOCUMENTATION
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Quick Start
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  API Reference
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Format Spec
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">
              RESOURCES
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Downloads
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Examples
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Benchmarks
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">
              PROJECT
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  About
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  GitHub
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  License (MIT)
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-[#1a1c1e] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            &copy; 2026 Certify Chain Project. Released under MIT License.
          </p>
          <p className="text-xs">Built for the developer community</p>
        </div>
      </div>
    </footer>
  )
}
