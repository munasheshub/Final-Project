import { AppHeader } from "@/components/app-header"
import { HeroSection } from "@/components/hero-section"
import { VerificationEngine } from "@/components/verification-engine"
import { ScannerSection } from "@/components/scanner-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main>
        <HeroSection />
        <VerificationEngine />
        <ScannerSection />
      </main>
      <Footer />
    </div>
  )
}
