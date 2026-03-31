import { Sidebar } from "@/components/shared/Sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20 relative">
      {/* Decorative background blobs for the entire dashboard */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary rounded-full mix-blend-multiply filter blur-[100px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-64 w-[500px] h-[500px] bg-primary/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 pointer-events-none"></div>

      <Sidebar className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50" />
      <main className="md:pl-72 flex-1 w-full h-full overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto relative z-10 w-full h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
