import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bell, Check, CheckCheck, AlertTriangle, XCircle, Clock } from 'lucide-react'
import { getNotifications, markAsRead } from '../api/notifications'

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'post_published':
      return <Check className="w-4 h-4 text-green-400" />
    case 'post_failed':
      return <XCircle className="w-4 h-4 text-red-400" />
    case 'account_disconnected':
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />
    case 'post_approaching':
      return <Clock className="w-4 h-4 text-blue-400" />
    case 'token_expired':
      return <AlertTriangle className="w-4 h-4 text-orange-400" />
    default:
      return <Bell className="w-4 h-4 text-soft-gray" />
  }
}

export default function NotificationsPage() {
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  })

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
    refetch()
  }

  const handleMarkAllRead = async () => {
    if (notifications) {
      await Promise.all(
        notifications
          .filter((n) => n.is_read === 'N')
          .map((n) => markAsRead(n.id))
      )
      refetch()
    }
  }

  const unreadCount = notifications?.filter((n) => n.is_read === 'N').length ?? 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-soft-white">Notifications</h1>
          <p className="text-sm text-soft-gray mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-white/4">
              <div className="skeleton h-4 w-48 mb-2" />
              <div className="skeleton h-3 w-32" />
            </div>
          ))
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 border-b border-white/4 hover:bg-white/2 transition-colors ${
                notification.is_read === 'N' ? 'bg-cherry/3' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-soft-white">{notification.title}</p>
                    {notification.is_read === 'N' && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1 rounded-lg hover:bg-white/4 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4 text-soft-gray" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-soft-gray mt-1">{notification.message}</p>
                  <p className="text-xs text-soft-gray/50 mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-12 text-center">
            <Bell className="w-8 h-8 text-soft-gray mx-auto mb-3" />
            <p className="text-sm text-soft-gray">No notifications</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
