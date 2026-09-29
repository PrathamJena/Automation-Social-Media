import { Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

export default function TopNav() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <header
      className="h-16 backdrop-blur-xl border-b flex items-center justify-between px-6"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
        opacity: 0.98,
      }}
    >
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-gray" />
          <input
            type="text"
            placeholder="Search posts, media, users..."
            className="input-field pl-10 py-2 text-sm"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl hover:bg-white/4 transition-colors"
        >
          <Bell className="w-5 h-5 text-soft-gray" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-cherry rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 pl-4 border-l border-white/8 hover:bg-white/4 rounded-xl px-3 py-2 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-cherry/15 flex items-center justify-center border border-cherry/20">
              <User className="w-4 h-4 text-cherry-light" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-soft-white">{user?.name || 'User'}</p>
              <p className="text-xs text-soft-gray">{user?.role || 'VIEWER'}</p>
            </div>
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 glass-card p-2 z-50"
                style={{ boxShadow: 'var(--shadow-dropdown)' }}
              >
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-soft-gray hover:bg-white/4 hover:text-soft-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
