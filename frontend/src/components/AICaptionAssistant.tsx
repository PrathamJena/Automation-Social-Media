import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, Wand2, X, ImageIcon } from 'lucide-react'
import { generateCaption, captionFromImage } from '../api/ai'

interface AICaptionAssistantProps {
  onCaptionGenerated: (caption: string, hashtags: string[]) => void
  currentPlatform: string
  /** The file the user already uploaded, enables "write from this image". */
  imageFile?: File | null
}

const tones = ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Inspirational', 'Humorous']
const audiences = [
  'General',
  'Business Professionals',
  'Young Adults',
  'Tech Enthusiasts',
  'Marketers',
  'Creatives',
]

export default function AICaptionAssistant({
  onCaptionGenerated,
  currentPlatform,
  imageFile,
}: AICaptionAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'topic' | 'image'>(imageFile ? 'image' : 'topic')
  const [topic, setTopic] = useState('')
  const [context, setContext] = useState('')
  const [tone, setTone] = useState('Professional')
  const [platform, setPlatform] = useState(currentPlatform || 'Instagram')
  const [audience, setAudience] = useState('General')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')

    try {
      if (mode === 'image') {
        if (!imageFile) {
          setError('Upload an image first, then AI can write about it.')
          return
        }
        const result = await captionFromImage(imageFile, { tone, audience, context })
        onCaptionGenerated(result.caption, result.hashtags)
      } else {
        if (!topic) {
          setError('Please enter a topic')
          return
        }
        const result = await generateCaption({ topic, tone, platform, audience })
        onCaptionGenerated(result.caption, result.hashtags)
      }
      setIsOpen(false)
      setTopic('')
      setContext('')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Could not generate a caption. Try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-secondary flex items-center gap-2 text-sm"
      >
        <Sparkles className="w-4 h-4" />
        AI
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cherry/15 flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-cherry-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-soft-white">AI Caption Assistant</h3>
                    <p className="text-xs text-soft-gray">Runs locally via Ollama</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/4 text-soft-gray"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800/30 rounded-xl px-4 py-3 text-sm text-red-300 mb-4">
                  {error}
                </div>
              )}

              {/* Mode switch */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setMode('image')}
                  disabled={!imageFile}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    mode === 'image'
                      ? 'bg-cherry/15 text-cherry-light border border-cherry/30'
                      : 'bg-white/5 text-soft-gray hover:bg-white/10'
                  } ${!imageFile ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <ImageIcon className="w-4 h-4" />
                  From my image
                </button>
                <button
                  onClick={() => setMode('topic')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    mode === 'topic'
                      ? 'bg-cherry/15 text-cherry-light border border-cherry/30'
                      : 'bg-white/5 text-soft-gray hover:bg-white/10'
                  }`}
                >
                  From a topic
                </button>
              </div>

              <div className="space-y-4">
                {mode === 'image' ? (
                  <>
                    {imageFile ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="uploaded"
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-sm text-soft-white truncate">{imageFile.name}</p>
                          <p className="text-xs text-soft-gray">AI will look at this picture</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-soft-gray">
                        Upload a picture in the Media box first.
                      </p>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-soft-gray mb-2">
                        Extra details (optional)
                      </label>
                      <input
                        type="text"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="input-field"
                        placeholder="e.g. announcing our new Q3 results"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-soft-gray mb-2">Topic</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="input-field"
                      placeholder="What is your post about?"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-soft-gray mb-2">Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="input-field appearance-none"
                    >
                      {tones.map((t) => (
                        <option key={t} value={t} className="bg-matte-charcoal">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  {mode === 'topic' && (
                    <div>
                      <label className="block text-sm font-medium text-soft-gray mb-2">
                        Platform
                      </label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="input-field appearance-none"
                      >
                        <option value="Instagram" className="bg-matte-charcoal">
                          Instagram
                        </option>
                        <option value="Facebook" className="bg-matte-charcoal">
                          Facebook
                        </option>
                        <option value="LinkedIn" className="bg-matte-charcoal">
                          LinkedIn
                        </option>
                        <option value="WhatsApp" className="bg-matte-charcoal">
                          WhatsApp
                        </option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-soft-gray mb-2">
                    Target audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="input-field appearance-none"
                  >
                    {audiences.map((a) => (
                      <option key={a} value={a} className="bg-matte-charcoal">
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      AI is writing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
