import apiClient from './client'

export interface UploadResponse {
  url: string
  file_name: string
  file_type: string
  file_size: number
}

export const uploadMedia = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<UploadResponse>('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const deleteMedia = async (fileName: string) => {
  const response = await apiClient.delete(`/media/${fileName}`)
  return response.data
}
