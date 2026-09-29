import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react'
import { getDashboardStats } from '../api/dashboard'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  })

  const statCards = [
    { label: 'Total Posts', value: stats?.total_posts ?? 0, icon: BarChart3, color: 'text-cherry-light', bg: 'bg-cherry/10' },
    { label: 'Published', value: stats?.published ?? 0, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Scheduled', value: stats?.scheduled ?? 0, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Failed', value: stats?.failed ?? 0, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ]

  const platformData = [
    { name: 'Facebook', posts: 0, color: 'bg-blue-600' },
    { name: 'Instagram', posts: 0, color: 'bg-pink-600' },
    { name: 'LinkedIn', posts: 0, color: 'bg-blue-700' },
    { name: 'WhatsApp', posts: 0, color: 'bg-green-600' },
  ]

  const activityData = [
    { day: 'Mon', posts: 0 },
    { day: 'Tue', posts: 0 },
    { day: 'Wed', posts: 0 },
    { day: 'Thu', posts: 0 },
    { day: 'Fri', posts: 0 },
    { day: 'Sat', posts: 0 },
    { day: 'Sun', posts: 0 },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-soft-white">Analytics</h1>
        <p className="text-sm text-soft-gray mt-1">Track your social media performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publishing Activity */}
        <motion.div variants={item} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-soft-white mb-4">Publishing Activity</h2>
          <div className="flex items-end gap-2 h-48">
            {activityData.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-white/4 rounded-t-lg relative" style={{ height: '100%' }}>
                  <div
                    className="absolute bottom-0 w-full bg-cherry/30 rounded-t-lg transition-all duration-500"
                    style={{ height: `${Math.max(day.posts * 10, 4)}%` }}
                  />
                </div>
                <span className="text-xs text-soft-gray">{day.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Platform Distribution */}
        <motion.div variants={item} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-soft-white mb-4">Platform Distribution</h2>
          <div className="space-y-4">
            {platformData.map((platform) => (
              <div key={platform.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-soft-white">{platform.name}</span>
                  <span className="text-sm text-soft-gray">{platform.posts} posts</span>
                </div>
                <div className="h-2 bg-white/4 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${platform.color} rounded-full transition-all duration-500`}
                    style={{ width: `${platform.posts > 0 ? 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Success Rate */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="text-lg font-semibold text-soft-white mb-4">Success Rate</h2>
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#C1123F"
                strokeWidth="8"
                strokeDasharray={`${(stats?.published ?? 0) / (stats?.total_posts ?? 1) * 251.2} 251.2`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-soft-white">
                {stats?.total_posts ? Math.round((stats.published / stats.total_posts) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-soft-gray">Published: {stats?.published ?? 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-soft-gray">Failed: {stats?.failed ?? 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-soft-gray">Scheduled: {stats?.scheduled ?? 0}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Unavailable Data Notice */}
      <motion.div variants={item} className="glass-card p-4">
        <p className="text-xs text-soft-gray">
          <strong className="text-soft-white">Note:</strong> Social engagement data (likes, comments, shares) requires
          connected social accounts and platform API access. Connect your accounts to view detailed analytics.
        </p>
      </motion.div>
    </motion.div>
  )
}
