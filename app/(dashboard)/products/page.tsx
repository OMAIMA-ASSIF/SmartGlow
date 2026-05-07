import { ProductScanner } from "@/components/products/ProductScanner"
import { Droplets } from "lucide-react"

export const metadata = {
  title: "Product Scanner | SmartGlow",
  description: "Analysez la composition de vos cosmétiques avec l'IA Mistral.",
}

export default function ProductsPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/25 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold heading-font">Scanner "Safe-Swap"</h1>
            <p className="text-sm text-muted-foreground">
              Scannez le code-barres ou collez la liste INCI pour détecter les incompatibilités.
            </p>
          </div>
        </div>
        <div className="premium-divider mt-2" />
      </div>

      <ProductScanner />
    </div>
  )
}
