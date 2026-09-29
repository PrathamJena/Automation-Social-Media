import apiClient from './client'

export interface GenerateCaptionRequest {
  topic: string
  tone: string
  platform: string
  audience: string
}

export interface GenerateCaptionResponse {
  caption: string
  hashtags: string[]
}

export interface AIStatus {
  provider: string
  model: string
  vision_model?: string
  base_url: string
  available: boolean
}

export const generateCaption = async (
  data: GenerateCaptionRequest
): Promise<GenerateCaptionResponse> => {
  const response = await apiClient.post<GenerateCaptionResponse>('/ai/generate-caption', data)
  return response.data
}

/** Upload an image and let the AI write a caption based on what it sees. */
export const captionFromImage = async (
  file: File,
  options: { tone: string; audience: string; context?: string }
): Promise<GenerateCaptionResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('tone', options.tone)
  formData.append('audience', options.audience)
  formData.append('context', options.context || '')

  const response = await apiClient.post<GenerateCaptionResponse>(
    '/ai/caption-from-image',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return response.data
}

export const getAIStatus = async (): Promise<AIStatus> => {
  const response = await apiClient.get<AIStatus>('/ai/status')
  return response.data
}
