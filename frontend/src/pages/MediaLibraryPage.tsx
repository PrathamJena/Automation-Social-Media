import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Grid, List, Search, Image, Video, Trash2, Eye, X, FileVideo, FileImage } from 'lucide-react'
import { uploadMedia } from '../api/media'

interface MediaItem {
  id: string
  url: string
  file_type: string
  file_name: string
  file_size: number
  created_at: string
}

export default function MediaLibraryPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'images' | 'videos'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const result = await uploadMedia(file)
      const newItem: MediaItem = {
        id: Date.now().toString(),
        url: result.url,
        file_type: result.file_type,
        file_name: result.file_name,
        file_size: result.file_size,
        created_at: new Date().toISOString(),
      }
      setMediaItems([newItem, ...mediaItems])
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleUpload(files[0])
    }
  }

  const handleDelete = (id: string) => {
    setMediaItems(mediaItems.filter((item) => item.id !== id))
  }

  const filteredItems = mediaItems.filter((item) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'images' && item.file_type.startsWith('image/')) ||
      (filter === 'videos' && item.file_type.startsWith('video/'))
    const matchesSearch = item.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-soft-white">Media Library</h1>
          <p className="text-sm text-soft-gray mt-1">Manage your uploaded media</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-primary flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['all', 'images', 'videos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                filter === f
                  ? 'bg-cherry/15 text-cherry-light border border-cherry/30'
                  : 'bg-white/4 text-soft-gray hover:bg-white/6'
              }`}
            >
              {f === 'images' && <Image className="w-4 h-4" />}
              {f === 'videos' && <Video className="w-4 h-4" />}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-gray" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 py-2 text-sm w-64"
            />
          </div>
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-xl transition-colors ${view === 'grid' ? 'bg-cherry/15 text-cherry-light' : 'bg-white/4 text-soft-gray'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-xl transition-colors ${view === 'list' ? 'bg-cherry/15 text-cherry-light' : 'bg-white/4 text-soft-gray'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Media Grid/List */}
      {filteredItems.length > 0 ? (
        view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card-hover overflow-hidden group"
                >
                  <div className="aspect-square bg-white/4 relative">
                    {item.file_type.startsWith('image/') ? (
                      <img src={item.url} alt={item.file_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileVideo className="w-12 h-12 text-soft-gray" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-soft-white truncate">{item.file_name}</p>
                    <p className="text-xs text-soft-gray mt-1">{formatFileSize(item.file_size)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Name</th>
                  <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Type</th>
                  <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Size</th>
                  <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Uploaded</th>
                  <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/4 flex items-center justify-center">
                          {item.file_type.startsWith('image/') ? (
                            <FileImage className="w-5 h-5 text-soft-gray" />
                          ) : (
                            <FileVideo className="w-5 h-5 text-soft-gray" />
                          )}
                        </div>
                        <span className="text-sm text-soft-white">{item.file_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-soft-gray">{item.file_type}</td>
                    <td className="px-6 py-4 text-sm text-soft-gray">{formatFileSize(item.file_size)}</td>
                    <td className="px-6 py-4 text-sm text-soft-gray">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="p-2 rounded-lg hover:bg-white/4 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-soft-gray" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="glass-card p-12 text-center">
          <Upload className="w-12 h-12 text-soft-gray mx-auto mb-4" />
          <p className="text-soft-white font-medium">No media uploaded yet</p>
          <p className="text-sm text-soft-gray mt-1">Upload images and videos to get started</p>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-soft-white">{previewItem.file_name}</h3>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-lg hover:bg-white/4 text-soft-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video bg-matte-black rounded-xl overflow-hidden flex items-center justify-center">
                {previewItem.file_type.startsWith('image/') ? (
                  <img src={previewItem.url} alt={previewItem.file_name} className="w-full h-full object-contain" />
                ) : (
                  <video src={previewItem.url} className="w-full h-full object-contain" controls />
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-soft-gray">
                <span>{previewItem.file_type}</span>
                <span>{formatFileSize(previewItem.file_size)}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
