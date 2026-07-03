import { SidebarProvider } from '@/components/admin/sidebar-context'
import { Sidebar }         from '@/components/admin/sidebar'
import { Topbar }          from '@/components/admin/topbar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[--bg]">

        {/* Sidebar */}
        <Sidebar />

        {/* Main content — offset by sidebar width on desktop */}
        <div className="flex flex-col lg:ml-60 min-h-screen">

          {/* Topbar */}
          <Topbar />

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>

        </div>
      </div>
    </SidebarProvider>
  )
}