import { useState } from 'react'
import { motion } from 'framer-motion'
import { Facebook, Instagram, Linkedin, MessageCircle, Plus, Loader2, Check, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getSocialAccounts, disconnectAccount } from '../api/socialAccounts'
import { initiateOAuth } from '../api/oauth'

const platforms = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', description: 'Connect your Facebook page' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-600', description: 'Connect your Instagram account' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', description: 'Connect your LinkedIn profile' },
  { id: 'whatsapp', name: 'WhatsApp Business', icon: MessageCircle, color: 'bg-green-600', description: 'Connect WhatsApp Business' },
]

export default function SocialAccountsPage() {
  const { data: accounts, refetch } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: getSocialAccounts,
  })
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId)
    setError('')

    try {
      const { auth_url } = await initiateOAuth(platformId)
      // Open OAuth in a popup
      const width = 600
      const height = 700
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      window.open(
        auth_url,
        'oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      // Listen for OAuth completion
      const checkConnection = setInterval(async () => {
        try {
          await refetch()
          clearInterval(checkConnection)
          setConnecting(null)
        } catch {
          // Ignore errors during polling
        }
      }, 2000)

      // Stop checking after 2 minutes
      setTimeout(() => {
        clearInterval(checkConnection)
        setConnecting(null)
      }, 120000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initiate OAuth'
      setError(message)
      setConnecting(null)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    try {
      await disconnectAccount(accountId)
      refetch()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect'
      setError(message)
    }
  }

  const getConnectedAccount = (platformId: string) => {
    return accounts?.find(
      (acc) => acc.platform === platformId && acc.status === 'connected'
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-soft-white">Social Accounts</h1>
        <p className="text-sm text-soft-gray mt-1">Connect your social media accounts</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-xl px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const connectedAccount = getConnectedAccount(platform.id)
          const isConnected = !!connectedAccount
          const isConnecting = connecting === platform.id

          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-hover p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center`}>
                    <platform.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-soft-white">{platform.name}</h3>
                    <p className="text-xs text-soft-gray">{platform.description}</p>
                  </div>
                </div>
                {isConnected && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs">
                    <Check className="w-3 h-3" />
                    Connected
                  </span>
                )}
              </div>

              {isConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/2">
                    <div>
                      <p className="text-sm font-medium text-soft-white">
                        {connectedAccount.account_name || 'Account'}
                      </p>
                      <p className="text-xs text-soft-gray">ID: {connectedAccount.account_id || '—'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary flex-1 text-sm">Manage</button>
                    <button
                      onClick={() => handleDisconnect(connectedAccount.id)}
                      className="btn-danger flex-1 text-sm flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(platform.id)}
                  disabled={isConnecting}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Connect Account
                    </>
                  )}
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="glass-card p-4">
        <p className="text-xs text-soft-gray">
          <strong className="text-soft-white">Security Note:</strong> We use official OAuth 2.0 flows.
          Your credentials are never stored on our servers. Access tokens are encrypted and stored securely.
        </p>
      </div>
    </motion.div>
  )
}
