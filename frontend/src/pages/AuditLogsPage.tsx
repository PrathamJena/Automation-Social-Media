import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Shield, Search, Filter } from 'lucide-react'
import { useState } from 'react'
import { getAuditLogs } from '../api/auditLogs'

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: getAuditLogs,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const filteredLogs = logs?.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = !actionFilter || log.action === actionFilter
    return matchesSearch && matchesFilter
  })

  const uniqueActions = [...new Set(logs?.map((l) => l.action) ?? [])]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-soft-white">Audit Logs</h1>
        <p className="text-sm text-soft-gray mt-1">Track all system activities and changes</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-gray" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-gray" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-field pl-10 appearance-none pr-8"
          >
            <option value="" className="bg-matte-charcoal">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action} className="bg-matte-charcoal">
                {action}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Action</th>
                <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Entity</th>
                <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">User</th>
                <th className="text-left text-xs font-medium text-soft-gray px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/4">
                    <td className="px-6 py-4"><div className="skeleton h-4 w-24" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-20" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-16" /></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-24" /></td>
                  </tr>
                ))
              ) : filteredLogs && filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg bg-white/6 text-xs text-soft-white">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-soft-gray">{log.entity}</td>
                    <td className="px-6 py-4 text-sm text-soft-gray">{log.user_id || 'System'}</td>
                    <td className="px-6 py-4 text-sm text-soft-gray">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Shield className="w-8 h-8 text-soft-gray mx-auto mb-3" />
                    <p className="text-sm text-soft-gray">No audit logs yet</p>
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
