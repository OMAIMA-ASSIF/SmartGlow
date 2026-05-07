"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Calendar, Loader2, CheckCircle, Sparkles } from "lucide-react"
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

      const updateData: Record<string, any> = {
        full_name: fullName,
        skin_type: skinType || null,
        skin_concerns: skinConcerns,
        updated_at: new Date().toISOString(),
      }

      if (birthDate) {
        updateData.birth_date = birthDate
        updateData.age = calculatedAge
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id)

      if (error) throw error
      toast.success("Profil mis à jour ✓")
      setSaved(true)
    } catch (e: any) {
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
          toast.success("Profil mis à jour ✓")
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
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-md shadow-rose-500/25 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold heading-font text-lg">Mon Profil</h3>
            <p className="text-xs text-muted-foreground">Profil dermatologique personnalisé</p>
          </div>
        </div>
        {saved && (
          <Badge className="bg-emerald-500 text-white rounded-full gap-1 text-xs">
            <CheckCircle className="w-3 h-3" /> Sauvegardé
          </Badge>
        )}
      </div>

      <div className="space-y-5 relative z-10">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-sm font-semibold">Prénom & Nom</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Meriem Harrouch"
            className="h-11 rounded-xl glass border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Birth date */}
        <div className="space-y-1.5">
          <Label htmlFor="birthDate" className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            Date de naissance
          </Label>
          <div className="flex gap-3 items-center">
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="h-11 rounded-xl glass border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 flex-1"
            />
            {calculatedAge !== null && (
              <div className="shrink-0 h-11 flex items-center px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold whitespace-nowrap">
                {calculatedAge} ans
              </div>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground pl-0.5">
            Utilisé pour personnaliser vos recommandations produits.
          </p>
        </div>

        {/* Skin type */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Type de peau</Label>
          <Select value={skinType} onValueChange={(val: string | null) => setSkinType(val ?? skinType)}>
            <SelectTrigger className="h-11 rounded-xl glass border-border/50 focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Sélectionner votre type…" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {SKIN_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Skin concerns */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Préoccupations cutanées</Label>
          <div className="flex flex-wrap gap-2">
            {SKIN_CONCERNS.map(concern => (
              <button
                key={concern}
                type="button"
                onClick={() => toggleConcern(concern)}
                className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all duration-150 ${
                  skinConcerns.includes(concern)
                    ? "bg-gradient-to-r from-primary to-secondary text-white border-primary/50 shadow-sm shadow-primary/20"
                    : "bg-white/50 dark:bg-white/5 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {concern}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <Button
          onClick={save}
          disabled={isSaving}
          className="w-full h-11 rounded-xl font-semibold premium-button shadow-md shadow-primary/20"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde…</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Sauvegarder le profil</>
          )}
        </Button>
      </div>
    </div>
  )
}
