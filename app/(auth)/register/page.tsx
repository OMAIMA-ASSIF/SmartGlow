"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2 } from "lucide-react"
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
        options: {
          data: {
            full_name: name,
          }
        }
      })

      if (error) throw error

      toast.success("Compte créé avec succès ! 🎉")
      // Supabase trigger automatically creates the public.profiles entry
      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'inscription")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <div className="bg-primary/10 p-3 rounded-2xl mb-2">
          <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-22 w-22 object-contain" 
            />
        </div>
        <h1 className="text-3xl font-bold tracking-tight heading-font">Rejoindre SmartGlow</h1>
        <p className="text-sm text-muted-foreground">
          Commencez votre parcours vers une peau parfaite, guidée par l'IA.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Prénom & Nom</Label>
          <Input 
            id="name" 
            placeholder="Meriem Harrouch" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="rounded-xl bg-white/50 focus:bg-white transition-colors"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            placeholder="votre@email.com" 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="rounded-xl bg-white/50 focus:bg-white transition-colors"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="rounded-xl bg-white/50 focus:bg-white transition-colors"
          />
        </div>
        <Button className="w-full rounded-xl shadow-lg shadow-primary/20 h-12 text-base" type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Créer mon profil"}
        </Button>
      </form>
      <div className="text-center text-sm">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Se connecter
        </Link>
      </div>
    </div>
  )
}
