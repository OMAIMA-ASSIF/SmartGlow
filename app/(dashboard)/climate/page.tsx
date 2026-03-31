import { ClimateDashboard } from "@/components/climate/ClimateDashboard"

export const metadata = {
  title: "Climate-Sync | SmartGlow",
  description: "Routine dynamique en temps réel selon géolocalisation et météo.",
}

export default function ClimatePage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight heading-font mb-2">Climate-Sync</h2>
        <p className="text-muted-foreground">Une belle peau est une peau protégée de son environnement. Activez le GPS pour adapter votre routine.</p>
      </div>

      <ClimateDashboard />
    </div>
  )
}
