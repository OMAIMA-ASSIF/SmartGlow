"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CloudSun, Sun, MapPin, Droplets, Wind, Zap, RefreshCw, Loader2, ArrowRight, MessageCircle } from "lucide-react"
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
            body: JSON.stringify({ lat: latitude, lon: longitude })
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
        
        switch(error.code) {
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
            break
        }
      }
    )
  }

  // Effectuer la requête au premier rendu si on veut
  useEffect(() => {
    // Optionnel: lancer automatiquement
    // fetchClimateData()
  }, [])

  if (!weather || !routine) {
    return (
      <Card className="glass-panel border-0 shadow-lg p-10 flex flex-col items-center justify-center text-center min-h-[500px]">
        <div className="bg-amber-100 p-4 rounded-full mb-6">
          <CloudSun className="w-12 h-12 text-amber-500" />
        </div>
        <h3 className="text-2xl font-bold heading-font mb-4">Météo & Sensibilité cutanée</h3>
        <p className="text-muted-foreground max-w-md mb-8">
          Activez la géolocalisation pour analyser l'indice UV, la pollution (PM2.5) et l'humidité autour de vous. 
          Mistral IA adaptera immédiatement votre routine de soins.
        </p>
        <Button 
          size="lg" 
          onClick={fetchClimateData} 
          disabled={isFetching}
          className="rounded-full shadow-lg shadow-primary/20 bg-amber-500 hover:bg-amber-600 text-white px-8 h-14"
        >
          {isFetching ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <MapPin className="w-5 h-5 mr-3" />}
          Synchroniser ma position gps
        </Button>
      </Card>
    )
  }

  const uvCat = getUVCategory(weather.uv_index)
  const aqiCat = getAQICategory(weather.pm25)

  return (
    <div className="grid lg:grid-cols-[1fr_450px] gap-8">
      {/* Weather Dashboard Widget */}
      <div className="space-y-6">
        <Card className="glass-panel border-0 shadow-lg overflow-hidden relative">
          {/* Dynamic background based on weather */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-blue-100/10 to-transparent dark:from-blue-900/30"></div>
          
          <CardHeader className="relative z-10 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl heading-font">{weather.city}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1 font-medium capitalize">
                  {weather.description} • {Math.round(weather.temperature)}°C
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={fetchClimateData} disabled={isFetching} className="rounded-full bg-white/50 backdrop-blur-sm">
                <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10 grid grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <Card className="border-0 shadow-sm bg-white/70 dark:bg-black/30 backdrop-blur-md">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Sun className="w-8 h-8 mb-2" style={{ color: uvCat.color }} />
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">UV Index</p>
                  <p className="text-2xl font-bold font-mono">{weather.uv_index.toFixed(1)}</p>
                  <Badge variant="outline" className="mt-2 text-xs" style={{ borderColor: uvCat.color, color: uvCat.color }}>{uvCat.label}</Badge>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <Card className="border-0 shadow-sm bg-white/70 dark:bg-black/30 backdrop-blur-md">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Wind className="w-8 h-8 mb-2" style={{ color: aqiCat.color }} />
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">PM2.5 (Air)</p>
                  <p className="text-2xl font-bold font-mono">{weather.pm25.toFixed(1)}</p>
                  <Badge variant="outline" className="mt-2 text-xs" style={{ borderColor: aqiCat.color, color: aqiCat.color }}>{aqiCat.label}</Badge>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="col-span-2 lg:col-span-1 border-0 lg:border-l-0 lg:border-t-0">
              <Card className="border-0 shadow-sm bg-white/70 dark:bg-black/30 backdrop-blur-md h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                  <Droplets className="w-8 h-8 mb-2 text-blue-500" />
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Humidité</p>
                  <p className="text-2xl font-bold font-mono text-blue-500">{weather.humidity}%</p>
                  <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                    {weather.humidity < 40 ? "Air très sec" : weather.humidity > 70 ? "Air saturé" : "Humidité idéale"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </CardContent>
        </Card>

        {/* WhatsApp auto-alert indicator */}
        {whatsappAlertSent && whatsappAlertText && (
          <Card className="bg-green-600 text-white border-0 shadow-xl shadow-green-500/20 relative overflow-hidden">
            <CardContent className="p-5 flex items-start gap-4">
              <MessageCircle className="w-6 h-6 text-white shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold mb-1 text-sm">Alerte WhatsApp envoyée automatiquement</h4>
                <p className="text-white/90 text-xs leading-relaxed">{whatsappAlertText.split('\n')[0]}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Global summary card */}
        <Card className="bg-primary text-white border-0 shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <CardContent className="p-6 relative z-10">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-300" /> Bilan IA de surface :
            </h4>
            <p className="text-white/90 text-sm italic border-l-2 border-white/40 pl-3">"{routine.summary_message}"</p>
          </CardContent>
        </Card>
      </div>

      {/* Routine Adjustments Board */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold heading-font flex items-center gap-2">
          Ordres du jour <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </h3>
        
        <div className="grid gap-3">
          {routine.adjustments.map((adj, idx) => (
            <motion.div 
              key={idx}
              initial={{ x: 20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ delay: 0.1 * idx }}
            >
              <Card className={`glass-panel border-l-4 overflow-hidden shadow-sm relative group ${
                adj.type === 'add' ? 'border-l-emerald-500' : 
                adj.type === 'remove' ? 'border-l-destructive' : 
                'border-l-amber-500'
              }`}>
                {/* Visual urgency background indicator */}
                {adj.urgency === 'high' && <div className="absolute right-0 top-0 bg-red-500/10 h-full w-20 -skew-x-12 translate-x-10"></div>}
                
                <CardContent className="p-4 relative z-10 flex gap-4 items-start">
                  <div className={`p-2 rounded-xl mt-1 shrink-0 ${
                    adj.type === 'add' ? 'bg-emerald-100 text-emerald-600' : 
                    adj.type === 'remove' ? 'bg-red-100 text-red-600' : 
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {adj.type === 'add' ? '+' : adj.type === 'remove' ? '-' : '↑'}
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm uppercase tracking-wider">{adj.ingredient}</h4>
                      {adj.urgency === 'high' && <Badge variant="destructive" className="text-[10px] py-0 h-4">CRITIQUE</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Catégorie: {adj.product_category}</p>
                    <p className="text-sm font-medium leading-tight mt-2">{adj.reason}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
