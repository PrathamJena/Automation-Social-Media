import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileEdit, Edit, Trash2, Send } from 'lucide-react'
import { getPosts } from '../api/posts'

export default function DraftsPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', 'draft'],
    queryFn: () => getPosts({ status: 'draft' }),
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-soft-white">Drafts</h1>
        <p className="text-sm text-soft-gray mt-1">Your unpublished drafts</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Post</th>
                <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Created</th>
                <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/4">
                    <td className="px-6 py-4"><div className="skeleton h-4 w-32" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-24" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-16" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-8" /></td>
                  </tr>
                ))
              ) : posts && posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/4" />
                        <span className="text-sm text-soft-white max-w-xs truncate">{post.caption || 'No caption'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-soft-gray">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/6 text-soft-gray text-xs">
                        <FileEdit className="w-3 h-3" />
                        Draft
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-white/4 transition-colors" title="Edit">
                          <Edit className="w-4 h-4 text-soft-gray" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-900/20 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/4 transition-colors" title="Publish">
                          <Send className="w-4 h-4 text-soft-gray" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <FileEdit className="w-8 h-8 text-soft-gray mx-auto mb-3" />
                    <p className="text-sm text-soft-gray">No drafts yet</p>
                    <p className="text-xs text-soft-gray/60 mt-1">Save a post as draft to see it here</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
