import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNav from '../components/TopNav'

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMobile = useCallback(() => setMobileMenuOpen(false), [])

  return (
    <div className="flex h-screen bg-matte-black overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={closeMobile}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="relative">
          <TopNav onOpenMenu={() => setMobileMenuOpen(true)} />
        </div>

        {/* Padding scales down on phones, up on desktop. */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
