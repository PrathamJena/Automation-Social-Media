import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Facebook, Instagram, Linkedin, MessageCircle, Heart, MessageCircle as Comment, Share2, Bookmark, MoreHorizontal } from 'lucide-react'

interface PostPreviewProps {
  caption: string
  hashtags: string[]
  mediaUrl: string
  mediaType: string
  selectedPlatforms: string[]
}

const platformTabs = [
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle },
]

export default function PostPreview({ caption, hashtags, mediaUrl, mediaType, selectedPlatforms }: PostPreviewProps) {
  const [activeTab, setActiveTab] = useState(selectedPlatforms[0] || 'instagram')

  platformTabs.filter((p) => selectedPlatforms.includes(p.id))

  return (
    <div className="space-y-4">
      {/* Platform Tabs */}
      <div className="flex gap-2">
        {platformTabs.map((platform) => {
          const isAvailable = selectedPlatforms.includes(platform.id)
          return (
            <button
              key={platform.id}
              onClick={() => isAvailable && setActiveTab(platform.id)}
              disabled={!isAvailable}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                activeTab === platform.id && isAvailable
                  ? 'bg-cherry/15 text-cherry-light border border-cherry/30'
                  : isAvailable
                  ? 'bg-white/4 text-soft-gray hover:bg-white/6'
                  : 'bg-white/2 text-soft-gray/30 cursor-not-allowed'
              }`}
            >
              <platform.icon className="w-4 h-4" />
              {platform.name}
            </button>
          )
        })}
      </div>

      {/* Preview Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-matte-black rounded-2xl border border-white/8 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cherry/20 flex items-center justify-center">
                <span className="text-sm font-bold text-cherry-light">A</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-soft-white">AakSidhi</p>
                <p className="text-xs text-soft-gray">Sponsored</p>
              </div>
            </div>
            <MoreHorizontal className="w-5 h-5 text-soft-gray" />
          </div>

          {/* Media */}
          <div className="w-full aspect-square bg-white/4 flex items-center justify-center">
            {mediaUrl ? (
              mediaType.startsWith('image/') ? (
                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <video src={mediaUrl} className="w-full h-full object-cover" controls />
              )
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/6 mx-auto mb-3 flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-soft-gray" />
                </div>
                <p className="text-sm text-soft-gray">Media preview</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Heart className="w-6 h-6 text-soft-white" />
              <Comment className="w-6 h-6 text-soft-white" />
              <Share2 className="w-6 h-6 text-soft-white" />
            </div>
            <Bookmark className="w-6 h-6 text-soft-white" />
          </div>

          {/* Caption */}
          <div className="px-4 pb-4">
            <p className="text-sm text-soft-white">
              <span className="font-semibold">AakSidhi </span>
              {caption || 'Your caption will appear here...'}
            </p>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {hashtags.map((tag) => (
                  <span key={tag} className="text-sm text-cherry-light">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="text-xs text-soft-gray text-center">
        Preview is approximate and may not match exact platform styling
      </p>
    </div>
  )
}
