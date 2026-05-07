"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  ScanFace,
  Droplets,
  CloudSun,
  LineChart,
  Settings,
  LogOut,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const routes = [
  {
    title: "Vue d'ensemble",
    icon: LayoutDashboard,
    href: "/dashboard",
    gradient: "from-blue-500 to-indigo-500",
    shadow: "shadow-blue-500/30",
    activeColor: "text-blue-500",
  },
  {
    title: "Selfie Scanner",
    icon: ScanFace,
    href: "/scanner",
    gradient: "from-rose-500 to-pink-500",
    shadow: "shadow-rose-500/30",
    activeColor: "text-rose-500",
  },
  {
    title: "Product Scanner",
    icon: Droplets,
    href: "/products",
    gradient: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/30",
    activeColor: "text-emerald-500",
  },
  {
    title: "Climate-Sync",
    icon: CloudSun,
    href: "/climate",
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/30",
    activeColor: "text-amber-500",
  },
  {
    title: "Mes Progrès",
    icon: LineChart,
    href: "/progress",
    gradient: "from-violet-500 to-purple-500",
    shadow: "shadow-violet-500/30",
    activeColor: "text-violet-500",
  },
]

const bottomRoutes = [
  {
    title: "Paramètres",
    icon: Settings,
    href: "/settings",
    gradient: "from-slate-400 to-slate-500",
    shadow: "shadow-slate-400/20",
    activeColor: "text-slate-500",
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r border-border/30 relative overflow-hidden",
        "bg-white/60 dark:bg-black/30 backdrop-blur-2xl",
        className
      )}
    >
      {/* Top gradient decoration */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/6 via-secondary/3 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-secondary/10 blur-3xl opacity-60 pointer-events-none animate-blob-2" />

      {/* ── Brand ── */}
      <div className="px-5 pt-7 pb-5 relative z-10">
        <Link href="/dashboard" className="flex items-center gap-3 group select-none w-fit">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
            <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-xl shadow-md">
              <img src="/logo.png" alt="SmartGlow" className="h-6 w-6 object-contain" />
            </div>
          </div>
          <div className="leading-none">
            <h2 className="text-lg font-bold heading-font gradient-text">SmartGlow</h2>
           
      </div>

      {/* Divider */}
      <div className="mx-5 premium-divider" />

      {/* ── Navigation ── */}
      <ScrollArea className="flex-1 px-3 py-4 relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-3">Navigation</p>

          {routes.map((route) => {
            const isActive = pathname === route.href
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "text-foreground bg-white/70 dark:bg-white/8 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                )}
              >
                {/* Active left indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-primary to-secondary" />
                )}

                {/* Icon container */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-all duration-200",
                    isActive
                      ? `bg-gradient-to-br ${route.gradient} shadow-md ${route.shadow}`
                      : "bg-muted/50 group-hover:bg-muted"
                  )}
                >
                  <route.icon
                    className={cn(
                      "h-4 w-4 transition-all duration-200",
                      isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                </div>

                {/* Label */}
                <span className="flex-1 truncate">{route.title}</span>

                {/* Active pulse dot */}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                )}
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      {/* ── Bottom section ── */}
      <div className="px-3 pb-4 relative z-10 space-y-1">
        <div className="premium-divider mb-3" />

        {/* Settings link */}
        {bottomRoutes.map((route) => {
          const isActive = pathname === route.href
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive
                  ? "text-foreground bg-white/70 dark:bg-white/8 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-primary to-secondary" />
              )}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                isActive
                  ? `bg-gradient-to-br ${route.gradient} shadow-sm`
                  : "bg-muted/50 group-hover:bg-muted"
              )}>
                <route.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
              </div>
              <span className="flex-1 truncate">{route.title}</span>
            </Link>
          )
        })}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold
                     text-muted-foreground hover:text-destructive hover:bg-destructive/8
                     transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-destructive/10 flex items-center justify-center shrink-0 transition-all duration-200">
            <LogOut className="h-4 w-4 group-hover:text-destructive transition-colors" />
          </div>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
