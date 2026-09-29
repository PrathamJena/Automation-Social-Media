import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, getCurrentUser } from '../api/auth'
import { useAuthStore } from '../stores/authStore'

interface AuthContextType {
  isLoading: boolean
  isAuthenticated: boolean
  user: { id: string; name: string; email: string; role: string } | null
  loginUser: (email: string, password: string) => Promise<void>
  logoutUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const { user, accessToken, setAuth, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const initAuth = async () => {
      if (accessToken && !user) {
        try {
          const userData = await getCurrentUser()
          setAuth(userData, accessToken, '')
        } catch {
          logout()
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [accessToken, user, setAuth, logout])

  const loginUser = async (email: string, password: string) => {
    const response = await login({ email, password })

    // Store tokens first so the Authorization header is attached to /auth/me
    setAuth(
      { id: '', name: '', email, role: '' },
      response.access_token,
      response.refresh_token
    )

    try {
      const userData = await getCurrentUser()
      setAuth(userData, response.access_token, response.refresh_token)
    } catch {
      // Keep the session even if profile fetch fails
    }

    navigate('/')
  }

  const logoutUser = () => {
    logout()
    navigate('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: !!accessToken && !!user,
        user,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
