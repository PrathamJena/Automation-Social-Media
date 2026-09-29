import { useState, useEffect } from 'react'
import { Bell, Search, User, LogOut, Settings, Menu } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

interface TopNavProps {
  onOpenMenu: () => void
}

export default function TopNav({ onOpenMenu }: TopNavProps) {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  // Close the account menu if the user taps elsewhere.
  useEffect(() => {
    if (!showDropdown) return
    const onClick = () => setShowDropdown(false)
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [showDropdown])

  return (
    <header
      className="h-16 flex-shrink-0 backdrop-blur-xl border-b flex items-center gap-3 px-4 sm:px-6"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Mobile: open the drawer */}
      <button
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-white/4 text-soft-gray transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search. Full field from md up, toggleable below that. */}
      <div className="hidden md:block flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-gray" />
          <input
            type="search"
            aria-label="Search"
            placeholder="Search posts, media, users..."
            className="input-field pl-10 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <ThemeToggle />

        {/* Mobile search toggle */}
        <button
          onClick={() => setShowMobileSearch((v) => !v)}
          aria-label="Search"
          aria-expanded={showMobileSearch}
          className="md:hidden p-2 rounded-xl hover:bg-white/4 text-soft-gray transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
          className="relative p-2 rounded-xl hover:bg-white/4 transition-colors"
        >
          <Bell className="w-5 h-5 text-soft-gray" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-cherry rounded-full" />
        </button>

        {/* Account menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDropdown((v) => !v)
            }}
            aria-label="Account menu"
            aria-expanded={showDropdown}
            className="flex items-center gap-3 pl-3 sm:pl-4 sm:border-l hover:bg-white/4 rounded-xl px-2 py-1.5 transition-colors"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="w-9 h-9 rounded-xl bg-cherry/15 flex items-center justify-center flex-shrink-0 border border-cherry/20">
              <User className="w-4 h-4 text-cherry-light" />
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <p className="text-sm font-medium text-soft-white truncate max-w-[140px]">
                {user?.name || 'User'}
              </p>
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
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-52 glass-card p-2 z-50"
                style={{ boxShadow: 'var(--shadow-dropdown)' }}
              >
                <div className="px-3 py-2 sm:hidden border-b border-white/8 mb-1">
                  <p className="text-sm font-medium text-soft-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-soft-gray truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setShowDropdown(false)
                    navigate('/settings')
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-soft-gray hover:bg-white/4 hover:text-soft-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false)
                    logoutUser()
                    navigate('/login')
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile search drawer */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute left-0 right-0 top-full overflow-hidden z-40 border-b"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-gray" />
                <input
                  type="search"
                  autoFocus
                  aria-label="Search"
                  placeholder="Search posts, media..."
                  className="input-field pl-10 py-2.5 text-sm"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
