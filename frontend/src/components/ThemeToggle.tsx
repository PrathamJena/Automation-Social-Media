import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex items-center w-[68px] h-8 rounded-full px-1 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--surface-subtle)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="flex items-center justify-center w-6 h-6 rounded-full"
        style={{
          backgroundColor: 'var(--accent-cherry)',
          marginLeft: isDark ? 0 : 'auto',
        }}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-white" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-white" />
        )}
      </motion.span>

      <Sun
        className="absolute right-2 w-3.5 h-3.5 pointer-events-none transition-opacity"
        style={{ color: 'var(--text-secondary)', opacity: isDark ? 1 : 0 }}
      />
      <Moon
        className="absolute left-2 w-3.5 h-3.5 pointer-events-none transition-opacity"
        style={{ color: 'var(--text-secondary)', opacity: isDark ? 0 : 1 }}
      />
    </button>
  )
}
