import apiClient from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data)
  return response.data
}

export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me')
  return response.data
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  confirm_password: string
}

export const changePassword = async (data: ChangePasswordRequest) => {
  const response = await apiClient.post<{ message: string }>('/auth/change-password', data)
  return response.data
}

export interface ProfileUpdateRequest {
  name?: string
  email?: string
}

export const updateProfile = async (data: ProfileUpdateRequest) => {
  const response = await apiClient.put('/auth/profile', data)
  return response.data
}
