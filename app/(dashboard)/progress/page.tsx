import { ProgressReport } from "@/components/progress/ProgressReport"
import { LineChart } from "lucide-react"

export const metadata = {
  title: "Évolution Clinique | SmartGlow",
  description: "Suivi de votre progrès dermatologique avec génération de rapport IA.",
}

export default function ProgressPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-md shadow-violet-500/25 flex items-center justify-center">
            <LineChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold heading-font">Suivi & Évolution</h1>
            <p className="text-sm text-muted-foreground">
              Observez les résultats de votre routine SmartGlow et comparez vos scans dans le temps.
            </p>
          </div>
        </div>
        <div className="premium-divider mt-2" />
      </div>

      <ProgressReport />
    </div>
  )
}
