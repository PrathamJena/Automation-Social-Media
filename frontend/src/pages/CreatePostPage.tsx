import { useState } from 'react'
import { motion } from 'framer-motion'
import { Hash, Send, Save, Loader2 } from 'lucide-react'
import MediaUpload from '../components/MediaUpload'
import PlatformSelector from '../components/PlatformSelector'
import SchedulePicker from '../components/SchedulePicker'
import PostPreview from '../components/PostPreview'
import ConfirmModal from '../components/ConfirmModal'
import AICaptionAssistant from '../components/AICaptionAssistant'
import { createPost } from '../api/posts'

export default function CreatePostPage() {
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [newHashtag, setNewHashtag] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaName, setMediaName] = useState('')
  const [mediaSize, setMediaSize] = useState(0)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const addHashtag = () => {
    if (newHashtag && !hashtags.includes(newHashtag)) {
      const tag = newHashtag.startsWith('#') ? newHashtag : `#${newHashtag}`
      setHashtags([...hashtags, tag])
      setNewHashtag('')
    }
  }

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag))
  }

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleMediaUpload = (
    url: string,
    fileType: string,
    fileName: string,
    fileSize: number,
    file: File
  ) => {
    setMediaUrl(url)
    setMediaType(fileType)
    setMediaFile(file)
    setMediaName(fileName)
    setMediaSize(fileSize)
  }

  const handleMediaRemove = () => {
    setMediaUrl('')
    setMediaType('')
    setMediaFile(null)
    setMediaName('')
    setMediaSize(0)
  }

  const selectAllPlatforms = () => {
    setSelectedPlatforms(['facebook', 'instagram', 'linkedin', 'whatsapp'])
  }

  const resetForm = () => {
    setCaption('')
    setHashtags([])
    setNewHashtag('')
    setSelectedPlatforms([])
    setIsScheduled(false)
    setScheduleDate('')
    setScheduleTime('')
    handleMediaRemove()
  }

  const handleCaptionGenerated = (caption: string, generatedHashtags: string[]) => {
    setCaption(caption)
    if (generatedHashtags.length > 0) {
      setHashtags((prev) => [...new Set([...prev, ...generatedHashtags])])
    }
  }

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform')
      return
    }

    if (isScheduled) {
      if (!scheduleDate) {
        setError('Please pick a date to schedule this post')
        return
      }
      if (!scheduleTime) {
        setError('Please pick a time to schedule this post')
        return
      }
      const chosen = new Date(`${scheduleDate}T${scheduleTime}`)
      if (Number.isNaN(chosen.getTime())) {
        setError('That date and time could not be read. Please try again.')
        return
      }
      if (chosen.getTime() <= Date.now()) {
        setError('Pick a time in the future to schedule this post')
        return
      }
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const scheduledAt = isScheduled && scheduleDate && scheduleTime
        ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
        : null

      // Append hashtags to the caption so platforms receive them
      const fullCaption =
        hashtags.length > 0
          ? `${caption}\n\n${hashtags.join(' ')}`.trim()
          : caption

      await createPost({
        caption: fullCaption,
        scheduled_at: scheduledAt || undefined,
        platforms: selectedPlatforms,
        file_url: mediaUrl || undefined,
        file_type: mediaType || undefined,
        file_name: mediaName || undefined,
        file_size: mediaSize ? String(mediaSize) : undefined,
      })

      setShowConfirmModal(false)
      setSuccess(
        isScheduled
          ? `Scheduled to ${selectedPlatforms.length} platform(s).`
          : `Posted to ${selectedPlatforms.length} platform(s).`
      )
      resetForm()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create post'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      await createPost({
        caption: hashtags.length > 0 ? `${caption}\n\n${hashtags.join(' ')}`.trim() : caption,
        platforms: selectedPlatforms,
        file_url: mediaUrl || undefined,
        file_type: mediaType || undefined,
        file_name: mediaName || undefined,
        file_size: mediaSize ? String(mediaSize) : undefined,
      })
      setSuccess('Draft saved.')
      resetForm()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save draft'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Left: Editor */}
      <div className="space-y-6">
        {error && (
          <div className="bg-red-900/20 border border-red-800/30 rounded-xl px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-600/30 rounded-xl px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* Media Upload */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-soft-white mb-4">Media Upload</h2>
          <MediaUpload onUploadComplete={handleMediaUpload} onRemove={handleMediaRemove} />
        </div>

        {/* Caption */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-soft-white">Caption</h2>
            <AICaptionAssistant
              onCaptionGenerated={handleCaptionGenerated}
              currentPlatform={selectedPlatforms[0] || 'instagram'}
              imageFile={mediaFile}
            />
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="input-field min-h-[120px] resize-none"
            placeholder="Write your caption..."
            maxLength={2200}
          />
          <p className="text-xs text-soft-gray text-right mt-2">{caption.length}/2200</p>
        </div>

        {/* Hashtags */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-soft-white mb-4">Hashtags</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
              className="input-field flex-1"
              placeholder="Add hashtag..."
            />
            <button onClick={addHashtag} className="btn-secondary px-4">
              <Hash className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-cherry/10 text-cherry-light text-sm"
              >
                {tag}
                <button onClick={() => removeHashtag(tag)} className="hover:text-white">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Platform Selection */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-soft-white">Platforms</h2>
            <button
              onClick={selectAllPlatforms}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Select all
            </button>
          </div>
          <PlatformSelector selected={selectedPlatforms} onToggle={togglePlatform} />
        </div>

        {/* Scheduling */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-soft-white mb-4">Schedule</h2>
          <SchedulePicker
            isScheduled={isScheduled}
            onToggle={setIsScheduled}
            date={scheduleDate}
            time={scheduleTime}
            timezone={timezone}
            onDateChange={setScheduleDate}
            onTimeChange={setScheduleTime}
            onTimezoneChange={setTimezone}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isSubmitting}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isScheduled ? 'Schedule Post' : 'Publish Now'}
          </button>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="glass-card p-6 h-fit sticky top-6">
        <h2 className="text-lg font-semibold text-soft-white mb-4">Live Preview</h2>
        <PostPreview
          caption={caption}
          hashtags={hashtags}
          mediaUrl={mediaUrl}
          mediaType={mediaType}
          selectedPlatforms={selectedPlatforms}
        />
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handlePublish}
        title={isScheduled ? 'Schedule Post' : 'Publish Post'}
        message={
          isScheduled
            ? `This post will be scheduled for ${scheduleDate} at ${scheduleTime} ${timezone}.`
            : 'This post will be published immediately to selected platforms.'
        }
        confirmText={isScheduled ? 'Schedule' : 'Publish'}
        isLoading={isSubmitting}
      />
    </motion.div>
  )
}
