import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">

      {/* ── Left panel (branding) – hidden on mobile ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-secondary/10 to-accent/8" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-secondary/20 blur-[120px] opacity-50 animate-blob-2 pointer-events-none" />
        <div className="absolute -bottom-32 right-0 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[100px] opacity-40 animate-blob-1 pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

        {/* Top – logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-xl shadow-md">
                <img src="/logo.png" alt="SmartGlow" className="h-7 w-7 object-contain" />
              </div>
            </div>
            <div className="leading-none">
              <span className="font-bold text-xl heading-font gradient-text">SmartGlow</span>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase mt-0.5">Dermatologie IA</p>
            </div>
          </Link>
        </div>

        {/* Center – hero visual */}
        <div className="relative z-10 flex flex-col items-start space-y-10">
          {/* Big quote */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold heading-font leading-tight">
              Votre peau mérite<br />
              <span className="gradient-text">le meilleur</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-sm leading-relaxed">
              Analyse IA · Scanner produits · Routine météo-adaptée · Coach WhatsApp
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {[
              "🔬 Analyse IA en temps réel",
              "☀️ Climate-Sync",
              "📱 Coach WhatsApp",
              "🛡️ Données sécurisées",
            ].map((pill) => (
              <span key={pill} className="premium-badge text-xs">{pill}</span>
            ))}
          </div>

          {/* Testimonial card */}
          <div className="glass rounded-2xl p-5 max-w-sm shadow-glow">
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-400 text-sm">★</span>
              ))}
            </div>
            <p className="text-sm text-foreground/80 italic leading-relaxed mb-3">
              "SmartGlow a détecté un conflit entre mon sérum et ma crème en 5 secondes. Ma peau n'a jamais été aussi bien."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">F</div>
              <div className="leading-none">
                <p className="text-xs font-semibold">Fatima B.</p>
                <p className="text-[10px] text-muted-foreground">Peau mixte-sensible</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-xs text-muted-foreground">
          © 2026 SmartGlow · 404_brain team
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-5 lg:p-10 relative">
        {/* Ambient blobs – mobile only */}
        <div className="lg:hidden absolute -top-20 -right-20 w-80 h-80 rounded-full bg-secondary/20 blur-[80px] opacity-50 animate-blob-2 pointer-events-none" />
        <div className="lg:hidden absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary/10 blur-[80px] opacity-40 animate-blob-1 pointer-events-none" />

        {/* Logo – mobile only */}
        <div className="lg:hidden absolute top-5 left-1/2 -translate-x-1/2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative bg-gradient-to-br from-primary to-secondary p-1.5 rounded-lg shadow-md">
                <img src="/logo.png" alt="SmartGlow" className="h-5 w-5 object-contain" />
              </div>
            </div>
            <span className="font-bold heading-font gradient-text">SmartGlow</span>
          </Link>
        </div>

        {/* Form card */}
        <div className="w-full max-w-[420px] relative z-10 anim-fade-scale">
          <div className="glass-card p-8 md:p-10 relative">
            {/* Gradient accent top line */}
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />

            {children}
          </div>

          {/* Back to home link */}
          <div className="mt-5 text-center">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
