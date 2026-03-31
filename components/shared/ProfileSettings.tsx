"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Calendar, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

const SKIN_TYPES = [
  { value: "normal", label: "Normal" },
  { value: "dry", label: "Sèche" },
  { value: "oily", label: "Grasse" },
  { value: "combination", label: "Mixte" },
  { value: "sensitive", label: "Sensible" },
]

const SKIN_CONCERNS = [
  "Acné", "Rides / anti-âge", "Taches pigmentaires", "Pores dilatés",
  "Rougeurs", "Terne / éclat", "Déshydratation", "Sensibilité",
]

function calcAge(birthDateStr: string): number | null {
  if (!birthDateStr) return null
  const birth = new Date(birthDateStr)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 && age < 130 ? age : null
}

export function ProfileSettings() {
  const [fullName, setFullName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [skinType, setSkinType] = useState("")
  const [skinConcerns, setSkinConcerns] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const calculatedAge = calcAge(birthDate)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("profiles")
        .select("full_name, birth_date, skin_type, skin_concerns")
        .eq("user_id", user.id)
        .single()
      if (data) {
        setFullName(data.full_name || "")
        setBirthDate(data.birth_date || "")
        setSkinType(data.skin_type || "")
        setSkinConcerns(data.skin_concerns || [])
      }
    }
    load()
  }, [])

  const toggleConcern = (concern: string) => {
    setSkinConcerns(prev =>
      prev.includes(concern) ? prev.filter(c => c !== concern) : [...prev, concern]
    )
  }

  const save = async () => {
    setIsSaving(true)
    setSaved(false)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non connecté")

      // Build update object — only include birth_date if column exists
      const updateData: Record<string, any> = {
        full_name: fullName,
        skin_type: skinType || null,
        skin_concerns: skinConcerns,
        updated_at: new Date().toISOString(),
      }

      // Add age if birth_date is set (calculated server-side via birth_date column)
      if (birthDate) {
        updateData.birth_date = birthDate
        updateData.age = calculatedAge // keep age column in sync for backward compat
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id)

      if (error) throw error
      toast.success("Profil mis à jour ")
      setSaved(true)
    } catch (e: any) {
      // If birth_date column doesn't exist yet, save without it
      if (e.message?.includes("birth_date")) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) throw e
          await supabase.from("profiles").update({
            full_name: fullName,
            skin_type: skinType || null,
            skin_concerns: skinConcerns,
            age: calculatedAge,
            updated_at: new Date().toISOString(),
          }).eq("user_id", user.id)
          toast.success("Profil mis à jour ")
          toast.info("Note : Exécutez le SQL d'upgrade dans Supabase pour activer la date de naissance complète.")
          setSaved(true)
        } catch (e2: any) {
          toast.error(e2.message || "Erreur de sauvegarde")
        }
      } else {
        toast.error(e.message || "Erreur de sauvegarde")
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="glass-panel border-0 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -mr-20 -mt-20 pointer-events-none" />

      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
            <User className="w-6 h-6 text-rose-600" />
          </div>
          {saved && <Badge className="bg-emerald-500"><CheckCircle className="w-3 h-3 mr-1" /> Sauvegardé</Badge>}
        </div>
        <CardTitle className="text-2xl heading-font mt-4">Mon Profil</CardTitle>
        <CardDescription>Votre profil dermatologique personnalisé — utilisé par toutes les IAs SmartGlow.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Nom */}
        <div className="grid gap-2">
          <Label htmlFor="fullName">Prénom & Nom</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Meriem Harrouch"
            className="rounded-xl"
          />
        </div>

        {/* Date de naissance + âge calculé */}
        <div className="grid gap-2">
          <Label htmlFor="birthDate" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Date de naissance
          </Label>
          <div className="flex gap-3 items-center">
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="rounded-xl flex-1"
            />
            {calculatedAge !== null && (
              <div className="shrink-0 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap">
                {calculatedAge} ans
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            L'âge est calculé automatiquement et utilisé pour personnaliser votre analyse de peau et vos recommandations produits.
          </p>
        </div>

        {/* Type de peau */}
        <div className="grid gap-2">
          <Label>Type de peau</Label>
          <Select value={skinType} onValueChange={(val: string | null) => setSkinType(val ?? skinType)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              {SKIN_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Préoccupations */}
        <div className="grid gap-2">
          <Label>Préoccupations cutanées</Label>
          <div className="flex flex-wrap gap-2">
            {SKIN_CONCERNS.map(concern => (
              <button
                key={concern}
                type="button"
                onClick={() => toggleConcern(concern)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${skinConcerns.includes(concern)
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-white/60 text-gray-600 border-gray-200 hover:border-rose-300"
                  }`}
              >
                {concern}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={save}
          disabled={isSaving}
          className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold h-12"
        >
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Sauvegarder le profil
        </Button>
      </CardContent>
    </Card>
  )
}
