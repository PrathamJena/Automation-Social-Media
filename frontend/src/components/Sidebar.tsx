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
  Zap,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
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

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } backdrop-blur-xl border-r flex flex-col transition-all duration-300`}
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
        opacity: 0.98,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/8">
        <div className="w-10 h-10 rounded-xl bg-cherry/15 flex items-center justify-center flex-shrink-0 border border-cherry/20">
          <Zap className="w-5 h-5 text-cherry-light" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <h1 className="text-sm font-bold text-soft-white truncate">AakSidhi</h1>
              <p className="text-xs text-soft-gray truncate">Automation</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-white/8">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-soft-gray hover:bg-white/4 hover:text-soft-white transition-all duration-200"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
