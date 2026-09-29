import apiClient from './client'

export interface Post {
  id: string
  created_by: string
  caption: string
  status: string
  scheduled_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface CreatePostRequest {
  caption?: string
  scheduled_at?: string
  platforms?: string[]
  file_url?: string
  file_type?: string
  file_name?: string
  file_size?: string
}

export const getPosts = async (params?: { status?: string; skip?: number; limit?: number }) => {
  const response = await apiClient.get<Post[]>('/posts/', { params })
  return response.data
}

export const getPost = async (id: string) => {
  const response = await apiClient.get<Post>(`/posts/${id}`)
  return response.data
}

export const createPost = async (data: CreatePostRequest) => {
  const response = await apiClient.post<Post>('/posts/', data)
  return response.data
}

export const updatePost = async (id: string, data: Partial<CreatePostRequest>) => {
  const response = await apiClient.put<Post>(`/posts/${id}`, data)
  return response.data
}

export const deletePost = async (id: string) => {
  const response = await apiClient.delete(`/posts/${id}`)
  return response.data
}
