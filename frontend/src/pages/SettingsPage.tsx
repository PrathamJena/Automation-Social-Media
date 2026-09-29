import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, Bell, Share2, Database, Settings } from 'lucide-react'

const sections = [
  { id: 'account', name: 'Account', icon: User, description: 'Manage your profile and personal information' },
  { id: 'security', name: 'Security', icon: Shield, description: 'Password, sessions, and authentication' },
  { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Email and push notification preferences' },
  { id: 'integrations', name: 'Social Integrations', icon: Share2, description: 'Connected platforms and API keys' },
  { id: 'storage', name: 'Storage', icon: Database, description: 'S3 configuration and file management' },
  { id: 'system', name: 'System', icon: Settings, description: 'Application settings and environment' },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-soft-white">Settings</h1>
        <p className="text-sm text-soft-gray mt-1">Manage your application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="glass-card p-4 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-cherry/15 text-cherry-light border border-cherry/20'
                  : 'text-soft-gray hover:bg-white/4 hover:text-soft-white'
              }`}
            >
              <section.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{section.name}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'account' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-soft-white mb-4">Account Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-soft-gray mb-2">Name</label>
                  <input type="text" className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-soft-gray mb-2">Email</label>
                  <input type="email" className="input-field" placeholder="your@email.com" />
                </div>
                <button className="btn-primary">Save Changes</button>
              </div>
            </motion.div>
          )}

          {activeSection === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-soft-white mb-4">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-soft-gray mb-2">Current Password</label>
                  <input type="password" className="input-field" placeholder="Enter current password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-soft-gray mb-2">New Password</label>
                  <input type="password" className="input-field" placeholder="Enter new password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-soft-gray mb-2">Confirm New Password</label>
                  <input type="password" className="input-field" placeholder="Confirm new password" />
                </div>
                <button className="btn-primary">Update Password</button>
              </div>
            </motion.div>
          )}

          {activeSection === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-soft-white mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Post Published', description: 'Get notified when a post is published successfully' },
                  { label: 'Post Failed', description: 'Get notified when a post fails to publish' },
                  { label: 'Account Disconnected', description: 'Get notified when a social account is disconnected' },
                  { label: 'Scheduled Post Reminder', description: 'Get reminded before a scheduled post' },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between p-4 rounded-xl bg-white/2">
                    <div>
                      <p className="text-sm font-medium text-soft-white">{pref.label}</p>
                      <p className="text-xs text-soft-gray mt-1">{pref.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-white/8 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cherry"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-soft-white mb-4">Social Integrations</h2>
              <div className="space-y-4">
                {[
                  { name: 'Facebook', status: 'Not configured', configured: false },
                  { name: 'Instagram', status: 'Not configured', configured: false },
                  { name: 'LinkedIn', status: 'Not configured', configured: false },
                  { name: 'WhatsApp Business', status: 'Not configured', configured: false },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 rounded-xl bg-white/2">
                    <div>
                      <p className="text-sm font-medium text-soft-white">{integration.name}</p>
                      <p className="text-xs text-soft-gray mt-1">{integration.status}</p>
                    </div>
                    <button className="btn-secondary text-sm">Configure</button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'storage' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-soft-white mb-4">Storage Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-soft-gray mb-2">S3 Provider</label>
                  <select className="input-field appearance-none">
                    <option value="minio" className="bg-matte-charcoal">MinIO (Local)</option>
                    <option value="aws" className="bg-matte-charcoal">AWS S3</option>
                    <option value="r2" className="bg-matte-charcoal">Cloudflare R2</option>
                    <option value="supabase" className="bg-matte-charcoal">Supabase Storage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-soft-gray mb-2">Endpoint</label>
                  <input type="text" className="input-field" placeholder="https://s3.example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-soft-gray mb-2">Bucket</label>
                  <input type="text" className="input-field" placeholder="aksidhi-media" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-soft-gray mb-2">Region</label>
                  <input type="text" className="input-field" placeholder="us-east-1" />
                </div>
                <button className="btn-primary">Save Configuration</button>
              </div>
            </motion.div>
          )}

          {activeSection === 'system' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-soft-white mb-4">System Information</h2>
              <div className="space-y-3">
                {[
                  { label: 'Application', value: 'AakSidhi Automation' },
                  { label: 'Version', value: '1.0.0' },
                  { label: 'Environment', value: 'Development' },
                  { label: 'Database', value: 'PostgreSQL 16' },
                  { label: 'Redis', value: 'Connected' },
                  { label: 'AI Provider', value: 'Ollama (Local)' },
                ].map((info) => (
                  <div key={info.label} className="flex items-center justify-between p-3 rounded-xl bg-white/2">
                    <span className="text-sm text-soft-gray">{info.label}</span>
                    <span className="text-sm text-soft-white">{info.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
