"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bot, Phone, Loader2, MessageCircle, AlertCircle, Zap } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function WhatsAppSettings() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('whatsapp_number, whatsapp_active')
          .eq('user_id', user.id)
          .single()
        if (data) {
          setPhoneNumber(data.whatsapp_number || "")
          setIsActive(data.whatsapp_active || false)
        }
      }
    }
    loadProfile()
  }, [])

  const saveSettings = async () => {
    if (isActive && (!phoneNumber || phoneNumber.length < 9)) {
      toast.error("Veuillez entrer un numéro de téléphone valide")
      return
    }
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non connecté")
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+33${phoneNumber.replace(/^0/, '')}`
      const { error } = await supabase.from('profiles').update({
        whatsapp_number: formattedPhone,
        whatsapp_active: isActive
      }).eq('user_id', user.id)
      if (error) throw error
      toast.success("Préférences sauvegardées !")
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || "Erreur de sauvegarde")
    } finally {
      setIsSaving(false)
    }
  }

  const sendTestMessage = async () => {
    setIsSendingTest(true)
    toast.info("Envoi du message test…")
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+33${phoneNumber.replace(/^0/, '')}`
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "routine_reminder",
          phone_number: formattedPhone,
          time_of_day: "morning",
          weather_tip: "N'oublie pas le grand soleil aujourd'hui : applique ton écran total (SPF 50+) !"
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Message de test envoyé sur WhatsApp !")
      } else {
        throw new Error(data.error || "Erreur Meta API")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSendingTest(false)
    }
  }

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Decorative glow */}
      <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-500
        ${isActive ? "bg-green-500/10" : "bg-slate-400/6"}`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl shadow-md flex items-center justify-center transition-all duration-300
            ${isActive
              ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/25"
              : "bg-muted/60"
            }`}>
            <MessageCircle className={`w-5 h-5 ${isActive ? "text-white" : "text-muted-foreground"}`} />
          </div>
          <div>
            <h3 className="font-bold heading-font text-lg">SmartGlow Bot</h3>
            <p className="text-xs text-muted-foreground">Coach vocal / texte WhatsApp</p>
          </div>
        </div>
        <Badge
          className={`rounded-full text-xs font-semibold transition-all duration-300 ${
            isActive
              ? "bg-green-500 text-white border-0"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isActive ? "✓ Actif" : "Inactif"}
        </Badge>
      </div>

      <div className="space-y-5 relative z-10">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          Évitez la fatigue applicative. Recevez vos rappels matin/soir et vos alertes météo directement via message WhatsApp.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl glass-subtle border border-border/40">
          <div>
            <p className="text-sm font-semibold">Activer le coach WhatsApp</p>
            <p className="text-xs text-muted-foreground mt-0.5">Rappels intelligents et alertes UV</p>
          </div>
          <Switch
            id="whatsapp-mode"
            checked={isActive}
            onCheckedChange={setIsActive}
            className="data-[state=checked]:bg-green-500"
          />
        </div>

        {/* Phone field – only when active */}
        {isActive && (
          <div className="space-y-4 anim-slide-bottom">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold">Numéro WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="phone"
                  placeholder="+33 6 12 34 56 78"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-11 pl-10 rounded-xl glass border-border/50 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <p className="text-[11px] text-muted-foreground pl-0.5">Format international requis (+33 pour la France)</p>
            </div>

            {/* MVP note */}
            <div className="flex gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <span className="font-bold">Mode MVP :</span> Assurez-vous d'avoir enregistré ce numéro de test sur votre dashboard Meta Developer.
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={saveSettings}
                disabled={isSaving}
                className="flex-1 h-10 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md shadow-green-500/20 premium-button"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                Sauvegarder
              </Button>
              <Button
                onClick={sendTestMessage}
                disabled={isSendingTest || !phoneNumber}
                variant="outline"
                className="flex-1 h-10 rounded-xl font-semibold glass border-border/50"
              >
                {isSendingTest ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
                Ping test
              </Button>
            </div>
          </div>
        )}

        {/* Save when inactive */}
        {!isActive && (
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            variant="outline"
            className="w-full h-10 rounded-xl font-semibold glass border-border/50 text-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Enregistrer les préférences
          </Button>
        )}
      </div>
    </div>
  )
}
