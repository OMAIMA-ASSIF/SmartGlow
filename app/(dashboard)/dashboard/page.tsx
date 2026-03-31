import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScanFace, Droplets, CloudSun, Sparkles, MessageCircle, CheckCircle, AlertCircle, Package } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile, latest scan, routine, and WhatsApp status
  const [{ data: profile }, { data: latestScan }, { data: routine }] = await Promise.all([
    supabase.from('profiles').select('full_name, whatsapp_active, whatsapp_number').eq('user_id', user?.id).single(),
    supabase.from('scans').select('overall_score, created_at, pore_score').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('routines').select('morning_products, evening_products').eq('user_id', user?.id).single(),
  ])

  const firstName = profile?.full_name?.split(' ')[0] || "Belle"

  // Parse morning products from JSON
  const morningProducts: Array<{ name: string; brand?: string }> = (() => {
    const raw = routine?.morning_products
    if (!raw || !Array.isArray(raw)) return []
    return raw.map((p: any) =>
      typeof p === 'string' ? { name: p } : { name: p.name || p.product_name || 'Produit', brand: p.brand }
    ).filter(p => p.name)
  })()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight heading-font mb-2">Bonjour, {firstName} 💗</h2>
        <p className="text-muted-foreground">Voici l'état de votre peau et votre routine du jour.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Skin Health Summary Card */}
        <Card className="glass-panel border-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Score global
            </CardDescription>
            <CardTitle className="text-4xl heading-font">{latestScan?.overall_score || "--"}<span className="text-xl text-muted-foreground">/100</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mt-4">
              {latestScan ? `Dernier scan le ${new Date(latestScan.created_at).toLocaleDateString('fr-FR')}` : "Aucun scan effectué."}
            </div>
            <Link href="/scanner" className="block mt-6">
              <Button className="w-full rounded-xl" variant={latestScan ? "outline" : "default"}>
                {latestScan ? "Nouveau Scan" : "Faire mon premier scan"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Climate-Sync Card */}
        <Card className="glass-panel border-0 shadow-lg hover:-translate-y-1 transition-transform">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-amber-500" /> Climate-Sync
            </CardTitle>
            <CardDescription>Routine adaptée à la météo</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">Mettez à jour votre routine selon l'indice UV et la pollution actuelle.</p>
            <Link href="/climate">
              <Button variant="secondary" className="w-full rounded-xl text-amber-900 bg-amber-100 hover:bg-amber-200">
                Vérifier la météo
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Safe-Swap Card */}
        <Card className="glass-panel border-0 shadow-lg hover:-translate-y-1 transition-transform">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-emerald-500" /> Safe-Swap
            </CardTitle>
            <CardDescription>Analyse INCI experte & personnalisée</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">Un doute sur un produit ? Scannez le code-barres avant d'acheter.</p>
            <Link href="/products">
              <Button variant="secondary" className="w-full rounded-xl text-emerald-900 bg-emerald-100 hover:bg-emerald-200">
                Scanner un produit
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Real Morning Routine Card */}
        <Card className="glass-panel border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-rose-400" /> Ma Routine du Matin
            </CardTitle>
            <CardDescription>Produits validés par l'IA</CardDescription>
          </CardHeader>
          <CardContent>
            {morningProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl border-muted">
                <Package className="h-10 w-10 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">Votre routine matinale est vide.</p>
                <Link href="/products">
                  <Button variant="outline" size="sm" className="rounded-full">Ajouter des produits</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {morningProducts.slice(0, 4).map((product, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100/50">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                      <Droplets className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                      {product.brand && <p className="text-xs text-muted-foreground truncate">{product.brand}</p>}
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                ))}
                {morningProducts.length > 4 && (
                  <p className="text-xs text-center text-muted-foreground pt-1">+{morningProducts.length - 4} autres produits</p>
                )}
                <Link href="/products" className="block pt-2">
                  <Button variant="outline" size="sm" className="w-full rounded-full">Gérer ma routine</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Status + Progress Card */}
        <div className="space-y-4">
          {/* WhatsApp Status Widget */}
          <Card className="glass-panel border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile?.whatsapp_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <MessageCircle className={`w-5 h-5 ${profile?.whatsapp_active ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">SmartGlow Bot WhatsApp</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.whatsapp_active
                        ? `Actif — alertes auto activées`
                        : "Désactivé — activez pour recevoir les alertes météo"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile?.whatsapp_active ? (
                    <Badge className="bg-green-500 text-white rounded-full">
                      <CheckCircle className="w-3 h-3 mr-1" /> Actif
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="rounded-full">
                      <AlertCircle className="w-3 h-3 mr-1" /> Inactif
                    </Badge>
                  )}
                </div>
              </div>
              {!profile?.whatsapp_active && (
                <Link href="/settings" className="block mt-4">
                  <Button size="sm" className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white">
                    Activer les notifications WhatsApp
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card className="glass-panel border-0 shadow-md flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-primary" /> Évolution
              </CardTitle>
              <CardDescription>Vos progrès sur les 30 derniers jours</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed rounded-xl border-muted mx-4 mb-4">
              <p className="text-sm text-muted-foreground mb-4">Faites au moins 2 scans pour voir l'évolution.</p>
              <Link href="/scanner">
                <Button variant="outline" size="sm" className="rounded-full">Voir l'analyseur</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
