import apiClient from './client'

export interface User {
  id: string
  name: string
  email: string
  role: string
  is_active: string
  created_at: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role?: string
}

export const getUsers = async () => {
  const response = await apiClient.get<User[]>('/users/')
  return response.data
}

export const createUser = async (data: CreateUserRequest) => {
  const response = await apiClient.post<User>('/users/', data)
  return response.data
}

export const updateUser = async (id: string, data: Partial<CreateUserRequest>) => {
  const response = await apiClient.put<User>(`/users/${id}`, data)
  return response.data
}

export const deleteUser = async (id: string) => {
  const response = await apiClient.delete(`/users/${id}`)
  return response.data
}
