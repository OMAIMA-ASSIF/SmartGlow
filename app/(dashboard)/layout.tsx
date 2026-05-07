import { Sidebar } from "@/components/shared/Sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Ambient background – persistent across all dashboard pages */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-secondary/12 blur-[130px] opacity-40 animate-blob-2" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[110px] opacity-30 animate-blob-1" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[100px] opacity-25" />
      </div>

      {/* Sidebar */}
      <Sidebar className="hidden md:flex w-72 flex-col fixed inset-y-0 z-40" />

      {/* Main content */}
      <main className="md:pl-72 flex-1 w-full h-full overflow-y-auto relative z-10 scroll-smooth">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}
