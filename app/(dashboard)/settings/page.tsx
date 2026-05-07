import { WhatsAppSettings } from "@/components/shared/WhatsAppSettings"
import { ProfileSettings } from "@/components/shared/ProfileSettings"
import { Settings2 } from "lucide-react"

export const metadata = {
  title: "Paramètres | SmartGlow",
  description: "Gérez votre profil dermatologique et notifications WhatsApp.",
}

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-md flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold heading-font">Paramètres</h1>
            <p className="text-sm text-muted-foreground">Profil, notifications et préférences IA.</p>
          </div>
        </div>
        <div className="premium-divider mt-2" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileSettings />
        <WhatsAppSettings />
      </div>
    </div>
  )
}
