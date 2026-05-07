"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight, User, Mail, Lock, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) throw error
      toast.success("Compte créé avec succès ! 🎉")
      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'inscription")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-7">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="relative mb-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative bg-gradient-to-br from-primary to-secondary p-3 rounded-2xl shadow-lg">
            <img src="/logo.png" alt="SmartGlow" className="h-8 w-8 object-contain" />
          </div>
        </div>
        <h1 className="text-2xl font-bold heading-font gradient-text">Rejoindre SmartGlow</h1>
        <p className="text-sm text-muted-foreground">
          Commencez votre parcours vers une peau parfaite, guidée par l'IA
        </p>
      </div>

      {/* Perks row */}
      <div className="grid grid-cols-2 gap-2">
        {[
          "Analyse IA instantanée",
          "Routine personnalisée",
          "Coach WhatsApp",
          "100% gratuit",
        ].map((perk) => (
          <div key={perk} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
            {perk}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-semibold">Prénom & Nom</Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="name"
              required
              placeholder="Meriem Harrouch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="h-12 pl-10 rounded-xl glass border-border/50 focus:border-primary/50
                         focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              required
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-12 pl-10 rounded-xl glass border-border/50 focus:border-primary/50
                         focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-semibold">Mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type="password"
              required
              placeholder="Au moins 8 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-12 pl-10 rounded-xl glass border-border/50 focus:border-primary/50
                         focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50"
            />
          </div>
          <p className="text-[11px] text-muted-foreground pl-1">Minimum 8 caractères avec majuscules et chiffres</p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl font-semibold text-base shadow-lg shadow-primary/25 premium-button mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création du compte…
            </>
          ) : (
            <>
              Créer mon profil gratuit
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="premium-divider" />

      {/* Sign-in link */}
      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Se connecter →
        </Link>
      </p>

      {/* Privacy note */}
      <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
        En créant un compte vous acceptez nos{" "}
        <Link href="#" className="text-primary/80 hover:text-primary transition-colors underline underline-offset-2">
          CGU
        </Link>{" "}
        et notre{" "}
        <Link href="#" className="text-primary/80 hover:text-primary transition-colors underline underline-offset-2">
          Politique de confidentialité
        </Link>
      </p>
    </div>
  )
}
