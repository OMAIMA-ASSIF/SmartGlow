import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ScanFace, Droplets, Sun, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-50 to-rose-300">
      {/* Navbar */}
      <header className="px-6 lg:px-14 h-20 flex items-center justify-between glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-xl">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-18 w-18 object-contain" 
            />
          </div>
          <span className="font-bold text-2xl heading-font tracking-tight">SmartGlow</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="rounded-full">Connexion</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 lg:py-32 relative overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

          <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px] items-center">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                    Nouvelle IA Dermatologique
                  </div>
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none heading-font">
                    Votre peau, redéfinie par{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">
                      l'Intelligence Artificielle
                    </span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                    SmartGlow analyse votre visage, scanne vos produits et adapte votre routine en temps réel selon la météo. La première clinique dermatologique dans votre poche.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="rounded-full h-14 px-8 text-base shadow-xl shadow-primary/25">
                      Faire mon premier scan gratuit
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                      Découvrir la magie
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 w-full max-w-[500px] aspect-square relative glass-panel rounded-3xl p-2 flex items-center justify-center bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-white/5">
                {/* Abstract UI representation */}
                
                <div className="w-full h-full rounded-2xl bg-muted/30 overflow-hidden relative border shadow-inner">
  
                  {/* L'IMAGE DE FOND */}
                  <img 
                    src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1000&auto=format&fit=crop" 
                    alt="Analyse visage"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* L'effet de scan (optionnel pour le style) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none"></div>

                  {/* TES BADGES EXISTANTS (ils restent au-dessus grâce au z-20) */}
                  <div className="absolute right-4 top-4 bg-white/80 dark:bg-black/80 backdrop-blur-md p-3 rounded-2xl shadow-lg flex items-center gap-3 z-20">
                    <div className="bg-green-100 p-2 rounded-full"><Sun className="w-5 h-5 text-green-600" /></div>
                    <div>
                      <p className="text-xs font-bold">Indice UV Modéré</p>
                      <p className="text-[10px] text-muted-foreground">Ajout du SPF 30</p>
                    </div>
                  </div>

                  <div className="absolute left-4 bottom-4 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-4 z-20">
                    <div className="w-12 h-12 rounded-full border-4 border-primary flex items-center justify-center font-bold text-primary">92</div>
                    <div>
                      <p className="text-sm font-bold">Score Hydratation</p>
                      <p className="text-xs text-green-600">+14% ce mois</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 bg-muted/40 relative">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl heading-font mb-4">4 piliers pour une peau parfaite</h2>
              <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
                Un écosystème complet qui comprend, protège et sublime votre épiderme au quotidien.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              
              <div className="glass-panel p-6 rounded-3xl group hover:-translate-y-2 transition-transform duration-300 ">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ScanFace className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 heading-font">Selfie Scanner IA</h3>
                <p className="text-muted-foreground text-sm">
                  Analyse vos pores, hydratation et inflammations via l'IA visuelle Gemini 1.5. Accompagné d'un diagnostic vocal chaleureux.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-3xl group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Droplets className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 heading-font">Safe-Swap Scanner</h3>
                <p className="text-muted-foreground text-sm">
                  Scannez les codes-barres (INCI) pour détecter les perturbateurs ou conflits (ex: Rétinol + Acides) et trouvez des alternatives saines.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-3xl group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sun className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 heading-font">Climate-Sync</h3>
                <p className="text-muted-foreground text-sm">
                  Votre routine s'adapte en temps réel à l'indice UV, l'humidité et la pollution (PM2.5) de votre ville.
                </p>
              </div>

              <div className="glass-panel p-6 rounded-3xl group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 heading-font">Coach WhatsApp</h3>
                <p className="text-muted-foreground text-sm">
                  Évitez la fatigue applicative. Recevez vos rappels de routine et vos rapports de progrès visuels directement sur WhatsApp.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-5">
        <div className="container md:px-6 mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-10 w-10 object-contain" 
            />
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 SmartGlow Réalisé par 404_brain team. Tous droits réservés. | <Link href="/privacy" className="underline hover:text-primary">Politique de confidentialité</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
