import apiClient from './client'

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export const getAuditLogs = async () => {
  const response = await apiClient.get<AuditLog[]>('/audit-logs/')
  return response.data
}
