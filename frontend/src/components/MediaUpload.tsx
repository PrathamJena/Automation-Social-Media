import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileVideo, Loader2 } from 'lucide-react'
import { uploadMedia } from '../api/media'

interface MediaUploadProps {
  onUploadComplete: (
    url: string,
    fileType: string,
    fileName: string,
    fileSize: number,
    file: File
  ) => void
  onRemove: () => void
}

export default function MediaUpload({ onUploadComplete, onRemove }: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<{
    url: string
    file_type: string
    file_name: string
    file_size: number
  } | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    setError('')

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      setError('File type not supported. Use JPG, PNG, WEBP, MP4, or MOV.')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90))
    }, 100)

    try {
      const result = await uploadMedia(file)
      setUploadProgress(100)
      setUploadedFile(result)
      onUploadComplete(result.url, result.file_type, result.file_name, result.file_size, file)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
    } finally {
      clearInterval(progressInterval)
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    onRemove()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {uploadedFile ? (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-white/4 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {uploadedFile.file_type.startsWith('image/') ? (
                  <img src={uploadedFile.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FileVideo className="w-8 h-8 text-soft-gray" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-soft-white truncate">{uploadedFile.file_name}</p>
                <p className="text-xs text-soft-gray mt-1">{formatFileSize(uploadedFile.file_size)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-green-400">Uploaded</span>
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="p-2 rounded-lg hover:bg-red-900/20 text-soft-gray hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-cherry/50 bg-cherry/5'
                  : 'border-white/10 hover:border-cherry/30 hover:bg-white/2'
              }`}
            >
              {uploading ? (
                <div className="space-y-3">
                  <Loader2 className="w-8 h-8 text-cherry-light mx-auto animate-spin" />
                  <div className="w-full max-w-xs mx-auto">
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-cherry rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-soft-gray mt-2">{uploadProgress}% uploaded</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-soft-gray mx-auto mb-3" />
                  <p className="text-sm text-soft-gray">Drag and drop or click to upload</p>
                  <p className="text-xs text-soft-gray/60 mt-1">JPG, PNG, WEBP, MP4, MOV</p>
                </>
              )}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 mt-2"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
