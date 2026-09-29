import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Plus, Search, Edit, Trash2, X, Check } from 'lucide-react'
import { getUsers, createUser, updateUser, deleteUser } from '../api/users'

export default function UsersPage() {
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'VIEWER' })
  const [error, setError] = useState('')

  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async () => {
    setError('')
    try {
      await createUser(formData)
      setShowCreateModal(false)
      setFormData({ name: '', email: '', password: '', role: 'VIEWER' })
      refetch()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create user'
      setError(message)
    }
  }

  const handleUpdate = async (id: string) => {
    setError('')
    try {
      await updateUser(id, formData)
      setEditingUser(null)
      setFormData({ name: '', email: '', password: '', role: 'VIEWER' })
      refetch()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update user'
      setError(message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id)
      refetch()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete user'
      setError(message)
    }
  }

  const openEditModal = (user: { id: string; name: string; email: string; role: string }) => {
    setEditingUser(user.id)
    setFormData({ name: user.name, email: user.email, password: '', role: user.role })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-soft-white">Users</h1>
          <p className="text-sm text-soft-gray mt-1">Manage team members and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-xl px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-gray" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Name</th>
                <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Email</th>
                <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Role</th>
                <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/4">
                    <td className="px-6 py-4"><div className="skeleton h-4 w-24" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-32" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-16" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-12" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-8" /></td>
                  </tr>
                ))
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cherry/15 flex items-center justify-center">
                          <span className="text-xs font-medium text-cherry-light">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-soft-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-soft-gray">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs ${
                        user.role === 'ADMIN'
                          ? 'bg-cherry/15 text-cherry-light'
                          : user.role === 'EDITOR'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-white/6 text-soft-gray'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                        user.is_active === 'Y' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {user.is_active === 'Y' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-lg hover:bg-white/4 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-soft-gray" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="w-8 h-8 text-soft-gray mx-auto mb-3" />
                    <p className="text-sm text-soft-gray">No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingUser) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setShowCreateModal(false)
            setEditingUser(null)
            setFormData({ name: '', email: '', password: '', role: 'VIEWER' })
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-5 sm:p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-soft-white">
                {editingUser ? 'Edit User' : 'Create User'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingUser(null)
                }}
                className="p-2 rounded-lg hover:bg-white/4 text-soft-gray"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-soft-gray mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-soft-gray mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="user@company.com"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-soft-gray mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    placeholder="Set password"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-soft-gray mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field appearance-none"
                >
                  <option value="VIEWER" className="bg-matte-charcoal">Viewer</option>
                  <option value="EDITOR" className="bg-matte-charcoal">Editor</option>
                  <option value="ADMIN" className="bg-matte-charcoal">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingUser(null)
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => (editingUser ? handleUpdate(editingUser) : handleCreate())}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
