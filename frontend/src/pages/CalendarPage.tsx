import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import CalendarView from '../components/Calendar'
import { getPosts } from '../api/posts'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', 'scheduled'],
    queryFn: () => getPosts({ status: 'scheduled' }),
  })

  // Turn scheduled posts into calendar events
  const events = useMemo(
    () =>
      (posts || [])
        .filter((post) => post.scheduled_at)
        .map((post) => ({
          id: post.id,
          title: post.caption?.trim().slice(0, 40) || 'Scheduled post',
          date: new Date(post.scheduled_at as string),
          platform: 'scheduled',
          status: post.status,
        })),
    [posts]
  )

  const formatSelected = selectedDate
    ? selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-soft-white">Calendar</h1>
          <p className="text-sm text-soft-gray mt-1">View and manage scheduled posts</p>
        </div>
        {selectedDate && (
          <button
            onClick={() => navigate('/create-post')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New post on {formatSelected}
          </button>
        )}
      </div>

      <motion.div variants={item} className="glass-card p-6">
        <CalendarView
          events={events}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-4 text-sm text-soft-gray">
          <Calendar className="w-4 h-4 animate-pulse" />
          Loading scheduled posts...
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Calendar className="w-10 h-10 text-soft-gray mx-auto mb-3" />
          <p className="text-soft-white font-medium">No scheduled posts yet</p>
          <p className="text-sm text-soft-gray mt-1">
            Pick a date above to create a post for that day.
          </p>
        </div>
      )}
    </motion.div>
  )
}
