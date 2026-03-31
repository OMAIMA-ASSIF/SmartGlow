"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bot, Phone, HelpCircle, Loader2, MessageCircle, AlertCircle } from "lucide-react"
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
    // Load existing settings
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('whatsapp_number, whatsapp_active').eq('user_id', user.id).single()
        if (data) {
          setPhoneNumber(data.whatsapp_number || "")
          setIsActive(data.whatsapp_active || false)
        }
      }
    }
    loadProfile()
  }, [])

  const saveSettings = async () => {
    // Simple verification (french mobile mostly)
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
    toast.info("Envoi du message test en cours...")
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+33${phoneNumber.replace(/^0/, '')}`

      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type" : "application/json" },
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
    } catch(e: any) {
      toast.error(e.message)
    } finally {
      setIsSendingTest(false)
    }
  }

  return (
    <Card className="glass-panel border-0 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -mr-20 -mt-20 pointer-events-none"></div>
      
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500" : ""}>
            {isActive ? "Actif" : "Désactivé"}
          </Badge>
        </div>
        <CardTitle className="text-2xl heading-font mt-4">SmartGlow Bot (WhatsApp)</CardTitle>
        <CardDescription>
          Évitez la "fatigue applicative". Recevez vos rappels de routine matin/soir 
          et vos alertes météo en temps réel directement via message WhatsApp.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="whatsapp-mode"
            checked={isActive}
            onCheckedChange={setIsActive}
            className="data-[state=checked]:bg-green-500"
          />
          <Label htmlFor="whatsapp-mode">Activer le coach vocal/texte WhatsApp</Label>
        </div>

        {isActive && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Numéro de téléphone (Format +33 ou 06)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="+33 6 12 34 56 78"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-900/30 text-sm text-yellow-800 dark:text-yellow-200">
              <span className="font-bold flex items-center gap-1 mb-1"><AlertCircle className="w-4 h-4"/> Note (Mode MVP) :</span> 
              Pour le moment, l'API Meta restreint l'envoi de messages non-inscrits. Assurez-vous d'avoir enregistré ce numéro de test sur votre dashboard Meta Developer, ou contactez l'admin.
            </div>

            <div className="flex gap-3">
              <Button onClick={saveSettings} disabled={isSaving} className="rounded-xl flex-1 bg-green-600 hover:bg-green-700">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sauvegarder"}
              </Button>
              <Button onClick={sendTestMessage} disabled={isSendingTest || !phoneNumber} variant="outline" className="rounded-xl flex-1">
                {isSendingTest ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />} Ping Test
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
