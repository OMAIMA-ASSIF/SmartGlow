"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, AlertTriangle, CheckCircle, Search, ScanLine, Loader2, Sparkles, ShieldAlert, Zap, X } from "lucide-react"
import { toast } from "sonner"
import type { ProductAnalysisResult } from "@/lib/mistral"

export function ProductScanner() {
  const [inciText, setInciText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isScanningBarcode, setIsScanningBarcode] = useState(false)
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null)
  const [productData, setProductData] = useState<{name: string, brand: string, inci: string} | null>(null)
  const [analysis, setAnalysis] = useState<ProductAnalysisResult | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // Start camera + ZXing barcode scan loop
  useEffect(() => {
    if (!isScanningBarcode) {
      stopCamera()
      return
    }

    let active = true

    const startScan = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        // Dynamic import to avoid SSR issues
        const { BrowserMultiFormatReader } = await import("@zxing/library")
        const reader = new BrowserMultiFormatReader()

        if (videoRef.current) {
          scanIntervalRef.current = setInterval(() => {
            if (!videoRef.current || !active) return
            try {
              const result = reader.decode(videoRef.current)
              if (result && active) {
                setBarcodeResult(result.getText())
                toast.success(`Code détecté : ${result.getText()}`)
              }
            } catch (e) {
              // NotFoundException means no barcode yet — normal, keep scanning
            }
          }, 400)
        }
      } catch (err: any) {
        if (active) {
          toast.error("Erreur d'accès à la caméra. Vérifiez les permissions.")
          setIsScanningBarcode(false)
        }
      }
    }

    startScan()

    return () => {
      active = false
      stopCamera()
    }
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
        else {
          toast.warning("Ingrédients introuvables pour ce produit")
          setIsAnalyzing(false)
        }
      } else {
        toast.error("Produit non répertorié dans Open Beauty Facts")
        setIsAnalyzing(false)
      }
    } catch (error) {
      toast.error("Erreur de récupération du produit")
      setIsAnalyzing(false)
    }
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
    } catch (error) {
      toast.error("Erreur d'analyse")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSafetyBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-emerald-500 hover:bg-emerald-600 rounded-full px-4">Excellent</Badge>
    if (score >= 50) return <Badge className="bg-amber-500 hover:bg-amber-600 rounded-full px-4">Modéré</Badge>
    return <Badge className="bg-rose-500 hover:bg-rose-600 rounded-full px-4">Risqué</Badge>
  }

  const handleConfirmScan = () => {
    stopCamera()
    setIsScanningBarcode(false)
    if (barcodeResult) {
      fetchProductFromOpenFoodFacts(barcodeResult)
    } else {
      toast.error("Aucun code-barres détecté. Réessayez en tenant le produit bien dans le cadre.")
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_450px] gap-8 items-stretch min-h-[500px]">
      {/* Colonne Gauche */}
      <div className="space-y-6 flex flex-col">
        <Tabs defaultValue="manual" className="w-full flex-1 flex flex-col">
          <TabsList className="flex w-full rounded-2xl h-14 p-1.5 bg-white/40 backdrop-blur-md border border-white/40 shadow-inner">
            <TabsTrigger 
              value="manual" 
              className="flex-1 flex items-center justify-center gap-2 rounded-xl transition-all duration-300 text-sm font-semibold
                data-[state=active]:!bg-rose-500 data-[state=active]:!text-white data-[state=active]:shadow-lg
                data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:bg-white/50"
            >
              <Zap className="w-4 h-4" /> Saisie Manuelle
            </TabsTrigger>
            <TabsTrigger 
              value="scan" 
              onClick={() => { setBarcodeResult(null) }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl transition-all duration-300 text-sm font-semibold
                data-[state=active]:!bg-rose-500 data-[state=active]:!text-white data-[state=active]:shadow-lg
                data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:bg-white/50"
            >
              <ScanLine className="w-4 h-4" /> Scan Code-barres
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-6 flex-1 focus-visible:outline-none m-0">
            <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col h-full min-h-[420px]">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" /> Analyse INCI
                </CardTitle>
                <CardDescription>Décryptez la composition de vos soins en un clic.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <Textarea 
                  placeholder="Aqua, Glycerin, Niacinamide..." 
                  className="min-h-[180px] h-full resize-none rounded-2xl bg-white/50 border-rose-100 focus:border-rose-500 focus:ring-rose-500/20 transition-all text-sm"
                  value={inciText}
                  onChange={(e) => setInciText(e.target.value)}
                  disabled={isAnalyzing}
                />
              </CardContent>
              <CardFooter className="pb-6">
                <Button 
                  className="w-full rounded-2xl h-14 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200 transition-all text-base font-semibold group" 
                  onClick={() => analyzeINCI(inciText, productData?.name, productData?.brand, barcodeResult)}
                  disabled={isAnalyzing || !inciText.trim()}
                >
                  {isAnalyzing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5 fill-current" />}
                  Lancer l'analyse personnalisée
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="scan" className="mt-6 flex-1 focus-visible:outline-none m-0">
            <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl rounded-[2.5rem] overflow-hidden h-full min-h-[420px] flex flex-col">
              <CardContent className="p-0 w-full flex-1 relative flex flex-col items-center justify-center">
                {isScanningBarcode ? (
                  <div className="relative w-full h-full bg-black min-h-[420px] flex flex-col rounded-[2.5rem] overflow-hidden">
                    {/* Video stream */}
                    <video
                      ref={videoRef}
                      className="flex-1 w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />

                    {/* Scanning line animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-scan z-10" />

                    {/* Detected code indicator */}
                    {barcodeResult && (
                      <div className="absolute top-4 left-0 right-0 flex justify-center z-20 px-6">
                        <div className="bg-emerald-500/90 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Code détecté : {barcodeResult}
                        </div>
                      </div>
                    )}

                    {/* Confirm button */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 px-6">
                      <Button 
                        onClick={handleConfirmScan}
                        className={`w-full max-w-xs rounded-2xl h-14 font-bold shadow-2xl border-2 border-white/20 text-white ${barcodeResult ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                      >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        {barcodeResult ? 'Analyser ce produit' : 'Confirmer la capture'}
                      </Button>
                    </div>

                    {/* Viewfinder overlay */}
                    <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
                       <div className="w-64 h-40 border-2 border-rose-400/50 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.2)]" />
                    </div>

                    {/* Close button */}
                    <Button 
                      size="icon"
                      variant="destructive" 
                      onClick={() => { stopCamera(); setIsScanningBarcode(false) }}
                      className="absolute top-4 right-4 rounded-full h-10 w-10 z-20 shadow-lg"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-16 text-center group">
                    <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-rose-100 group-hover:scale-110 transition-transform">
                      <ScanLine className="w-10 h-10 text-rose-500" />
                    </div>
                    {barcodeResult && (
                      <div className="mb-4 text-sm text-emerald-600 font-semibold bg-emerald-50 px-4 py-2 rounded-full">
                        Dernier code : {barcodeResult}
                      </div>
                    )}
                    <Button 
                      onClick={() => { setBarcodeResult(null); setIsScanningBarcode(true) }} 
                      size="lg" 
                      className="rounded-2xl px-10 h-14 bg-rose-500 hover:bg-rose-600 shadow-rose-200 shadow-xl font-bold text-white"
                    >
                      Activer la caméra
                    </Button>
                    <p className="mt-4 text-xs text-muted-foreground font-medium italic">Placez le code-barres EAN-13 dans le cadre</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Colonne Droite (Diagnostic) */}
      <div className="flex flex-col h-full">
        {!analysis ? (
          <Card className="bg-white/40 backdrop-blur-sm border-dashed border-2 border-white/60 flex-1 flex flex-col items-center justify-center p-12 text-center rounded-[2.5rem] min-h-[420px]">
            <div className="bg-white/50 p-4 rounded-full mb-4 shadow-sm">
              <Search className="w-8 h-8 text-rose-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Prêt pour l'analyse</h3>
            <p className="text-muted-foreground text-sm max-w-[250px] mt-2 leading-relaxed">
              Analyse personnalisée selon votre âge, type de peau et routine existante.
            </p>
          </Card>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-700 h-full">
            <Card className="bg-white/80 backdrop-blur-xl border-white/40 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-br from-gray-900 to-rose-950 text-white p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs font-semibold text-rose-200/60 uppercase tracking-[0.2em] mb-2">Clean Beauty Score</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl font-black">{analysis.safety_score}</span>
                      <span className="text-xl text-rose-300/40">/100</span>
                    </div>
                  </div>
                  {getSafetyBadge(analysis.safety_score)}
                </div>
                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${analysis.safety_score >= 80 ? 'bg-emerald-400' : analysis.safety_score >= 50 ? 'bg-amber-400' : 'bg-rose-500'}`} 
                    style={{ width: `${analysis.safety_score}%` }} 
                  />
                </div>
              </div>
              
              <CardContent className="p-8 space-y-8">
                <p className="text-sm leading-relaxed text-gray-700 font-medium bg-rose-50/50 p-4 rounded-2xl italic border border-rose-100/50">
                  "{analysis.summary}"
                </p>
                {analysis.conflict_warning && (
                  <div className="bg-rose-50 text-rose-700 text-sm p-4 rounded-2xl flex items-start gap-3 border border-rose-100">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <div>
                      <span className="font-bold block text-rose-800 mb-1 leading-none">Alerte Routine :</span>
                      {analysis.conflict_warning}
                    </div>
                  </div>
                )}
                {analysis.flagged_ingredients && analysis.flagged_ingredients.filter(i => i.safety !== 'safe').length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ingrédients à surveiller</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.flagged_ingredients.filter(i => i.safety !== 'safe').map((ing, idx) => (
                        <span key={idx} className={`text-xs px-3 py-1 rounded-full font-medium ${ing.safety === 'harmful' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                          {ing.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Button 
              variant="ghost" 
              className="w-full h-14 rounded-2xl border-2 border-dashed border-gray-200 hover:border-rose-300 hover:bg-white/50 text-gray-500 transition-all" 
              onClick={() => { setAnalysis(null); setInciText(""); setProductData(null); setBarcodeResult(null) }}
            >
              Réinitialiser le scanner
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}