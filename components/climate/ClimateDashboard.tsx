"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CloudSun, Sun, MapPin, Droplets, Wind, Zap,
  RefreshCw, Loader2, ArrowRight, MessageCircle, AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import type { OpenWeatherData } from "@/lib/openweather"
import { getUVCategory, getAQICategory } from "@/lib/openweather"
import type { ClimateRoutineResult } from "@/lib/mistral"
import { motion } from "framer-motion"

export function ClimateDashboard() {
  const [isFetching, setIsFetching] = useState(false)
  const [weather, setWeather] = useState<OpenWeatherData | null>(null)
  const [routine, setRoutine] = useState<ClimateRoutineResult | null>(null)
  const [locationPermitted, setLocationPermitted] = useState<boolean | null>(null)
  const [whatsappAlertSent, setWhatsappAlertSent] = useState(false)
  const [whatsappAlertText, setWhatsappAlertText] = useState<string | null>(null)

  const fetchClimateData = () => {
    setIsFetching(true)

    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.")
      setIsFetching(false)
      setLocationPermitted(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationPermitted(true)
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch("/api/climate-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: latitude, lon: longitude }),
          })
          if (!response.ok) throw new Error("Erreur de synchronisation météo")
          const data = await response.json()
          setWeather(data.weather)
          setRoutine(data.routine)
          setWhatsappAlertSent(data.whatsapp_alert_sent || false)
          setWhatsappAlertText(data.whatsapp_alert || null)
          if (data.whatsapp_alert_sent) {
            toast.success("🌡️ Alerte WhatsApp envoyée automatiquement !", { duration: 5000 })
          } else {
            toast.success("Routine adaptée en temps réel !")
          }
        } catch (error: any) {
          toast.error(error.message || "Impossible d'analyser la météo")
        } finally {
          setIsFetching(false)
        }
      },
      (error) => {
        setIsFetching(false)
        setLocationPermitted(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Veuillez autoriser la géolocalisation pour Climate-Sync.")
            break
          case error.POSITION_UNAVAILABLE:
            toast.error("Position indisponible.")
            break
          case error.TIMEOUT:
            toast.error("Délai d'attente dépassé.")
            break
          default:
            toast.error("Une erreur inconnue est survenue.")
        }
      }
    )
  }

  useEffect(() => {
    // Optional: auto-fetch on mount
    // fetchClimateData()
  }, [])

  /* ── Empty state ── */
  if (!weather || !routine) {
    return (
      <div className="glass-card p-10 md:p-14 flex flex-col items-center justify-center text-center min-h-[480px] relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-orange-400/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Animated icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl animate-glow" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 flex items-center justify-center">
              <CloudSun className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-bold heading-font">Météo & Sensibilité cutanée</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Activez la géolocalisation pour analyser l'indice UV, la pollution (PM2.5) et l'humidité autour de vous.
              Mistral IA adaptera immédiatement votre routine de soins.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["☀️ Indice UV", "🌬️ Qualité de l'air", "💧 Humidité", "🤖 Mistral IA"].map((pill) => (
              <span key={pill} className="premium-badge text-xs">{pill}</span>
            ))}
          </div>

          <Button
            size="lg"
            onClick={fetchClimateData}
            disabled={isFetching}
            className="rounded-2xl h-13 px-8 font-semibold shadow-lg shadow-amber-500/25
                       bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600
                       text-white premium-button mt-2"
          >
            {isFetching
              ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Localisation…</>
              : <><MapPin className="w-5 h-5 mr-2" /> Synchroniser ma position GPS</>
            }
          </Button>
        </div>
      </div>
    )
  }

  const uvCat = getUVCategory(weather.uv_index)
  const aqiCat = getAQICategory(weather.pm25)

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-6">

      {/* ── Left – Weather + Summary ── */}
      <div className="space-y-5">

        {/* Main weather card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-6 relative overflow-hidden"
        >
          {/* Gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/8 via-blue-300/5 to-transparent dark:from-sky-900/15 pointer-events-none rounded-[1.25rem]" />

          <div className="relative z-10">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold heading-font">{weather.city}</h3>
                <p className="text-sm text-muted-foreground font-medium capitalize mt-0.5">
                  {weather.description} · {Math.round(weather.temperature)}°C
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchClimateData}
                disabled={isFetching}
                className="rounded-xl w-10 h-10 glass-subtle hover:bg-white/50 dark:hover:bg-white/8"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-4">
              {/* UV */}
              <motion.div
                initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                className="glass-subtle rounded-2xl p-4 flex flex-col items-center text-center"
              >
                <Sun className="w-7 h-7 mb-2" style={{ color: uvCat.color }} />
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">UV Index</p>
                <p className="text-2xl font-bold font-mono">{weather.uv_index.toFixed(1)}</p>
                <Badge
                  variant="outline"
                  className="mt-2 text-[10px] h-5 rounded-full"
                  style={{ borderColor: uvCat.color, color: uvCat.color }}
                >
                  {uvCat.label}
                </Badge>
              </motion.div>

              {/* PM2.5 */}
              <motion.div
                initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="glass-subtle rounded-2xl p-4 flex flex-col items-center text-center"
              >
                <Wind className="w-7 h-7 mb-2" style={{ color: aqiCat.color }} />
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">PM2.5</p>
                <p className="text-2xl font-bold font-mono">{weather.pm25.toFixed(1)}</p>
                <Badge
                  variant="outline"
                  className="mt-2 text-[10px] h-5 rounded-full"
                  style={{ borderColor: aqiCat.color, color: aqiCat.color }}
                >
                  {aqiCat.label}
                </Badge>
              </motion.div>

              {/* Humidity */}
              <motion.div
                initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="glass-subtle rounded-2xl p-4 flex flex-col items-center text-center"
              >
                <Droplets className="w-7 h-7 mb-2 text-blue-500" />
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Humidité</p>
                <p className="text-2xl font-bold font-mono text-blue-500">{weather.humidity}%</p>
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                  {weather.humidity < 40 ? "Air très sec" : weather.humidity > 70 ? "Air saturé" : "Idéale"}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* WhatsApp auto-alert banner */}
        {whatsappAlertSent && whatsappAlertText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-5 border border-green-500/25 bg-green-500/5"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-md flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-0.5">
                  Alerte WhatsApp envoyée automatiquement
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {whatsappAlertText.split('\n')[0]}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-secondary/5 rounded-[1.25rem] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-sm flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <p className="font-bold text-sm">Bilan IA SmartGlow</p>
            </div>
            <p className="text-sm text-foreground/80 italic leading-relaxed border-l-2 border-primary/30 pl-3">
              "{routine.summary_message}"
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Right – Adjustments ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-bold text-base heading-font">Ajustements de la journée</h3>
        </div>

        <div className="space-y-3">
          {routine.adjustments.map((adj, idx) => {
            const typeConfig = {
              add: { border: "border-l-emerald-500", icon: "+", iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
              remove: { border: "border-l-destructive", icon: "−", iconBg: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
              increase: { border: "border-l-amber-500", icon: "↑", iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
            }
            const config = typeConfig[adj.type as keyof typeof typeConfig] || typeConfig.add

            return (
              <motion.div
                key={idx}
                initial={{ x: 16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.08 * idx }}
                className={`glass-card border-l-4 ${config.border} p-4 relative overflow-hidden group`}
              >
                {/* Urgency flash */}
                {adj.urgency === 'high' && (
                  <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-red-500/6 to-transparent pointer-events-none" />
                )}

                <div className="flex gap-3 items-start relative z-10">
                  <div className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center font-bold text-sm shrink-0`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-bold text-xs uppercase tracking-wider truncate">{adj.ingredient}</h4>
                      {adj.urgency === 'high' && (
                        <Badge variant="destructive" className="text-[10px] py-0 h-4 rounded-full shrink-0 gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> CRITIQUE
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium mb-1.5">{adj.product_category}</p>
                    <p className="text-sm leading-snug text-foreground/80">{adj.reason}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
