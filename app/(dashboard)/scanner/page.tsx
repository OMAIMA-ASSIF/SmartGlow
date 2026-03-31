import { SkinScanner } from "@/components/scanner/SkinScanner"

export const metadata = {
  title: "Selfie Scanner | SmartGlow",
  description: "Analysez votre peau en temps réel avec l'IA.",
}

export default function ScannerPage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight heading-font mb-2">Selfie Scanner IA</h2>
        <p className="text-muted-foreground">Prenez une photo pour un diagnostic complet avec conseils vocaux personnalisés.</p>
      </div>

      <SkinScanner />
    </div>
  )
}
