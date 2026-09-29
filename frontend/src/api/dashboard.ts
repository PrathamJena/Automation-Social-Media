import apiClient from './client'

export interface DashboardStats {
  total_posts: number
  scheduled: number
  published: number
  failed: number
  drafts: number
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>('/dashboard/stats')
  return response.data
}
