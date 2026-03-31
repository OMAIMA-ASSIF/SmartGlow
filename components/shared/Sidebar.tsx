"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  LayoutDashboard, 
  ScanFace, 
  Droplets, 
  CloudSun, 
  LineChart, 
  Settings,
  LogOut,
  Sparkles
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const routes = [
    {
      title: "Vue d'ensemble",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-blue-500",
    },
    {
      title: "Selfie Scanner",
      icon: ScanFace,
      href: "/scanner",
      color: "text-primary",
    },
    {
      title: "Product Scanner",
      icon: Droplets,
      href: "/products",
      color: "text-emerald-500",
    },
    {
      title: "Climate-Sync",
      icon: CloudSun,
      href: "/climate",
      color: "text-amber-500",
    },
    {
      title: "Mes Progrès",
      icon: LineChart,
      href: "/progress",
      color: "text-purple-500",
    },
    {
      title: "Paramètres",
      icon: Settings,
      href: "/settings",
      color: "text-gray-500",
    },
  ]

  return (
    <div className={cn("pb-12 border-r bg-white/50 dark:bg-black/20 backdrop-blur-xl h-screen flex flex-col", className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-6 py-6 flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl text-white">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-17 w-17 object-contain" 
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight heading-font text-color-pink-500">
            SmartGlow
          </h2>
        </div>
        <div className="px-3">
          <ScrollArea className="h-full px-1">
            <div className="space-y-1 p-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-sm",
                    pathname === route.href ? "bg-white dark:bg-white/10 shadow-sm text-primary" : "text-zinc-500"
                  )}
                >
                  <div className="flex items-center flex-1">
                    <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                    {route.title}
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="px-6 py-6 border-t">
        <Button variant="ghost" className="w-full justify-start text-zinc-500 hover:text-red-500 rounded-xl" onClick={handleSignOut}>
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}
