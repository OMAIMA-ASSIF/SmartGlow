"use client"

import { useState, useRef, useCallback } from "react"
import Webcam from "react-webcam"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Camera, RefreshCw, Loader2, Sparkles, Play,
  StopCircle, CheckCircle2, ScanFace, Volume2
} from "lucide-react"
import { toast } from "sonner"
import type { GeminiSkinAnalysis } from "@/lib/gemini"
import type { SkinSynthesisResult } from "@/lib/mistral"
import { Badge } from "@/components/ui/badge"

const videoConstraints = {
  width: 720,
  height: 960,
  facingMode: "user",
}

export function SkinScanner() {
  const webcamRef = useRef<Webcam>(null)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<GeminiSkinAnalysis | null>(null)
  const [synthesis, setSynthesis] = useState<SkinSynthesisResult | null>(null)
  const [audioBase64, setAudioBase64] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [routineConfirmed, setRoutineConfirmed] = useState(false)

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) setImgSrc(imageSrc)
  }, [webcamRef])

  const retake = () => {
    setImgSrc(null)
    setAnalysis(null)
    setSynthesis(null)
    setAudioBase64(null)
    if (audioRef.current) audioRef.current.pause()
    setIsPlaying(false)
  }

  const analyze = async () => {
    if (!imgSrc) return
    setIsAnalyzing(true)
    try {
      const res = await fetch(imgSrc)
      const blob = await res.blob()
      const formData = new FormData()
      formData.append("image", blob, "selfie.jpg")
      const response = await fetch("/api/analyze-skin", { method: "POST", body: formData })
      if (!response.ok) throw new Error("Erreur d'analyse")
      const data = await response.json()
      if (data.success) {
        setAnalysis(data.gemini_analysis)
        setSynthesis(data.synthesis)
        if (data.audio_base64) {
          setAudioBase64(data.audio_base64)
          audioRef.current = new Audio(`data:audio/mp3;base64,${data.audio_base64}`)
          audioRef.current.onended = () => setIsPlaying(false)
        }
        toast.success("Analyse terminée avec succès !")
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast.error(error.message || "Impossible d'analyser l'image")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleAudio = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const confirmRoutine = async () => {
    if (!synthesis?.recommended_routine) return
    setIsAnalyzing(true)
    try {
      const morning = synthesis.recommended_routine.morning.map(p => p.product)
      const evening = synthesis.recommended_routine.evening.map(p => p.product)
      const allIngredients = [
        ...synthesis.recommended_routine.morning.flatMap(p => p.active_ingredients),
        ...synthesis.recommended_routine.evening.flatMap(p => p.active_ingredients),
      ]
      const uniqueIngredients = Array.from(new Set(allIngredients))
      const resp = await fetch('/api/routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ morning_products: morning, evening_products: evening, active_ingredients: uniqueIngredients }),
      })
      const data = await resp.json()
      if (data.success) {
        toast.success('Routine enregistrée !')
        setRoutineConfirmed(true)
      } else {
        throw new Error(data.error || 'Échec de l\'enregistrement')
      }
    } catch (err: any) {
      toast.error(err.message || 'Impossible d\'enregistrer la routine')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-8">

      {/* ── Left – Camera ── */}
      <div className="flex flex-col items-center gap-5">
        {/* Camera frame */}
        <div className="relative w-full max-w-sm mx-auto">
          {/* Glow halo */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/15 rounded-3xl blur-2xl opacity-70 scale-105 pointer-events-none" />

          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl glass border-2 border-white/30 dark:border-white/10 shadow-glow-strong">
            {!imgSrc ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full h-full object-cover"
                  mirrored={true}
                />
                {/* Corner brackets */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary/70 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary/70 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary/70 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary/70 rounded-br-lg" />
                {/* Scan animation line */}
                <div className="scan-line" />
                {/* Label */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-subtle rounded-full px-3 py-1.5">
                  <p className="text-[11px] font-semibold text-white/90 whitespace-nowrap">Centrez votre visage</p>
                </div>
              </>
            ) : (
              <div className="relative w-full h-full">
                <img src={imgSrc} alt="Selfie capturé" className="w-full h-full object-cover" />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-white text-center p-6">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">IA en cours d'analyse</h3>
                      <p className="text-sm text-white/75 leading-relaxed">
                        Gemini analyse vos pores, Mistral synthétise votre routine, ElevenLabs prépare votre diagnostic vocal…
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full max-w-sm">
          {!imgSrc ? (
            <Button
              onClick={capture}
              size="lg"
              className="w-full rounded-2xl h-13 font-semibold shadow-lg shadow-primary/25 premium-button gap-2"
            >
              <Camera className="h-5 w-5" />
              Analyser mon visage
            </Button>
          ) : (
            <>
              <Button
                onClick={retake}
                variant="outline"
                size="lg"
                className="flex-1 rounded-2xl h-13 glass border-border/50 font-semibold"
                disabled={isAnalyzing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reprendre
              </Button>
              {!analysis && (
                <Button
                  onClick={analyze}
                  size="lg"
                  className="flex-[2] rounded-2xl h-13 font-semibold shadow-lg shadow-primary/25 premium-button"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyse…</>
                    : <><Sparkles className="h-4 w-4 mr-2" /> Lancer l'IA</>
                  }
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Right – Results ── */}
      <div className="space-y-5">
        {!analysis ? (
          /* Empty state */
          <div className="glass-card p-10 flex flex-col items-center justify-center text-center min-h-[400px] gap-5">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
              <ScanFace className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <div>
              <h3 className="font-bold heading-font text-lg mb-1">En attente du scan</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Prenez une photo claire, sans maquillage, sous une lumière naturelle pour un diagnostic optimal.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {["💡 Bonne lumière", "😌 Sans maquillage", "📐 Visage centré"].map(tip => (
                <span key={tip} className="premium-badge text-xs">{tip}</span>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Diagnostic AI */}
            {synthesis && (
              <>
                <div className="glass-card p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/6 to-secondary/4 rounded-[1.25rem] pointer-events-none" />
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-sm flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold heading-font">Diagnostic IA</h3>
                          <p className="text-[11px] text-muted-foreground">Votre coach de peau personnel</p>
                        </div>
                      </div>
                      {audioBase64 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl glass border-primary/30 h-9 px-3 gap-2 text-primary font-semibold"
                          onClick={toggleAudio}
                        >
                          {isPlaying ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          {isPlaying ? "Pause" : "Écouter"}
                        </Button>
                      )}
                    </div>

                    {/* Quote */}
                    <div className="bg-white/60 dark:bg-black/30 p-4 rounded-2xl mb-4 border border-border/30 relative">
                      <span className="text-5xl absolute -top-3 left-2 text-primary/15 font-serif leading-none">"</span>
                      <p className="text-sm italic leading-relaxed text-foreground/85 relative z-10 pt-2">
                        {synthesis.personalized_advice}
                      </p>
                    </div>

                    {/* Action tips */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-3">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Actions recommandées
                      </h4>
                      <ul className="space-y-2">
                        {synthesis.actionable_tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm glass-subtle p-3 rounded-xl border border-border/30">
                            <span className="text-primary font-bold shrink-0 mt-0.5">→</span>
                            <span className="text-foreground/80">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Routine */}
                {synthesis.recommended_routine && (
                  <div className="glass-card p-6">
                    <h3 className="font-bold heading-font mb-4">Routine conseillée</h3>
                    <div className="space-y-4">
                      {(['morning', 'evening'] as const).map((period) => (
                        <div key={period}>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            {period === 'morning' ? '☀️ Matin' : '🌙 Soir'}
                          </p>
                          <ul className="space-y-2">
                            {(synthesis.recommended_routine as any)[period].map((item: any, idx: number) => (
                              <li key={idx} className="text-sm glass-subtle p-3 rounded-xl border border-border/30">
                                <span className="font-semibold">{item.product}</span>
                                <span className="text-muted-foreground"> — {item.active_ingredients.join(', ')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      {!routineConfirmed ? (
                        <Button
                          onClick={confirmRoutine}
                          disabled={isAnalyzing}
                          className="w-full rounded-xl h-11 font-semibold premium-button"
                        >
                          {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                          Adopter cette routine
                        </Button>
                      ) : (
                        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Routine confirmée et enregistrée
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Clinical data */}
            <div className="glass-card p-6">
              <h3 className="font-bold heading-font mb-5">Données cliniques</h3>

              {/* Badges */}
              {(analysis.redness_areas.length > 0 || analysis.inflammation_zones.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {analysis.redness_areas.map(area => (
                    <Badge variant="destructive" key={area} className="text-xs rounded-full">
                      🔴 Rougeur: {area}
                    </Badge>
                  ))}
                  {analysis.inflammation_zones.map(area => (
                    <Badge key={area} className="text-xs rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">
                      🔥 Inflammation: {area}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Progress bars */}
              <div className="space-y-4">
                {[
                  { label: "Santé globale", value: analysis.overall_health * 10, color: "bg-primary", textColor: "text-primary" },
                  { label: "Hydratation", value: analysis.hydration_level * 10, color: "bg-blue-500", textColor: "text-blue-500" },
                  { label: "Dilatation des pores", value: analysis.pore_dilation * 10, color: "bg-amber-500", textColor: "text-amber-500" },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-foreground/80">{metric.label}</span>
                      <span className={`font-bold ${metric.textColor}`}>{metric.value.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${metric.color} transition-all duration-700`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {analysis.skin_texture && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/70">Texture : </span>
                    {analysis.skin_texture}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
