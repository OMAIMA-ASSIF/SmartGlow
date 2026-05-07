import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ScanFace, Droplets, CloudSun, Sparkles, MessageCircle,
  CheckCircle, AlertCircle, Package, ArrowRight, TrendingUp,
  Flame, Calendar, Activity
} from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Dashboard | SmartGlow",
  description: "Votre tableau de bord dermatologique personnalisé.",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: latestScan }, { data: routine }] = await Promise.all([
    supabase.from('profiles').select('full_name, whatsapp_active, whatsapp_number').eq('user_id', user?.id).single(),
    supabase.from('scans').select('overall_score, created_at, pore_score').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('routines').select('morning_products, evening_products').eq('user_id', user?.id).single(),
  ])

  const firstName = profile?.full_name?.split(' ')[0] || "Belle"

  const morningProducts: Array<{ name: string; brand?: string }> = (() => {
    const raw = routine?.morning_products
    if (!raw || !Array.isArray(raw)) return []
    return raw
      .map((p: any) => typeof p === 'string' ? { name: p } : { name: p.name || p.product_name || 'Produit', brand: p.brand })
      .filter(p => p.name)
  })()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir"

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold heading-font">
            {greeting},{" "}
            <span className="gradient-text">{firstName}</span> 💗
          </h1>
          <p className="text-muted-foreground">Voici l'état de votre peau et votre routine du jour.</p>
        </div>

        <Link href="/scanner">
          <Button className="rounded-xl h-11 px-5 font-semibold shadow-lg shadow-primary/25 premium-button gap-2 shrink-0">
            <ScanFace className="h-4 w-4" />
            Nouveau scan
          </Button>
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          {
            label: "Score de peau",
            value: latestScan?.overall_score ? `${latestScan.overall_score}` : "—",
            suffix: latestScan?.overall_score ? "/100" : "",
            icon: Activity,
            gradient: "from-rose-500 to-pink-500",
            shadow: "shadow-rose-500/25",
            trend: "+5 pts",
            trendUp: true,
          },
          {
            label: "Pores",
            value: latestScan?.pore_score ? `${latestScan.pore_score}` : "—",
            suffix: latestScan?.pore_score ? "/100" : "",
            icon: Sparkles,
            gradient: "from-violet-500 to-purple-500",
            shadow: "shadow-violet-500/25",
            trend: "stable",
            trendUp: null,
          },
          {
            label: "Produits routines",
            value: morningProducts.length > 0 ? `${morningProducts.length}` : "0",
            suffix: " produits",
            icon: Droplets,
            gradient: "from-emerald-500 to-teal-500",
            shadow: "shadow-emerald-500/25",
            trend: "matin",
            trendUp: null,
          },
          {
            label: "Coach WhatsApp",
            value: profile?.whatsapp_active ? "Actif" : "Inactif",
            suffix: "",
            icon: MessageCircle,
            gradient: profile?.whatsapp_active ? "from-green-500 to-emerald-500" : "from-slate-400 to-slate-500",
            shadow: profile?.whatsapp_active ? "shadow-green-500/25" : "shadow-slate-400/15",
            trend: profile?.whatsapp_active ? "✓ connecté" : "à activer",
            trendUp: profile?.whatsapp_active,
          },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-sm ${stat.shadow} flex items-center justify-center`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold heading-font">
                {stat.value}
                <span className="text-sm font-medium text-muted-foreground ml-0.5">{stat.suffix}</span>
              </p>
              <p className={`text-xs font-medium mt-1 ${stat.trendUp === true ? 'text-emerald-500' : stat.trendUp === false ? 'text-rose-500' : 'text-muted-foreground'}`}>
                {stat.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Skin Score Card – large */}
        <div className="premium-card lg:col-span-1 group relative">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 blur-3xl opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/25 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm">Score Global</span>
              </div>
              {latestScan && (
                <Badge variant="outline" className="rounded-full text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3 h-3 mr-1" /> Analysé
                </Badge>
              )}
            </div>

            {/* Big score number */}
            <div className="text-center py-6">
              <div className="text-8xl font-bold heading-font gradient-text leading-none">
                {latestScan?.overall_score || "—"}
              </div>
              <p className="text-muted-foreground text-sm mt-2 font-medium">
                {latestScan?.overall_score ? "sur 100 • " : ""}
                {latestScan
                  ? `Scanné le ${new Date(latestScan.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
                  : "Aucun scan effectué"}
              </p>
            </div>

            <Link href="/scanner" className="block">
              <Button
                className="w-full rounded-xl h-11 font-semibold premium-button"
                variant={latestScan ? "outline" : "default"}
              >
                {latestScan ? "Faire un nouveau scan" : "Lancer mon premier scan"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: CloudSun,
              gradient: "from-amber-500 to-orange-500",
              shadow: "shadow-amber-500/25",
              title: "Climate-Sync",
              desc: "Routine adaptée à la météo, UV et pollution en temps réel",
              href: "/climate",
              cta: "Voir la météo",
            },
            {
              icon: Droplets,
              gradient: "from-emerald-500 to-teal-500",
              shadow: "shadow-emerald-500/25",
              title: "Safe-Swap",
              desc: "Analyse INCI experte avec détection des conflits d'ingrédients",
              href: "/products",
              cta: "Scanner un produit",
            },
            {
              icon: TrendingUp,
              gradient: "from-violet-500 to-purple-500",
              shadow: "shadow-violet-500/25",
              title: "Mes Progrès",
              desc: "Évolution de votre peau sur 30 jours avec graphiques détaillés",
              href: "/progress",
              cta: "Voir l'évolution",
            },
            {
              icon: MessageCircle,
              gradient: profile?.whatsapp_active ? "from-green-500 to-emerald-500" : "from-slate-400 to-slate-500",
              shadow: profile?.whatsapp_active ? "shadow-green-500/25" : "shadow-slate-400/15",
              title: "WhatsApp Bot",
              desc: profile?.whatsapp_active ? "Rappels actifs · Notifications intelligentes" : "Activez le coach vocal sur WhatsApp",
              href: "/settings",
              cta: profile?.whatsapp_active ? "Configurer" : "Activer",
            },
          ].map((card) => (
            <div key={card.title} className="glass-card p-5 flex flex-col gap-4 group">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} shadow-md ${card.shadow} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
              <Link href={card.href}>
                <Button variant="ghost" size="sm" className="w-full rounded-lg h-9 text-xs font-semibold hover:bg-white/50 dark:hover:bg-white/5 justify-between">
                  {card.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── Morning Routine ── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-md shadow-rose-500/25 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Ma Routine du Matin</h3>
              <p className="text-xs text-muted-foreground">Produits validés par l'IA SmartGlow</p>
            </div>
          </div>
          <Link href="/products">
            <Button variant="ghost" size="sm" className="rounded-xl text-xs font-semibold h-8 px-3">
              Gérer <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {morningProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/50 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-foreground/70 mb-1">Routine vide</p>
            <p className="text-xs text-muted-foreground mb-4">Scannez vos produits pour construire votre routine personnalisée.</p>
            <Link href="/products">
              <Button variant="outline" size="sm" className="rounded-xl text-xs h-9 px-4 font-semibold">
                Ajouter des produits
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {morningProducts.slice(0, 4).map((product, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-xl glass-subtle border border-border/40
                           hover:border-primary/30 hover:shadow-sm transition-all group/item"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/20">
                  <Droplets className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate leading-tight">{product.name}</p>
                  {product.brand && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{product.brand}</p>
                  )}
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 opacity-60 group-hover/item:opacity-100 transition-opacity" />
              </div>
            ))}
            {morningProducts.length > 4 && (
              <div className="flex items-center justify-center p-3.5 rounded-xl border-2 border-dashed border-border/40 text-xs text-muted-foreground font-semibold">
                +{morningProducts.length - 4} autres
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
