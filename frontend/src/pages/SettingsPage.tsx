import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Shield,
  Bell,
  Share2,
  Database,
  Settings as SettingsIcon,
  Loader2,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { changePassword, updateProfile } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import { getAIStatus } from '../api/ai'
import { getSocialAccounts } from '../api/socialAccounts'

const MIN_PASSWORD_LENGTH = 10

const sections = [
  { id: 'account', name: 'Account', icon: User },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'integrations', name: 'Social Integrations', icon: Share2 },
  { id: 'storage', name: 'Storage', icon: Database },
  { id: 'system', name: 'System', icon: SettingsIcon },
]

type Feedback = { kind: 'success' | 'error'; text: string } | null

export default function SettingsPage() {
  const { user, setUser } = useAuth()
  const [activeSection, setActiveSection] = useState('account')

  // Profile
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [profileBusy, setProfileBusy] = useState(false)
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null)

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null)

  // System info
  const [aiStatus, setAiStatus] = useState<{ model: string; base_url: string } | null>(null)
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  useEffect(() => {
    if (activeSection === 'system') {
      getAIStatus()
        .then((s) => setAiStatus({ model: s.model, base_url: s.base_url }))
        .catch(() => setAiStatus(null))
    }
    if (activeSection === 'integrations') {
      getSocialAccounts()
        .then((accounts) =>
          setConnectedPlatforms(
            accounts.filter((a) => a.status === 'connected').map((a) => a.platform)
          )
        )
        .catch(() => setConnectedPlatforms([]))
    }
  }, [activeSection])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileFeedback(null)

    if (!name.trim()) {
      setProfileFeedback({ kind: 'error', text: 'Name cannot be empty' })
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setProfileFeedback({ kind: 'error', text: 'Enter a valid email address' })
      return
    }

    setProfileBusy(true)
    try {
      const updated = await updateProfile({ name: name.trim(), email: email.trim() })
      // Keep the client-side session in step with the new details
      setUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      })
      setProfileFeedback({ kind: 'success', text: 'Profile updated' })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Could not update your profile'
      setProfileFeedback({ kind: 'error', text: message })
    } finally {
      setProfileBusy(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordFeedback(null)

    if (!currentPassword) {
      setPasswordFeedback({ kind: 'error', text: 'Enter your current password' })
      return
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordFeedback({
        kind: 'error',
        text: `New password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ kind: 'error', text: 'New passwords do not match' })
      return
    }
    if (newPassword === currentPassword) {
      setPasswordFeedback({
        kind: 'error',
        text: 'New password must be different from the current one',
      })
      return
    }

    setPasswordBusy(true)
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordFeedback({
        kind: 'success',
        text: 'Password updated. Use it next time you sign in.',
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update your password'
      setPasswordFeedback({ kind: 'error', text: message })
    } finally {
      setPasswordBusy(false)
    }
  }

  const feedbackClass = (f: Feedback) =>
    f?.kind === 'success'
      ? 'bg-green-500/10 border border-green-600/30 text-green-400'
      : 'bg-red-900/20 border border-red-800/30 text-red-300'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-soft-white">Settings</h1>
        <p className="text-sm text-soft-gray mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section navigation */}
        <nav className="glass-card p-4 space-y-1 h-fit">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id)
                setProfileFeedback(null)
                setPasswordFeedback(null)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-cherry/10 text-cherry-light border border-cherry/20'
                  : 'text-soft-gray hover:bg-white/4 hover:text-soft-white'
              }`}
            >
              <section.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{section.name}</span>
            </button>
          ))}
        </nav>

        {/* Section content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'account' && (
                <form onSubmit={handleProfileSave} className="glass-card p-6 space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-soft-white">Account</h2>
                    <p className="text-sm text-soft-gray mt-1">Your name and sign-in email</p>
                  </div>

                  {profileFeedback && (
                    <div
                      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${feedbackClass(profileFeedback)}`}
                    >
                      {profileFeedback.kind === 'success' ? (
                        <Check className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      )}
                      {profileFeedback.text}
                    </div>
                  )}

                  <div>
                    <label htmlFor="profile-name" className="block text-sm font-medium text-soft-gray mb-2">
                      Name
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-email" className="block text-sm font-medium text-soft-gray mb-2">
                      Email
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      placeholder="you@company.com"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="submit" disabled={profileBusy} className="btn-primary flex items-center gap-2">
                      {profileBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Changes
                    </button>
                    {profileFeedback?.kind === 'success' && (
                      <span className="text-sm text-green-400">Saved</span>
                    )}
                  </div>
                </form>
              )}

              {activeSection === 'security' && (
                <form onSubmit={handlePasswordChange} className="glass-card p-6 space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-soft-white">Security</h2>
                    <p className="text-sm text-soft-gray mt-1">
                      Change the password you use to sign in
                    </p>
                  </div>

                  {passwordFeedback && (
                    <div
                      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${feedbackClass(passwordFeedback)}`}
                    >
                      {passwordFeedback.kind === 'success' ? (
                        <Check className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      )}
                      {passwordFeedback.text}
                    </div>
                  )}

                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-soft-gray mb-2">
                      Current password
                    </label>
                    <input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input-field"
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                    />
                  </div>

                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-soft-gray mb-2">
                      New password
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field"
                      placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                      autoComplete="new-password"
                    />
                    {newPassword && (
                      <p
                        className={`text-xs mt-1.5 ${
                          newPassword.length >= MIN_PASSWORD_LENGTH ? 'text-green-400' : 'text-soft-gray'
                        }`}
                      >
                        {newPassword.length}/{MIN_PASSWORD_LENGTH} characters minimum
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-soft-gray mb-2">
                      Confirm new password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field"
                      placeholder="Re-enter your new password"
                      autoComplete="new-password"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-400 mt-1.5">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={passwordBusy}
                    className="btn-primary flex items-center gap-2"
                  >
                    {passwordBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                    Update Password
                  </button>
                </form>
              )}

              {activeSection === 'notifications' && (
                <div className="glass-card p-6 space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-soft-white">Notifications</h2>
                    <p className="text-sm text-soft-gray mt-1">Choose what you want to hear about</p>
                  </div>

                  {[
                    { label: 'Post published', description: 'Confirm when a post goes out' },
                    { label: 'Post failed', description: 'Tell me when publishing fails' },
                    { label: 'Account disconnected', description: 'Alert me if an account unlinks' },
                    { label: 'Scheduled post reminder', description: 'Remind me before a post is due' },
                    { label: 'Token expired', description: 'Tell me when a connection needs redoing' },
                  ].map((pref) => (
                    <label
                      key={pref.label}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/2 cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-medium text-soft-white">{pref.label}</p>
                        <p className="text-xs text-soft-gray mt-1">{pref.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded border-white/20 bg-white/4 text-cherry focus:ring-cherry/30"
                      />
                    </label>
                  ))}

                  <p className="text-xs text-soft-gray">
                    Preferences are stored per user and apply to this browser.
                  </p>
                </div>
              )}

              {activeSection === 'integrations' && (
                <div className="glass-card p-6 space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-soft-white">Social Integrations</h2>
                    <p className="text-sm text-soft-gray mt-1">
                      Connected accounts for publishing
                    </p>
                  </div>

                  {['facebook', 'instagram', 'linkedin', 'whatsapp'].map((platform) => {
                    const isConnected = connectedPlatforms.includes(platform)
                    return (
                      <div
                        key={platform}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/2"
                      >
                        <span className="text-sm font-medium text-soft-white capitalize">
                          {platform === 'whatsapp' ? 'WhatsApp Business' : platform}
                        </span>
                        {isConnected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs">
                            <Check className="w-3 h-3" />
                            Connected
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-white/6 text-soft-gray text-xs">
                            Not connected
                          </span>
                        )}
                      </div>
                    )
                  })}

                  <p className="text-xs text-soft-gray">
                    Connect accounts from the Social Accounts page. Credentials are never
                    entered here.
                  </p>
                </div>
              )}

              {activeSection === 'storage' && (
                <div className="glass-card p-6 space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-soft-white">Storage</h2>
                    <p className="text-sm text-soft-gray mt-1">
                      Where uploaded media is kept
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/2 space-y-2">
                    <p className="text-sm text-soft-white">S3-compatible storage</p>
                    <p className="text-xs text-soft-gray">
                      Configured through environment variables so credentials stay out of the
                      database. Set <code className="text-cherry-light">S3_ENDPOINT</code> in your{' '}
                      <code className="text-cherry-light">.env</code> to use AWS S3, Cloudflare R2 or
                      Supabase Storage. With no endpoint set, files are stored on the local disk.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'system' && (
                <div className="glass-card p-6 space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-soft-white">System</h2>
                    <p className="text-sm text-soft-gray mt-1">Runtime information</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Application', value: 'AakSidhi Automation' },
                      { label: 'Version', value: '1.0.0' },
                      {
                        label: 'Signed in as',
                        value: user ? `${user.email} (${user.role})` : '—',
                      },
                      {
                        label: 'AI provider',
                        value: aiStatus ? `${aiStatus.model}` : 'Checking…',
                      },
                    ].map((info) => (
                      <div
                        key={info.label}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/2"
                      >
                        <span className="text-sm text-soft-gray">{info.label}</span>
                        <span className="text-sm text-soft-white">{info.value}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-soft-gray">
                    Secrets are never shown here. Inspect your{' '}
                    <code className="text-cherry-light">.env</code> file if you need to change them.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
