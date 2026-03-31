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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success("Bon retour sur SmartGlow !")
      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6 ">
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <div className="bg-primary/10 p-3 rounded-2xl mb-2">
          <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-20 w-20 object-contain" 
            />
        </div>
        <h1 className="text-3xl font-bold tracking-tight heading-font">Bon retour</h1>
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour accéder à votre clinique dermatologique.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link href="#" className="text-xs text-primary hover:underline">
              Oublié ?
            </Link>
          </div>
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
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Se connecter"}
        </Button>
      </form>
      <div className="text-center text-sm">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Créer un profil
        </Link>
      </div>
    </div>
  )
}
