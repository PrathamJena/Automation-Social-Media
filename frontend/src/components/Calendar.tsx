import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, MoreVertical } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  platform: string
  status: string
}

interface CalendarProps {
  events?: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  /** Fired when the user clicks an empty day cell. */
  onDateSelect?: (date: Date) => void
  selectedDate?: Date | null
}

type ViewMode = 'month' | 'week' | 'day'

export default function Calendar({
  events = [],
  onEventClick,
  onDateSelect,
  selectedDate,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: Date[] = []

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i))
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    // Next month days to fill grid
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }

  const getWeekDays = (date: Date) => {
    const days: Date[] = []
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const formatDateHeader = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate)
      const start = weekDays[0]
      const end = weekDays[6]
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    }
  }

  const renderMonthView = () => {
    const days = getMonthDays(currentDate)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-soft-gray py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((date: Date, index: number) => {
            const dayEvents = getEventsForDate(date)
            const isCurrentMonth = date.getMonth() === currentDate.getMonth()
            const isToday = date.toDateString() === new Date().toDateString()

            const isSelected =
              selectedDate !== undefined &&
              selectedDate !== null &&
              selectedDate.toDateString() === date.toDateString()

            return (
              <div
                key={index}
                role="button"
                tabIndex={0}
                aria-label={`Select ${date.toDateString()}`}
                onClick={() => onDateSelect?.(date)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onDateSelect?.(date)
                  }
                }}
                className={`min-h-[100px] rounded-xl p-2 border transition-all cursor-pointer ${
                  isCurrentMonth
                    ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    : 'border-white/5 bg-white/2 hover:bg-white/5'
                } ${isToday ? 'border-cherry/30 bg-cherry/5' : ''} ${
                  isSelected ? 'ring-2 ring-cherry/60 border-cherry/40' : ''
                }`}
              >
                <p className={`text-xs font-medium mb-1 ${isCurrentMonth ? 'text-soft-white' : 'text-soft-gray/40'}`}>
                  {date.getDate()}
                </p>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event)
                        onEventClick?.(event)
                      }}
                      className="w-full text-left px-2 py-1 rounded-lg bg-cherry/15 text-cherry-light text-xs truncate hover:bg-cherry/25 transition-colors"
                    >
                      {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="text-xs text-soft-gray px-2">+{dayEvents.length - 2} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const days = getWeekDays(currentDate)
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="text-xs font-medium text-soft-gray py-2">Time</div>
          {days.map((day, index) => (
            <div key={index} className="text-center">
              <p className="text-xs font-medium text-soft-gray">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
              <p className={`text-sm font-bold ${day.toDateString() === new Date().toDateString() ? 'text-cherry-light' : 'text-soft-white'}`}>
                {day.getDate()}
              </p>
            </div>
          ))}
        </div>
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-2 min-h-[60px]">
              <div className="text-xs text-soft-gray py-2">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {days.map((day, dayIndex) => {
                const dayEvents = getEventsForDate(day).filter((event) => {
                  const eventHour = new Date(event.date).getHours()
                  return eventHour === hour
                })
                return (
                  <div key={dayIndex} className="border-t border-white/4 p-1">
                    {dayEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => {
                          setSelectedEvent(event)
                          onEventClick?.(event)
                        }}
                        className="w-full text-left px-2 py-1 rounded-lg bg-cherry/15 text-cherry-light text-xs truncate hover:bg-cherry/25 transition-colors"
                      >
                        {event.title}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const dayEvents = getEventsForDate(currentDate)

    return (
      <div className="space-y-2">
        <div className="space-y-1">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter((event) => {
              const eventHour = new Date(event.date).getHours()
              return eventHour === hour
            })
            return (
              <div key={hour} className="grid grid-cols-[80px_1fr] gap-4 min-h-[60px]">
                <div className="text-xs text-soft-gray py-2">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="border-t border-white/4 p-2">
                  {hourEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event)
                        onEventClick?.(event)
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-cherry/15 text-cherry-light text-sm hover:bg-cherry/25 transition-colors"
                    >
                      <p className="font-medium">{event.title}</p>
                      <p className="text-xs text-soft-gray mt-1">
                        {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('prev')}
            className="p-2 rounded-xl hover:bg-white/4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-soft-gray" />
          </button>
          <span className="text-sm font-medium text-soft-white px-4 min-w-[200px] text-center">
            {formatDateHeader()}
          </span>
          <button
            onClick={() => navigate('next')}
            className="p-2 rounded-xl hover:bg-white/4 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-soft-gray" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                viewMode === mode
                  ? 'bg-cherry/15 text-cherry-light border border-cherry/30'
                  : 'bg-white/4 text-soft-gray hover:bg-white/6'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </motion.div>
      </AnimatePresence>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-cherry/15 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-cherry-light" />
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 rounded-lg hover:bg-white/4 text-soft-gray"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-soft-white mb-2">{selectedEvent.title}</h3>
              <div className="space-y-2 text-sm text-soft-gray">
                <p>Platform: {selectedEvent.platform}</p>
                <p>Status: {selectedEvent.status}</p>
                <p>Time: {new Date(selectedEvent.date).toLocaleString()}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
