import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import CreatePostPage from './pages/CreatePostPage'
import CalendarPage from './pages/CalendarPage'
import ScheduledPostsPage from './pages/ScheduledPostsPage'
import PublishedPostsPage from './pages/PublishedPostsPage'
import DraftsPage from './pages/DraftsPage'
import MediaLibraryPage from './pages/MediaLibraryPage'
import SocialAccountsPage from './pages/SocialAccountsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import NotificationsPage from './pages/NotificationsPage'
import UsersPage from './pages/UsersPage'
import AuditLogsPage from './pages/AuditLogsPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cherry/30 border-t-cherry rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cherry/30 border-t-cherry rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="create-post" element={<CreatePostPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="scheduled" element={<ScheduledPostsPage />} />
        <Route path="published" element={<PublishedPostsPage />} />
        <Route path="drafts" element={<DraftsPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="social-accounts" element={<SocialAccountsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
