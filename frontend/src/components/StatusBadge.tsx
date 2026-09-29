import { motion } from 'framer-motion'

interface StatusBadgeProps {
  status: string
}

const statusStyles: Record<string, string> = {
  draft: 'bg-white/6 text-soft-gray',
  scheduled: 'bg-blue-500/10 text-blue-400',
  publishing: 'bg-yellow-500/10 text-yellow-400',
  published: 'bg-green-500/10 text-green-400',
  failed: 'bg-red-500/10 text-red-400',
  cancelled: 'bg-white/6 text-soft-gray',
  connected: 'bg-green-500/10 text-green-400',
  disconnected: 'bg-white/6 text-soft-gray',
  expired: 'bg-orange-500/10 text-orange-400',
  error: 'bg-red-500/10 text-red-400',
  active: 'bg-green-500/10 text-green-400',
  inactive: 'bg-red-500/10 text-red-400',
  ADMIN: 'bg-cherry/15 text-cherry-light',
  EDITOR: 'bg-blue-500/10 text-blue-400',
  VIEWER: 'bg-white/6 text-soft-gray',
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-white/6 text-soft-gray'

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${style}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </motion.span>
  )
}
