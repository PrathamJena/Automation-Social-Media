import apiClient from './client'

export interface SocialAccount {
  id: string
  user_id: string
  platform: string
  account_name: string | null
  account_id: string | null
  status: string
  expires_at: string | null
  created_at: string
}

export const getSocialAccounts = async () => {
  const response = await apiClient.get<SocialAccount[]>('/social-accounts/')
  return response.data
}

export const disconnectAccount = async (id: string) => {
  const response = await apiClient.delete(`/social-accounts/${id}`)
  return response.data
}
