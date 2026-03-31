import { ProductScanner } from "@/components/products/ProductScanner"

export const metadata = {
  title: "Product Scanner | SmartGlow",
  description: "Analysez la composition de vos cosmétiques avec l'IA Mistral.",
}

export default function ProductsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight heading-font mb-2">Scanner "Safe-Swap"</h2>
        <p className="text-muted-foreground">Scannez le code-barres ou collez la liste INCI pour détecter les incompatibilités.</p>
      </div>

      <ProductScanner />
    </div>
  )
}
