import { WhatsAppSettings } from "@/components/shared/WhatsAppSettings"
import { ProfileSettings } from "@/components/shared/ProfileSettings"

export const metadata = {
  title: "Paramètres | SmartGlow",
  description: "Gérez votre profil dermatologique et notifications WhatsApp.",
}

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight heading-font mb-2">Paramètres du Compte</h2>
        <p className="text-muted-foreground">Profil dermatologique, notifications intelligentes et préférences IA.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileSettings />
        <WhatsAppSettings />
      </div>
    </div>
  )
}
