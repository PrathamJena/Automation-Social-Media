import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../contexts/AuthContext'
import CreatePostPage from '../pages/CreatePostPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{ui}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('CreatePostPage', () => {
  it('renders create post form', () => {
    renderWithProviders(<CreatePostPage />)
    expect(screen.getByText('Media Upload')).toBeInTheDocument()
    expect(screen.getByText('Caption')).toBeInTheDocument()
    expect(screen.getByText('Hashtags')).toBeInTheDocument()
    expect(screen.getByText('Platforms')).toBeInTheDocument()
    expect(screen.getAllByText('Schedule').length).toBeGreaterThan(0)
  })

  it('renders platform selector', () => {
    renderWithProviders(<CreatePostPage />)
    expect(screen.getAllByText('Facebook').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Instagram').length).toBeGreaterThan(0)
    expect(screen.getAllByText('LinkedIn').length).toBeGreaterThan(0)
    expect(screen.getAllByText('WhatsApp').length).toBeGreaterThan(0)
  })

  it('renders action buttons', () => {
    renderWithProviders(<CreatePostPage />)
    expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument()
    const publishButtons = screen.getAllByRole('button', { name: /publish now/i })
    expect(publishButtons.length).toBeGreaterThan(0)
  })

  it('toggles schedule mode', () => {
    renderWithProviders(<CreatePostPage />)
    const scheduleButton = screen.getByRole('button', { name: /schedule/i })
    fireEvent.click(scheduleButton)
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Time')).toBeInTheDocument()
  })
})
