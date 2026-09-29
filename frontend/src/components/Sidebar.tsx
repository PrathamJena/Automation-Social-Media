import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle,
  FileEdit,
  Image,
  Share2,
  BarChart3,
  Bell,
  Users,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
} from 'lucide-react'

interface SidebarProps {
  /** Desktop: narrow icon rail. */
  collapsed: boolean
  onToggle: () => void
  /** Mobile: drawer visibility. */
  mobileOpen: boolean
  onMobileClose: () => void
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/create-post', icon: PlusCircle, label: 'Create Post' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/scheduled', icon: Clock, label: 'Scheduled Posts' },
  { to: '/published', icon: CheckCircle, label: 'Published Posts' },
  { to: '/drafts', icon: FileEdit, label: 'Drafts' },
  { to: '/media', icon: Image, label: 'Media Library' },
  { to: '/social-accounts', icon: Share2, label: 'Social Accounts' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/audit-logs', icon: Shield, label: 'Audit Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  // Close the drawer when the viewport grows to desktop widths, so it
  // never stays stranded open behind the fixed sidebar.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handle = () => {
      if (mq.matches) onMobileClose()
    }
    mq.addEventListener('change', handle)
    return () => mq.removeEventListener('change', handle)
  }, [onMobileClose])

  // Lock body scroll while the drawer covers the screen.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Escape closes the drawer.
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, onMobileClose])

  const panel = (isMobile: boolean) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
        <div className="w-10 h-10 rounded-xl bg-cherry/15 flex items-center justify-center flex-shrink-0 border border-cherry/20">
          <Zap className="w-5 h-5 text-cherry-light" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden min-w-0"
            >
              <h1 className="text-sm font-bold text-soft-white truncate">AakSidhi</h1>
              <p className="text-xs text-soft-gray truncate">Automation</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile: explicit close affordance */}
        {isMobile && (
          <button
            onClick={onMobileClose}
            aria-label="Close menu"
            className="ml-auto p-2 rounded-lg hover:bg-white/4 text-soft-gray"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={isMobile ? onMobileClose : undefined}
            className={({ isActive }) =>
              `sidebar-item ${
                isActive ? 'sidebar-item-active' : ''
              } ${collapsed && !isMobile ? 'justify-center' : ''}`
            }
            title={collapsed && !isMobile ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || isMobile) && (
              <span className="text-sm font-medium truncate">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Desktop collapse control. Phones always show the full drawer. */}
      {!isMobile && (
        <div className="p-3 border-t border-white/8">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-soft-gray hover:bg-white/4 hover:text-soft-white transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      )}
    </div>
  )

  const surface = {
    backgroundColor: 'var(--bg-elevated)',
    borderColor: 'var(--border-subtle)',
  }

  return (
    <>
      {/* ---------- Mobile drawer ---------- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              style={surface}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[264px] max-w-[80vw] backdrop-blur-xl border-r shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              {panel(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ---------- Desktop sidebar ---------- */}
      <aside
        className={`hidden lg:flex flex-shrink-0 backdrop-blur-xl border-r transition-[width] duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
        style={surface}
      >
        {panel(false)}
      </aside>
    </>
  )
}
