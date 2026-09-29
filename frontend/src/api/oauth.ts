import apiClient from './client'

export interface OAuthConnectResponse {
  auth_url: string
  state: string
}

export const initiateOAuth = async (platform: string): Promise<OAuthConnectResponse> => {
  const response = await apiClient.get<OAuthConnectResponse>(`/social-accounts/${platform}/connect`)
  return response.data
}

export const disconnectAccount = async (accountId: string) => {
  const response = await apiClient.post(`/social-accounts/${accountId}/disconnect`)
  return response.data
}

export const getAccountStatus = async (accountId: string) => {
  const response = await apiClient.get(`/social-accounts/${accountId}/status`)
  return response.data
}
