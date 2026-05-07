import { SkinScanner } from "@/components/scanner/SkinScanner"
import { ScanFace } from "lucide-react"

export const metadata = {
  title: "Selfie Scanner | SmartGlow",
  description: "Analysez votre peau en temps réel avec l'IA.",
}

export default function ScannerPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-md shadow-rose-500/25 flex items-center justify-center">
            <ScanFace className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold heading-font">Selfie Scanner IA</h1>
            <p className="text-sm text-muted-foreground">
              Prenez une photo pour un diagnostic complet avec conseils vocaux personnalisés.
            </p>
          </div>
        </div>
        <div className="premium-divider mt-2" />
      </div>

      <SkinScanner />
    </div>
  )
}
