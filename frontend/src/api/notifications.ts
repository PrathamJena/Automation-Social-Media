import apiClient from './client'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  is_read: string
  created_at: string
}

export const getNotifications = async () => {
  const response = await apiClient.get<Notification[]>('/notifications/')
  return response.data
}

export const markAsRead = async (id: string) => {
  const response = await apiClient.put(`/notifications/${id}/read`)
  return response.data
}
