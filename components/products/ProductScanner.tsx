"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Search, ScanLine, Loader2, Sparkles, ShieldAlert,
  Zap, X, CheckCircle, RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import type { ProductAnalysisResult } from "@/lib/mistral"

export function ProductScanner() {
  const [inciText, setInciText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isScanningBarcode, setIsScanningBarcode] = useState(false)
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null)
  const [productData, setProductData] = useState<{ name: string; brand: string; inci: string } | null>(null)
  const [analysis, setAnalysis] = useState<ProductAnalysisResult | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); scanIntervalRef.current = null }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  useEffect(() => {
    if (!isScanningBarcode) { stopCamera(); return }
    let active = true
    const startScan = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
        const { BrowserMultiFormatReader } = await import("@zxing/library")
        const reader = new BrowserMultiFormatReader()
        if (videoRef.current) {
          scanIntervalRef.current = setInterval(() => {
            if (!videoRef.current || !active) return
            try {
              const result = reader.decode(videoRef.current)
              if (result && active) { setBarcodeResult(result.getText()); toast.success(`Code détecté : ${result.getText()}`) }
            } catch (e) { /* NotFoundException — normal */ }
          }, 400)
        }
      } catch (err: any) {
        if (active) { toast.error("Erreur d'accès à la caméra."); setIsScanningBarcode(false) }
      }
    }
    startScan()
    return () => { active = false; stopCamera() }
  }, [isScanningBarcode, stopCamera])

  const fetchProductFromOpenFoodFacts = async (barcode: string) => {
    setIsAnalyzing(true)
    try {
      const res = await fetch(`https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`)
      const data = await res.json()
      if (data.status === 1 && data.product) {
        const inci = data.product.ingredients_text_fr || data.product.ingredients_text || ""
        const name = data.product.product_name || "Produit Inconnu"
        const brand = data.product.brands || "Marque Inconnue"
        setProductData({ name, brand, inci })
        setInciText(inci)
        if (inci) await analyzeINCI(inci, name, brand, barcode)
        else { toast.warning("Ingrédients introuvables pour ce produit"); setIsAnalyzing(false) }
      } else { toast.error("Produit non répertorié dans Open Beauty Facts"); setIsAnalyzing(false) }
    } catch { toast.error("Erreur de récupération du produit"); setIsAnalyzing(false) }
  }

  const analyzeINCI = async (inci: string, name?: string, brand?: string, barcode?: string | null) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inci_list: inci, product_name: name, brand, barcode })
      })
      const data = await response.json()
      if (data.success) setAnalysis(data.analysis)
      else toast.error(data.error || "Erreur d'analyse")
    } catch { toast.error("Erreur d'analyse") }
    finally { setIsAnalyzing(false) }
  }

  const handleConfirmScan = () => {
    stopCamera(); setIsScanningBarcode(false)
    if (barcodeResult) fetchProductFromOpenFoodFacts(barcodeResult)
    else toast.error("Aucun code-barres détecté. Réessayez.")
  }

  const scoreColor = (s: number) => s >= 80 ? "bg-emerald-500" : s >= 50 ? "bg-amber-500" : "bg-rose-500"
  const scoreLabel = (s: number) => s >= 80 ? "Excellent" : s >= 50 ? "Modéré" : "Risqué"
  const scoreBadgeClass = (s: number) => s >= 80
    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
    : s >= 50 ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
    : "bg-rose-500/15 text-rose-600 border-rose-500/30"

  return (
    <div className="grid lg:grid-cols-[1fr_460px] gap-8 items-start">

      {/* ── Left – Input ── */}
      <div className="space-y-5">
        <Tabs defaultValue="manual" className="w-full">
          {/* Tab bar */}
          <TabsList className="w-full h-12 p-1 rounded-2xl glass border border-border/40 gap-1">
            <TabsTrigger
              value="manual"
              className="flex-1 h-full rounded-xl text-sm font-semibold gap-2
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary
                data-[state=active]:text-white data-[state=active]:shadow-md
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
            >
              <Zap className="w-4 h-4" /> Saisie INCI
            </TabsTrigger>
            <TabsTrigger
              value="scan"
              onClick={() => setBarcodeResult(null)}
              className="flex-1 h-full rounded-xl text-sm font-semibold gap-2
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary
                data-[state=active]:text-white data-[state=active]:shadow-md
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
            >
              <ScanLine className="w-4 h-4" /> Code-barres
            </TabsTrigger>
          </TabsList>

          {/* Manual INCI tab */}
          <TabsContent value="manual" className="mt-4 focus-visible:outline-none">
            <div className="glass-card p-6 space-y-4">
              <div>
                <h3 className="font-bold heading-font mb-1">Analyse INCI manuelle</h3>
                <p className="text-sm text-muted-foreground">Collez la liste d'ingrédients de votre produit ci-dessous.</p>
              </div>
              <Textarea
                placeholder="Aqua, Glycerin, Niacinamide, Retinol, Salicylic Acid..."
                className="min-h-[200px] resize-none rounded-2xl glass border-border/50
                           focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-sm"
                value={inciText}
                onChange={(e) => setInciText(e.target.value)}
                disabled={isAnalyzing}
              />
              {productData && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 glass-subtle rounded-xl border border-border/30">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span><strong>{productData.name}</strong> · {productData.brand}</span>
                </div>
              )}
              <Button
                className="w-full h-12 rounded-xl font-semibold shadow-md shadow-primary/20 premium-button"
                onClick={() => analyzeINCI(inciText, productData?.name, productData?.brand, barcodeResult)}
                disabled={isAnalyzing || !inciText.trim()}
              >
                {isAnalyzing
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyse en cours…</>
                  : <><Sparkles className="h-4 w-4 mr-2" /> Lancer l'analyse IA</>
                }
              </Button>
            </div>
          </TabsContent>

          {/* Barcode scan tab */}
          <TabsContent value="scan" className="mt-4 focus-visible:outline-none">
            <div className="glass-card overflow-hidden">
              {isScanningBarcode ? (
                <div className="relative bg-black min-h-[400px] flex flex-col rounded-[1.25rem] overflow-hidden">
                  <video ref={videoRef} className="w-full h-full object-cover flex-1" autoPlay playsInline muted />
                  {/* Scan line */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/80 shadow-[0_0_12px_rgba(194,75,102,0.8)] animate-[scanLine_2s_ease-in-out_infinite]" />
                  {/* Viewfinder */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-40 border-2 border-primary/60 rounded-xl">
                      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl-lg -translate-x-px -translate-y-px" />
                      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr-lg translate-x-px -translate-y-px" />
                      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl-lg -translate-x-px translate-y-px" />
                      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br-lg translate-x-px translate-y-px" />
                    </div>
                  </div>
                  {/* Detected badge */}
                  {barcodeResult && (
                    <div className="absolute top-4 inset-x-0 flex justify-center z-20 px-4">
                      <div className="glass-subtle rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-emerald-500">
                        <CheckCircle className="w-4 h-4" /> {barcodeResult}
                      </div>
                    </div>
                  )}
                  {/* Action buttons */}
                  <div className="absolute bottom-5 inset-x-0 flex gap-3 justify-center px-5 z-20">
                    <Button
                      onClick={() => { stopCamera(); setIsScanningBarcode(false) }}
                      variant="ghost"
                      size="icon"
                      className="w-11 h-11 rounded-xl glass-subtle text-white/80"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={handleConfirmScan}
                      className={`flex-1 max-w-xs h-11 rounded-xl font-semibold shadow-lg
                        ${barcodeResult
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                          : "bg-gradient-to-r from-primary to-secondary text-white"
                        }`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {barcodeResult ? "Analyser ce produit" : "Confirmer la capture"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-10 flex flex-col items-center justify-center text-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 flex items-center justify-center">
                    <ScanLine className="w-8 h-8 text-primary/60" />
                  </div>
                  <div>
                    <h3 className="font-bold heading-font mb-1">Scanner le code-barres</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Placez le code EAN-13 de votre produit cosmétique dans le cadre.
                    </p>
                  </div>
                  {barcodeResult && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      Dernier : {barcodeResult}
                    </div>
                  )}
                  <Button
                    onClick={() => { setBarcodeResult(null); setIsScanningBarcode(true) }}
                    className="rounded-xl h-11 px-6 font-semibold premium-button shadow-md shadow-primary/20"
                  >
                    Activer la caméra
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Right – Results ── */}
      <div>
        {!analysis ? (
          <div className="glass-card p-10 flex flex-col items-center justify-center text-center min-h-[340px] gap-5 border-2 border-dashed border-border/50">
            <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center">
              <Search className="w-7 h-7 text-muted-foreground/30" />
            </div>
            <div>
              <h3 className="font-bold heading-font text-lg mb-1">Prêt pour l'analyse</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
                Analyse personnalisée selon votre âge, type de peau et routine existante.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {["🧪 INCI Expert", "⚠️ Détection conflits", "🔄 Alternatives saines"].map(p => (
                <span key={p} className="premium-badge text-xs">{p}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 anim-fade-scale">
            {/* Score card */}
            <div className="glass-card overflow-hidden">
              {/* Dark header */}
              <div className="relative bg-gradient-to-br from-slate-900 to-rose-950 text-white p-6">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-300/60 mb-2">Clean Beauty Score</p>
                  <div className="flex items-end justify-between gap-4 mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl font-black heading-font">{analysis.safety_score}</span>
                      <span className="text-lg text-white/30">/100</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${scoreBadgeClass(analysis.safety_score)}`}>
                      {scoreLabel(analysis.safety_score)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${scoreColor(analysis.safety_score)}`}
                      style={{ width: `${analysis.safety_score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Summary */}
                <div className="bg-muted/30 p-4 rounded-2xl border border-border/30 relative">
                  <span className="text-4xl absolute -top-2 left-2 text-primary/10 font-serif leading-none">"</span>
                  <p className="text-sm italic leading-relaxed text-foreground/80 pt-2">{analysis.summary}</p>
                </div>

                {/* Conflict warning */}
                {analysis.conflict_warning && (
                  <div className="flex gap-3 p-4 rounded-2xl bg-rose-500/8 border border-rose-500/20 text-sm">
                    <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-600 dark:text-rose-400 mb-1">Alerte Routine</p>
                      <p className="text-foreground/80">{analysis.conflict_warning}</p>
                    </div>
                  </div>
                )}

                {/* Flagged ingredients */}
                {analysis.flagged_ingredients?.filter(i => i.safety !== 'safe').length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ingrédients à surveiller</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.flagged_ingredients.filter(i => i.safety !== 'safe').map((ing, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                            ing.safety === 'harmful'
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
                          }`}
                        >
                          {ing.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reset button */}
            <Button
              variant="ghost"
              className="w-full h-11 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/30
                         hover:bg-white/30 dark:hover:bg-white/5 text-muted-foreground text-sm font-semibold"
              onClick={() => { setAnalysis(null); setInciText(""); setProductData(null); setBarcodeResult(null) }}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Réinitialiser le scanner
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}