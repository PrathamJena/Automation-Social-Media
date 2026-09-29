import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Globe } from 'lucide-react'

interface SchedulePickerProps {
  isScheduled: boolean
  onToggle: (scheduled: boolean) => void
  date: string
  time: string
  timezone: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  onTimezoneChange: (timezone: string) => void
}

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
]

export default function SchedulePicker({
  isScheduled,
  onToggle,
  date,
  time,
  timezone,
  onDateChange,
  onTimeChange,
  onTimezoneChange,
}: SchedulePickerProps) {
  // Prevent scheduling in the past
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => onToggle(false)}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            !isScheduled
              ? 'bg-cherry/15 text-cherry-light border border-cherry/30'
              : 'bg-white/4 text-soft-gray border border-white/8 hover:bg-white/6'
          }`}
        >
          Publish Now
        </button>
        <button
          onClick={() => onToggle(true)}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            isScheduled
              ? 'bg-cherry/15 text-cherry-light border border-cherry/30'
              : 'bg-white/4 text-soft-gray border border-white/8 hover:bg-white/6'
          }`}
        >
          Schedule
        </button>
      </div>

      <AnimatePresence>
        {isScheduled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="schedule-date"
                  className="block text-xs font-medium text-soft-gray mb-1.5"
                >
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-gray pointer-events-none" />
                  <input
                    id="schedule-date"
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="input-field pl-10 [color-scheme:dark]"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="schedule-time"
                  className="block text-xs font-medium text-soft-gray mb-1.5"
                >
                  Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-gray pointer-events-none" />
                  <input
                    id="schedule-time"
                    type="time"
                    value={time}
                    onChange={(e) => onTimeChange(e.target.value)}
                    className="input-field pl-10 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-soft-gray mb-1.5">Timezone</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-gray" />
                <select
                  value={timezone}
                  onChange={(e) => onTimezoneChange(e.target.value)}
                  className="input-field pl-10 appearance-none"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz} className="bg-matte-charcoal">
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
