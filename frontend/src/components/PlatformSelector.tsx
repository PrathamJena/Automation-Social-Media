import { motion } from 'framer-motion'
import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react'

interface PlatformSelectorProps {
  selected: string[]
  onToggle: (platform: string) => void
}

const platforms = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', description: 'Posts to your page' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-600', description: 'Posts to your feed' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', description: 'Professional network' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-600', description: 'Business messaging' },
]

export default function PlatformSelector({ selected, onToggle }: PlatformSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {platforms.map((platform) => {
        const isSelected = selected.includes(platform.id)
        return (
          <motion.button
            key={platform.id}
            onClick={() => onToggle(platform.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl border text-left transition-all duration-200 ${
              isSelected
                ? 'border-cherry/40 bg-cherry/10 shadow-cherry-glow'
                : 'border-white/8 bg-white/2 hover:bg-white/4 hover:border-white/12'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${platform.color} flex items-center justify-center`}>
                <platform.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-soft-white">{platform.name}</p>
                <p className="text-xs text-soft-gray">{platform.description}</p>
              </div>
            </div>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cherry flex items-center justify-center"
              >
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
