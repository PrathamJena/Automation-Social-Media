import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle, XCircle, Edit, TrendingUp, Users, Eye } from 'lucide-react'
import { getDashboardStats } from '../api/dashboard'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  })

  const cards = [
    { label: 'Total Posts', value: stats?.total_posts ?? 0, icon: FileText, color: 'text-cherry-light', bg: 'bg-cherry/10' },
    { label: 'Scheduled', value: stats?.scheduled ?? 0, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Published', value: stats?.published ?? 0, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Failed', value: stats?.failed ?? 0, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Drafts', value: stats?.drafts ?? 0, icon: Edit, color: 'text-soft-gray', bg: 'bg-white/6' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-soft-white">Dashboard</h1>
        <p className="text-sm text-soft-gray mt-1">Overview of your social media activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <motion.div key={card.label} variants={item} className="glass-card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-soft-white">
              {isLoading ? <span className="skeleton inline-block w-12 h-8" /> : card.value}
            </p>
            <p className="text-xs text-soft-gray mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <motion.div variants={item} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-soft-white mb-4">Recent Posts</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 hover:bg-white/4 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white/4 skeleton" />
                <div className="flex-1">
                  <div className="h-3 w-32 bg-white/4 rounded skeleton" />
                  <div className="h-2 w-20 bg-white/2 rounded mt-2 skeleton" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Platform Status */}
        <motion.div variants={item} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-soft-white mb-4">Platform Status</h2>
          <div className="space-y-3">
            {['Facebook', 'Instagram', 'LinkedIn', 'WhatsApp'].map((platform) => (
              <div key={platform} className="flex items-center justify-between p-3 rounded-xl bg-white/2">
                <span className="text-sm text-soft-white">{platform}</span>
                <span className="text-xs text-soft-gray">Not connected</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Reach', value: '—', icon: Eye, color: 'text-cherry-light' },
          { label: 'Engagement', value: '—', icon: TrendingUp, color: 'text-green-400' },
          { label: 'Followers', value: '—', icon: Users, color: 'text-blue-400' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item} className="glass-card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-soft-white">{stat.value}</p>
            <p className="text-xs text-soft-gray mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
