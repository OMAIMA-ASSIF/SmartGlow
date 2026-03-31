"use client"

import { useState, useRef, useCallback } from "react"
import Webcam from "react-webcam"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Camera, RefreshCw, Loader2, Sparkles, Play, StopCircle, CheckCircle2, ScanFace } from "lucide-react"
import { toast } from "sonner"
import type { GeminiSkinAnalysis } from "@/lib/gemini"
import type { SkinSynthesisResult } from "@/lib/mistral"
import { Badge } from "@/components/ui/badge"

const videoConstraints = {
  width: 720,
  height: 960,
  facingMode: "user"
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
    if (imageSrc) {
      setImgSrc(imageSrc)
    }
  }, [webcamRef])

  const retake = () => {
    setImgSrc(null)
    setAnalysis(null)
    setSynthesis(null)
    setAudioBase64(null)
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
  }

  const analyze = async () => {
    if (!imgSrc) return

    setIsAnalyzing(true)
    try {
      // Convert base64 Data URL to Blob
      const res = await fetch(imgSrc)
      const blob = await res.blob()
      
      const formData = new FormData()
      formData.append("image", blob, "selfie.jpg")

      const response = await fetch("/api/analyze-skin", {
        method: "POST",
        body: formData,
      })

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
        body: JSON.stringify({
          morning_products: morning,
          evening_products: evening,
          active_ingredients: uniqueIngredients,
        }),
      })
      const data = await resp.json()
      if (data.success) {
        toast.success('Routine enregistrée !')
        setRoutineConfirmed(true)
      } else {
        throw new Error(data.error || 'Échec de l’enregistrement')
      }
    } catch (err: any) {
      toast.error(err.message || 'Impossible d’enregistrer la routine')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
      {/* Left Column: Camera / Image */}
      <div className="space-y-4 flex flex-col items-center">
        <div className="relative w-full max-w-md aspect-[3/4] overflow-hidden rounded-3xl glass-panel shadow-2xl border-4 border-white/50 dark:border-white/10 mx-auto">
          {!imgSrc ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
              mirrored={true}
            />
          ) : (
            <div className="relative w-full h-full">
              <img src={imgSrc} alt="Selfie" className="w-full h-full object-cover" />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
                  <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">IA en cours de traitement</h3>
                  <p className="text-sm text-white/80">Gemini analyse vos pores, Mistral synthétise et ElevenLabs prépare votre diagnostic...</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4 w-full max-w-md">
          {!imgSrc ? (
            <Button onClick={capture} size="lg" className="w-full rounded-2xl h-14 shadow-xl shadow-primary/20">
              <Camera className="mr-2 h-5 w-5" /> Analyser mon visage
            </Button>
          ) : (
            <>
              <Button onClick={retake} variant="outline" size="lg" className="flex-1 rounded-2xl h-14 bg-white/50" disabled={isAnalyzing}>
                <RefreshCw className="mr-2 h-5 w-5" /> Reprendre
              </Button>
              {!analysis && (
                <Button onClick={analyze} size="lg" className="flex-[2] rounded-2xl h-14 shadow-xl shadow-primary/20" disabled={isAnalyzing}>
                  {isAnalyzing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Lancer l'IA
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Column: Results */}
      <div className="space-y-6">
        {!analysis ? (
          <Card className="glass-panel h-full flex flex-col items-center justify-center p-8 text-center border-0 shadow-lg min-h-[400px]">
            <ScanFace className="w-16 h-16 text-muted-foreground/30 mb-6" />
            <h3 className="text-xl font-bold heading-font mb-2">En attente du scan</h3>
            <p className="text-muted-foreground text-sm">Prenez une photo claire, de préférence sans maquillage et sous une lumière naturelle.</p>
          </Card>
        ) : (
          <>
            {/* Audio Synthesis Result */}
            {synthesis && (
              <>
                <Card className="glass-panel border-0 shadow-lg relative overflow-hidden bg-gradient-to-br from-primary/10 to-transparent">
                  <CardHeader>
                    <CardTitle className="heading-font text-2xl flex items-center justify-between">
                      Diagnostic IA
                      {audioBase64 && (
                        <Button size="icon" variant="secondary" className="rounded-full shadow-md bg-white hover:bg-gray-100 text-primary h-12 w-12" onClick={toggleAudio}>
                          {isPlaying ? <StopCircle className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                        </Button>
                      )}
                    </CardTitle>
                    <CardDescription>Votre coach de peau personnel </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white/60 dark:bg-black/40 p-5 rounded-2xl backdrop-blur-md mb-4 text-sm leading-relaxed relative">
                      <span className="text-4xl absolute -top-4 -left-2 text-primary/20 font-serif">"</span>
                      <span className="italic relative z-10">{synthesis.personalized_advice}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-primary flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Actions recommandées :
                      </h4>
                      <ul className="space-y-2">
                        {synthesis.actionable_tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm bg-white/40 dark:bg-white/5 p-3 rounded-xl">
                            <span className="text-primary font-bold mt-0.5">•</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended routine section */}
                {synthesis.recommended_routine && (
                  <Card className="glass-panel border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Routine conseillée</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {['morning', 'evening'].map((period) => (
                          <div key={period}>
                            <h5 className="font-semibold capitalize mb-2">{period === 'morning' ? 'Matin' : 'Soir'}</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {(synthesis.recommended_routine as any)[period].map((item: any, idx: number) => (
                                <li key={idx} className="text-sm">
                                  <strong>{item.product}</strong> – ingrédients clés : {item.active_ingredients.join(', ')}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {!routineConfirmed && (
                        <Button onClick={confirmRoutine} className="w-full">
                          Je vais suivre cette routine
                        </Button>
                      )}
                      {routineConfirmed && (
                        <Badge variant="outline" className="w-full">
                          Routine confirmée ✅
                        </Badge>
                      )}
                    </CardFooter>
                  </Card>
                )}
              </>
            )}

            {/* RAW Gemini Clinical Data */}
            <Card className="glass-panel border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Données cliniques</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  {analysis.redness_areas.map(area => (
                    <Badge variant="destructive" key={area} className="opacity-80">Rougeur: {area}</Badge>
                  ))}
                  {analysis.inflammation_zones.map(area => (
                    <Badge variant="secondary" key={area} className="bg-orange-100 text-orange-800 hover:bg-orange-200">Inflammation: {area}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span>Santé Globale</span>
                    <span className="text-primary font-bold">{analysis.overall_health * 10}%</span>
                  </div>
                  <Progress value={analysis.overall_health * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span>Hydratation</span>
                    <span className="text-blue-500 font-bold">{analysis.hydration_level * 10}%</span>
                  </div>
                  <Progress value={analysis.hydration_level * 10} className="h-2 [&>div]:bg-blue-500 bg-blue-100" />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span>Dilatation des pores</span>
                    <span className="text-amber-500 font-bold">{analysis.pore_dilation * 10}%</span>
                  </div>
                  <Progress value={analysis.pore_dilation * 10} className="h-2 [&>div]:bg-amber-500 bg-amber-100" />
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground"><span className="font-semibold">Texture:</span> {analysis.skin_texture}</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
