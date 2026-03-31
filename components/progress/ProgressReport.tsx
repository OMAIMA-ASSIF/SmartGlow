"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, Sparkles, RefreshCcw, Camera } from "lucide-react"
import { toast } from "sonner"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function ProgressReport() {
  const [scans, setScans] = useState<any[]>([])
  const [report, setReport] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/progress-report")
      const data = await res.json()
      if (data.scans) setScans(data.scans)
    } catch (e) {
      toast.error("Erreur chargement de l'historique")
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = async () => {
    if (scans.length < 2) {
      toast.error("Il faut au moins 2 scans pour générer un rapport comparatif.")
      return
    }

    setIsGenerating(true)
    try {
      // Comparer le premier et le dernier par défaut
      const startScan = scans[0]
      const endScan = scans[scans.length - 1]

      const res = await fetch("/api/progress-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scan_id_start: startScan.id,
          scan_id_end: endScan.id
        })
      })

      const data = await res.json()
      if (data.success) {
        setReport({
          startScan, 
          endScan, 
          improvements: data.improvements, 
          motivation: data.motivational_message
        })
        toast.success("Rapport généré avec succès !")
      } else {
        throw new Error(data.error)
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur de génération du rapport")
    } finally {
      setIsGenerating(false)
    }
  }

  // Formatting for Recharts
  const chartData = scans.map(s => ({
    date: format(new Date(s.created_at), 'dd MMM', { locale: fr }),
    fullDate: new Date(s.created_at).toLocaleDateString(),
    "Score Global": s.overall_score,
    "Hydratation": s.hydration_score,
    "Inflammation": s.inflammation_score
  }))

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  if (scans.length === 0) {
    return (
      <Card className="glass-panel border-0 shadow-sm text-center p-12 h-full flex flex-col items-center justify-center">
        <Camera className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-bold mb-2">Aucun scan trouvé</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">Utilisez le Selfie Scanner IA pour initier votre suivi dermatologique.</p>
        <Button onClick={() => window.location.href = '/scanner'} className="rounded-xl shadow-lg shadow-primary/20">
          Faire mon premier scan
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Chart Section */}
      <Card className="glass-panel border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="heading-font text-2xl">Evolution Clinique</CardTitle>
          <CardDescription>Suivi de vos métriques IA dans le temps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dx={-10} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#888' }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="Score Global" 
                  stroke="var(--theme-primary, #C8506B)" 
                  strokeWidth={4} 
                  dot={{ r: 5, strokeWidth: 2 }} 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="Hydratation" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Comparative Report Action */}
      {!report && (
        <div className="flex justify-center py-6">
          <Button 
            size="lg" 
            onClick={generateReport} 
            disabled={scans.length < 2 || isGenerating}
            className="rounded-full shadow-2xl h-14 px-8 bg-gradient-to-r from-primary to-rose-400 hover:scale-105 transition-transform"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <RefreshCcw className="w-5 h-5 mr-3" />}
            {scans.length < 2 ? "2 scans requis pour comparer" : "Générer Bilan Avant/Après (Mistral IA)"}
          </Button>
        </div>
      )}

      {/* Comparative View */}
      {report && (
         <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 space-y-6">
            <Card className="glass-panel border-0 shadow-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-8">
                  <div className="bg-primary/10 p-3 rounded-full shrink-0">
                    <Sparkles className="w-6 h-6 text-primary"/>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold heading-font mb-2">Message de votre Coach IA</h3>
                    <p className="text-lg italic text-muted-foreground leading-relaxed border-l-4 border-primary/40 pl-4 py-1">"{report.motivation}"</p>
                  </div>
                </div>

                {/* Score Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white/50 dark:bg-black/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Score Global</span>
                    <span className={`text-3xl font-bold heading-font ${report.improvements.overall >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                      {report.improvements.overall > 0 ? "+" : ""}{report.improvements.overall}%
                    </span>
                  </div>
                  <div className="bg-white/50 dark:bg-black/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Hydratation</span>
                    <span className={`text-3xl font-bold heading-font ${report.improvements.hydration >= 0 ? "text-blue-500" : "text-destructive"}`}>
                      {report.improvements.hydration > 0 ? "+" : ""}{report.improvements.hydration}%
                    </span>
                  </div>
                  <div className="bg-white/50 dark:bg-black/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Pores</span>
                    <span className={`text-3xl font-bold heading-font ${report.improvements.pore >= 0 ? "text-amber-500" : "text-destructive"}`}>
                     {report.improvements.pore > 0 ? "+" : ""}{report.improvements.pore}%
                    </span>
                  </div>
                  <div className="bg-white/50 dark:bg-black/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Inflammation</span>
                    <span className={`text-3xl font-bold heading-font ${report.improvements.inflammation >= 0 ? "text-rose-500" : "text-emerald-500"}`}>
                      {report.improvements.inflammation > 0 ? "+" : ""}{report.improvements.inflammation}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images showcase side by side */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-panel overflow-hidden border-0">
                <CardHeader className="bg-muted/40 py-3 text-center border-b">
                   <CardTitle className="text-base">AVANT • {format(new Date(report.startScan.created_at), 'dd MMM yyyy')}</CardTitle>
                </CardHeader>
                <div className="aspect-[3/4] relative bg-black">
                  {report.startScan.image_url ? (
                    <img src={report.startScan.image_url} alt="Avant" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">Image non sauvegardée</div>
                  )}
                </div>
              </Card>

              <Card className="glass-panel overflow-hidden border-0">
                <CardHeader className="bg-primary/10 py-3 text-center border-b">
                   <CardTitle className="text-base text-primary">APRÈS • {format(new Date(report.endScan.created_at), 'dd MMM yyyy')}</CardTitle>
                </CardHeader>
                <div className="aspect-[3/4] relative bg-black">
                  {report.endScan.image_url ? (
                    <img src={report.endScan.image_url} alt="Après" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">Image non sauvegardée</div>
                  )}
                </div>
              </Card>
            </div>
         </div>
      )}
    </div>
  )
}
