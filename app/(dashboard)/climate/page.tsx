import { ClimateDashboard } from "@/components/climate/ClimateDashboard"
import { CloudSun } from "lucide-react"

export const metadata = {
  title: "Climate-Sync | SmartGlow",
  description: "Routine dynamique en temps réel selon géolocalisation et météo.",
}

export default function ClimatePage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-500/25 flex items-center justify-center">
            <CloudSun className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold heading-font">Climate-Sync</h1>
            <p className="text-sm text-muted-foreground">
              Une belle peau est une peau protégée. Activez le GPS pour adapter votre routine à l'environnement.
            </p>
          </div>
        </div>
        <div className="premium-divider mt-2" />
      </div>

      <ClimateDashboard />
    </div>
  )
}
