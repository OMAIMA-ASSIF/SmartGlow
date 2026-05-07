"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp, Sparkles, RefreshCcw, Camera, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function ProgressReport() {
  const [scans, setScans] = useState<any[]>([])
  const [report, setReport] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => { fetchHistory() }, [])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/progress-report")
      const data = await res.json()
      if (data.scans) setScans(data.scans)
    } catch { toast.error("Erreur chargement de l'historique") }
    finally { setIsLoading(false) }
  }

  const generateReport = async () => {
    if (scans.length < 2) { toast.error("Il faut au moins 2 scans pour générer un rapport comparatif."); return }
    setIsGenerating(true)
    try {
      const res = await fetch("/api/progress-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scan_id_start: scans[0].id, scan_id_end: scans[scans.length - 1].id })
      })
      const data = await res.json()
      if (data.success) {
        setReport({ startScan: scans[0], endScan: scans[scans.length - 1], improvements: data.improvements, motivation: data.motivational_message })
        toast.success("Rapport généré avec succès !")
      } else throw new Error(data.error)
    } catch (e: any) { toast.error(e.message || "Erreur de génération du rapport") }
    finally { setIsGenerating(false) }
  }

  const chartData = scans.map(s => ({
    date: format(new Date(s.created_at), 'dd MMM', { locale: fr }),
    "Score Global": s.overall_score,
    "Hydratation": s.hydration_score,
  }))

  if (isLoading) {
    return (
      <div className="glass-card p-16 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Chargement de votre historique…</p>
      </div>
    )
  }

  if (scans.length === 0) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px] gap-5">
        <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center">
          <Camera className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <div>
          <h3 className="font-bold heading-font text-xl mb-1">Aucun scan trouvé</h3>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Utilisez le Selfie Scanner IA pour initier votre suivi dermatologique et visualiser votre progression.
          </p>
        </div>
        <Button
          onClick={() => window.location.href = '/scanner'}
          className="rounded-xl h-11 px-6 font-semibold premium-button shadow-md shadow-primary/20 gap-2"
        >
          Faire mon premier scan <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Chart card ── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-md shadow-violet-500/25 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold heading-font">Évolution clinique</h3>
              <p className="text-xs text-muted-foreground">Suivi de vos métriques IA dans le temps</p>
            </div>
          </div>
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-primary rounded-full" />
              Score Global
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-blue-500 rounded-full border-dashed" style={{ borderBottom: '2px dashed #3b82f6', height: 0 }} />
              <div className="w-4 border-b-2 border-dashed border-blue-500" />
              Hydratation
            </div>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                dx={-8}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--card))',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  fontSize: '12px',
                }}
                labelStyle={{ fontWeight: 700, color: 'hsl(var(--foreground))' }}
              />
              <Line
                type="monotone"
                dataKey="Score Global"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                activeDot={{ r: 7, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }}
              />
              <Line
                type="monotone"
                dataKey="Hydratation"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Scan history mini-list ── */}
      <div className="glass-card p-6">
        <h3 className="font-bold heading-font mb-4">Historique des scans</h3>
        <div className="space-y-3">
          {scans.slice(0, 5).map((scan, idx) => (
            <div key={scan.id} className="flex items-center justify-between p-3.5 glass-subtle rounded-xl border border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold text-primary">
                  #{scans.length - idx}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {format(new Date(scan.created_at), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(scan.created_at), 'HH:mm')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {scan.overall_score && (
                  <div className="text-right">
                    <p className="text-lg font-bold heading-font gradient-text">{scan.overall_score}</p>
                    <p className="text-[10px] text-muted-foreground">/ 100</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {scans.length > 5 && (
            <p className="text-xs text-center text-muted-foreground pt-1 font-medium">
              +{scans.length - 5} scans supplémentaires
            </p>
          )}
        </div>
      </div>

      {/* ── Generate report button ── */}
      {!report && (
        <div className="flex justify-center py-4">
          <Button
            size="lg"
            onClick={generateReport}
            disabled={scans.length < 2 || isGenerating}
            className="rounded-2xl h-13 px-8 font-semibold shadow-lg shadow-primary/25 premium-button gap-2"
          >
            {isGenerating
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Génération du rapport…</>
              : scans.length < 2
                ? <><Sparkles className="w-5 h-5" /> 2 scans requis pour comparer</>
                : <><RefreshCcw className="w-5 h-5" /> Générer le bilan Avant/Après IA</>
            }
          </Button>
        </div>
      )}

      {/* ── Report result ── */}
      {report && (
        <div className="space-y-5 anim-slide-bottom">
          {/* Motivation message */}
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/6 to-secondary/4 rounded-[1.25rem] pointer-events-none" />
            <div className="relative z-10 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold heading-font mb-2">Message de votre Coach IA</h3>
                <p className="text-sm italic text-foreground/80 leading-relaxed border-l-2 border-primary/30 pl-3">
                  "{report.motivation}"
                </p>
              </div>
            </div>
          </div>

          {/* Score improvements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Score Global", key: "overall", color: (v: number) => v >= 0 ? "text-emerald-500" : "text-rose-500" },
              { label: "Hydratation", key: "hydration", color: (v: number) => v >= 0 ? "text-blue-500" : "text-rose-500" },
              { label: "Pores", key: "pore", color: (v: number) => v >= 0 ? "text-amber-500" : "text-rose-500" },
              { label: "Inflammation", key: "inflammation", color: (v: number) => v <= 0 ? "text-emerald-500" : "text-rose-500" },
            ].map(({ label, key, color }) => {
              const val = report.improvements[key]
              return (
                <div key={key} className="glass-card p-4 flex flex-col items-center text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
                  <p className={`text-3xl font-black heading-font ${color(val)}`}>
                    {val > 0 ? "+" : ""}{val}%
                  </p>
                </div>
              )
            })}
          </div>

          {/* Before / After images */}
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { label: "AVANT", scan: report.startScan, colorClass: "bg-muted/40 text-muted-foreground border-b border-border/40" },
              { label: "APRÈS", scan: report.endScan, colorClass: "bg-primary/8 text-primary border-b border-primary/20" },
            ].map(({ label, scan, colorClass }) => (
              <div key={label} className="glass-card overflow-hidden">
                <div className={`py-3 text-center text-sm font-bold tracking-wider ${colorClass}`}>
                  {label} · {format(new Date(scan.created_at), 'dd MMM yyyy', { locale: fr })}
                </div>
                <div className="aspect-[3/4] relative bg-muted/20">
                  {scan.image_url ? (
                    <img src={scan.image_url} alt={label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/40">
                      <Camera className="w-8 h-8" />
                      <p className="text-xs">Image non sauvegardée</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
