import { ProgressReport } from "@/components/progress/ProgressReport"

export const metadata = {
  title: "Évolution Clinique | SmartGlow",
  description: "Suivi de votre progrès dermatologique avec génération de rapport IA."
}

export default function ProgressPage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight heading-font mb-2">Suivi & Évolution</h2>
        <p className="text-muted-foreground">Observez les résultats de la routine SmartGlow et comparez vos scans.</p>
      </div>

      <ProgressReport />
    </div>
  )
}
