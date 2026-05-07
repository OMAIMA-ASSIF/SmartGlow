import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ScanFace, Droplets, Sun, MessageCircle,
  ArrowRight, Star, Shield, Zap, CheckCircle2, ChevronRight,
  Instagram, Twitter, Linkedin
} from "lucide-react";

export const metadata = {
  title: "SmartGlow — Clinique Dermatologique IA",
  description: "Analyse IA de votre peau, scanner de produits, routine météo-adaptée. La première clinique dermatologique dans votre poche.",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">

      {/* ── Ambient background blobs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full bg-secondary/20 blur-[120px] opacity-50 animate-blob-2" />
        <div className="absolute -bottom-48 -left-48 w-[900px] h-[900px] rounded-full bg-primary/10 blur-[140px] opacity-35 animate-blob-1" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/15 blur-[110px] opacity-30" />
      </div>

      {/* ══════════════ NAVBAR ══════════════ */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-3">
        <nav className="glass mx-auto max-w-6xl rounded-2xl px-5 h-[62px] flex items-center justify-between shadow-glow">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative bg-gradient-to-br from-primary to-secondary p-1.5 rounded-xl shadow-md">
                <img src="/logo.png" alt="SmartGlow" className="h-7 w-7 object-contain" />
              </div>
            </div>
            <div className="leading-none">
              <span className="font-bold text-xl heading-font gradient-text">SmartGlow</span>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Dermatologie IA</p>
            </div>
          </Link>

          {/* Nav links – desktop */}
          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
            {[
              { label: "Fonctionnalités", href: "#features" },
              { label: "Comment ça marche", href: "#how" },
              { label: "Avis", href: "#testimonials" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-lg hover:text-foreground hover:bg-white/30 dark:hover:bg-white/5 transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="rounded-xl font-semibold hover:bg-white/40 dark:hover:bg-white/8 text-sm">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-xl font-semibold shadow-md shadow-primary/25 premium-button px-4">
                Démarrer gratuit
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 relative z-10 pt-[80px]">

        {/* ══════════════ HERO ══════════════ */}
        <section className="w-full min-h-[92vh] flex items-center py-20 lg:py-28 relative">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left – Text */}
              <div className="flex flex-col space-y-8 anim-slide-left">

                {/* Headline */}
                <div className="space-y-4">
                  <h1 className="font-bold leading-[1.08] tracking-tight">
                    Votre peau,{" "}
                    <span className="gradient-text">sublimée</span>
                    <br />
                    par l'intelligence
                    <br />
                    <span className="gradient-text">artificielle.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-[520px] font-medium">
                    SmartGlow analyse votre visage, scanne vos produits, et adapte votre routine à la météo en temps réel.
                    La première clinique dermatologique dans votre poche.
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="rounded-2xl h-14 px-8 text-base font-semibold shadow-xl shadow-primary/30
                                 hover:shadow-2xl hover:shadow-primary/40 premium-button w-full sm:w-auto"
                    >
                      Analyser ma peau maintenant
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="#how">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-2xl h-14 px-8 text-base font-semibold glass border-border/50
                                 hover:border-primary/40 hover:bg-white/40 dark:hover:bg-white/5 w-full sm:w-auto"
                    >
                      Comment ça marche
                      <ChevronRight className="h-4 w-4 ml-1.5 text-muted-foreground" />
                    </Button>
                  </Link>
                </div>

                {/* Trust row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
                  {[
                    { icon: Shield, label: "Données 100% sécurisées" },
                    { icon: CheckCircle2, label: "Cliniquement validé" },
                    { icon: Zap, label: "Résultats instantanés" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex -space-x-2">
                    {["F", "A", "S", "M"].map((l) => (
                      <div
                        key={l}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary
                                   flex items-center justify-center text-white text-xs font-bold
                                   border-2 border-background shadow-sm"
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5">+2 400 peaux analysées</p>
                  </div>
                </div>
              </div>

              {/* Right – Visual */}
              <div className="anim-slide-right delay-200 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/15 rounded-3xl blur-3xl opacity-70" />

                <div className="relative glass rounded-3xl overflow-hidden aspect-[4/5] max-w-[440px] mx-auto shadow-glow-strong">
                  {/* Main image */}
                  <img
                    src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=900&auto=format&fit=crop"
                    alt="Analyse de peau IA"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

                  {/* Scan line effect */}
                  <div className="scan-line" />

                  {/* Floating badge – UV */}
                  <div className="absolute top-5 right-5 glass-subtle rounded-2xl p-3.5 shadow-xl anim-fade-scale delay-300">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2.5 rounded-xl shadow-md">
                        <Sun className="w-4 h-4 text-white" />
                      </div>
                      <div className="leading-none">
                        <p className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider">Indice UV</p>
                        <p className="text-sm font-bold text-emerald-500 mt-0.5">Modéré · SPF requis</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating badge – Score */}
                  <div className="absolute bottom-5 left-5 glass-subtle rounded-2xl p-3.5 shadow-xl anim-fade-scale delay-400">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary
                                      flex items-center justify-center font-bold text-white text-xl shadow-lg">
                        92
                      </div>
                      <div className="leading-none">
                        <p className="text-sm font-bold text-foreground">Hydratation</p>
                        <p className="text-xs text-emerald-500 font-semibold mt-0.5">↑ +14% ce mois</p>
                      </div>
                    </div>
                  </div>

                  {/* AI badge */}
                  <div className="absolute bottom-5 right-5 glass-subtle rounded-xl px-3 py-2 shadow-lg anim-fade-scale delay-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[11px] font-semibold text-foreground/80">Analyse IA active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ LOGOS / SOCIAL PROOF BAR ══════════════ */}
        <section className="w-full py-10 relative overflow-hidden">
          <div className="premium-divider mb-10" />
          <div className="container px-4 mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-6">
              Technologie propulsée par
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale">
              {["Google Gemini AI", "Mistral AI", "OpenWeather", "Supabase", "Meta API"].map((tech) => (
                <span key={tech} className="text-sm font-bold text-muted-foreground tracking-tight">{tech}</span>
              ))}
            </div>
          </div>
          <div className="premium-divider mt-10" />
        </section>

        {/* ══════════════ FEATURES ══════════════ */}
        <section id="features" className="w-full py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            {/* Section header */}
            <div className="text-center mb-16 space-y-4">
              <span className="premium-badge">4 piliers essentiels</span>
              <h2 className="heading-font font-bold">
                Un écosystème complet pour<br />
                <span className="gradient-text">une peau parfaite</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                Chaque fonctionnalité a été conçue pour comprendre, protéger et sublimer votre épiderme au quotidien.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: ScanFace,
                  color: "from-blue-500 to-indigo-600",
                  shadow: "shadow-blue-500/25",
                  title: "Selfie Scanner IA",
                  description: "Analyse vos pores, hydratation et inflammations via l'IA visuelle avec diagnostic vocal personnalisé.",
                  badge: "Gemini Vision",
                  delay: "delay-100",
                },
                {
                  icon: Droplets,
                  color: "from-emerald-500 to-teal-600",
                  shadow: "shadow-emerald-500/25",
                  title: "Safe-Swap Scanner",
                  description: "Scannez les codes-barres pour détecter les conflits (Rétinol + Acides) et trouvez des alternatives saines.",
                  badge: "Mistral AI",
                  delay: "delay-200",
                },
                {
                  icon: Sun,
                  color: "from-amber-500 to-orange-600",
                  shadow: "shadow-amber-500/25",
                  title: "Climate-Sync",
                  description: "Votre routine s'adapte en temps réel à l'indice UV, l'humidité et la pollution de votre ville.",
                  badge: "OpenWeather",
                  delay: "delay-300",
                },
                {
                  icon: MessageCircle,
                  color: "from-violet-500 to-purple-600",
                  shadow: "shadow-violet-500/25",
                  title: "Coach WhatsApp",
                  description: "Recevez vos rappels de routine et rapports de progrès directement sur WhatsApp. Zéro fatigue app.",
                  badge: "Meta API",
                  delay: "delay-400",
                },
              ].map((feat) => (
                <div
                  key={feat.title}
                  className={`premium-card group anim-slide-bottom ${feat.delay} cursor-default`}
                >
                  {/* Icon */}
                  <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${feat.color} shadow-lg ${feat.shadow}
                                  flex items-center justify-center mb-5 p-3
                                  group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                    <feat.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Tech badge */}
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mb-2 block">
                    {feat.badge}
                  </span>

                  <h3 className="text-lg font-bold heading-font mb-2 text-foreground">{feat.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feat.description}</p>

                  {/* Bottom accent bar */}
                  <div className={`mt-5 h-0.5 bg-gradient-to-r ${feat.color} rounded-full
                                  opacity-0 group-hover:opacity-100 scale-x-0 group-hover:scale-x-100
                                  transition-all duration-400 origin-left`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ HOW IT WORKS ══════════════ */}
        <section id="how" className="w-full py-24 relative">
          {/* Dot grid bg */}
          <div className="absolute inset-0 dot-grid opacity-30 dark:opacity-10 pointer-events-none" />

          <div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10">
            <div className="text-center mb-16 space-y-4">
              <span className="premium-badge">Simple & Rapide</span>
              <h2 className="heading-font">
                Opérationnel en
                <span className="gradient-text"> 3 étapes</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-[17%] right-[17%] h-px bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30" />

              {[
                { step: "01", title: "Créez votre profil", desc: "Renseignez votre type de peau et préoccupations en 2 minutes. L'IA construit votre profil dermatologique." },
                { step: "02", title: "Faites votre selfie", desc: "Prenez une photo de votre visage. Gemini Vision analyse pores, texture et hydratation instantanément." },
                { step: "03", title: "Recevez votre routine", desc: "Une routine personnalisée, adaptée à la météo du jour, vous est envoyée sur WhatsApp chaque matin." },
              ].map((item, i) => (
                <div key={item.step} className={`text-center anim-fade-scale delay-${(i + 1) * 200}`}>
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl glass shadow-glow
                                  flex items-center justify-center relative z-10">
                    <span className="text-2xl font-bold heading-font gradient-text">{item.step}</span>
                  </div>
                  <h3 className="font-bold text-lg heading-font mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ TESTIMONIALS ══════════════ */}
        <section id="testimonials" className="w-full py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="text-center mb-14 space-y-4">
              <span className="premium-badge">Témoignages</span>
              <h2 className="heading-font">
                Des peaux <span className="gradient-text">transformées</span>
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  quote: "Je n'avais jamais compris pourquoi mes produits ne fonctionnaient pas ensemble. SmartGlow a détecté le conflit Rétinol-AHA en 5 secondes.",
                  author: "Fatima B.",
                  role: "Peau mixte-sensible",
                  rating: 5,
                },
                {
                  quote: "Le coach WhatsApp change tout. Je reçois mes rappels chaque matin avec la météo du jour. Mon écran solaire est enfin devenu un réflexe.",
                  author: "Sofia M.",
                  role: "Peau sèche",
                  rating: 5,
                },
                {
                  quote: "Le Climate-Sync est génial. En période de forte chaleur, l'IA a ajusté ma routine automatiquement. Ma peau n'a jamais été aussi bien hydratée.",
                  author: "Amira K.",
                  role: "Peau grasse",
                  rating: 5,
                },
              ].map((t) => (
                <div key={t.author} className="premium-card flex flex-col gap-4">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-foreground/85 text-sm leading-relaxed flex-1 italic">
                    "{t.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary
                                    flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {t.author[0]}
                    </div>
                    <div className="leading-none">
                      <p className="text-sm font-semibold">{t.author}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ CTA BAND ══════════════ */}
        <section className="w-full py-20 relative">
          <div className="container px-4 md:px-6 mx-auto max-w-5xl">
            <div className="relative glass rounded-3xl p-12 md:p-16 overflow-hidden text-center noise-overlay">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <span className="premium-badge"> Gratuit pour commencer</span>
                <h2 className="heading-font text-4xl md:text-5xl font-bold">
                  Prêt à transformer<br />
                  <span className="gradient-text">votre peau ?</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Rejoignez +2 400 utilisatrices qui ont déjà révolutionné leur routine de soins. Aucune carte bancaire requise.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="rounded-2xl h-14 px-10 text-base font-semibold shadow-xl shadow-primary/30
                                 hover:shadow-2xl hover:shadow-primary/40 premium-button"
                    >
                      Démarrer l'analyse gratuite
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-2xl h-14 px-10 text-base font-semibold glass border-border/50"
                    >
                      J'ai déjà un compte
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="relative z-10 border-t border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container px-4 md:px-8 mx-auto max-w-7xl py-14">
          <div className="grid gap-10 md:grid-cols-5 mb-12">
            {/* Brand col */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-br from-primary to-secondary p-1.5 rounded-xl shadow-md">
                  <img src="/logo.png" alt="SmartGlow" className="h-6 w-6 object-contain" />
                </div>
                <span className="font-bold text-lg heading-font gradient-text">SmartGlow</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                La dermatologie préventive réinventée par l'IA. Une clinique dans votre poche.
              </p>
              {/* Social icons */}
              <div className="flex gap-3 pt-1">
                {[
                  { Icon: Twitter, href: "#", label: "Twitter" },
                  { Icon: Instagram, href: "#", label: "Instagram" },
                  { Icon: Linkedin, href: "#", label: "LinkedIn" },
                ].map(({ Icon, href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-xl glass flex items-center justify-center
                               text-muted-foreground hover:text-primary hover:shadow-glow transition-all"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Links cols */}
            {[
              {
                title: "Produit",
                links: ["Fonctionnalités", "Tarifs", "Changelog", "Roadmap"],
              },
              {
                title: "Entreprise",
                links: ["À propos", "Blog", "Carrières", "Presse"],
              },
              {
                title: "Légal",
                links: ["Confidentialité", "Conditions", "Cookies", "RGPD"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-sm mb-4 tracking-wide">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="premium-divider mb-6" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 SmartGlow. Réalisé avec ❤️ par la team 404_brain. Tous droits réservés.</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium">Tous les services opérationnels</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
