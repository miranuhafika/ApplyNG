'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Setting, SettingCategory } from '@/types/settings'

const CATEGORIES_META: { key: SettingCategory; label: string; description: string; icon: string }[] = [
  { key: 'oauth', label: 'OAuth & Authentication', description: 'Google OAuth credentials and NextAuth secret', icon: '🔐' },
  { key: 'payment', label: 'Payment Gateway', description: 'Paystack API keys and webhook secrets', icon: '💳' },
  { key: 'email', label: 'Email Service', description: 'Resend API configuration', icon: '📧' },
  { key: 'site', label: 'Site Configuration', description: 'General site settings', icon: '🌐' },
  { key: 'pricing', label: 'Pricing', description: 'Post pricing configuration', icon: '💰' },
  { key: 'features', label: 'Features', description: 'Enable or disable features', icon: '⚙️' },
  { key: 'contact', label: 'Contact Information', description: 'Contact details', icon: '📞' },
]

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  )
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmKey, setConfirmKey] = useState<string | null>(null)
  const [pendingSave, setPendingSave] = useState<Record<string, string> | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type })

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error('Failed to load settings')
      const data = await res.json()
      setSettings(data.settings)
      const vals: Record<string, string> = {}
      for (const s of data.settings) vals[s.key] = s.value
      setEditValues(vals)
    } catch {
      showToast('Failed to load settings', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  const handleChange = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }))
  }

  const hasSensitiveChanges = (updates: Record<string, string>) => {
    return Object.entries(updates).some(([key]) => {
      const s = settings.find((s) => s.key === key)
      return s?.isSecret
    })
  }

  const doSave = async (updates: Record<string, string>) => {
    setSaving(true)
    try {
      const payload = Object.entries(updates).map(([key, value]) => ({ key, value }))
      const res = await fetch('/api/admin/settings/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to save')
      }
      showToast('Settings saved successfully!', 'success')
      await loadSettings()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save settings', 'error')
    } finally {
      setSaving(false)
      setPendingSave(null)
      setConfirmKey(null)
    }
  }

  const handleSaveAll = () => {
    const changed: Record<string, string> = {}
    for (const s of settings) {
      if (editValues[s.key] !== s.value) changed[s.key] = editValues[s.key]
    }
    if (Object.keys(changed).length === 0) {
      showToast('No changes to save', 'error')
      return
    }
    if (hasSensitiveChanges(changed)) {
      setPendingSave(changed)
      setConfirmKey('bulk')
    } else {
      doSave(changed)
    }
  }

  const handleSaveSingle = (key: string) => {
    const setting = settings.find((s) => s.key === key)
    if (!setting) return
    if (setting.isSecret) {
      setPendingSave({ [key]: editValues[key] })
      setConfirmKey(key)
    } else {
      doSave({ [key]: editValues[key] })
    }
  }

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value).then(() => showToast('Copied to clipboard!', 'success'))
  }

  const toggleVisible = (key: string) => {
    setVisibleSecrets((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const settingsByCategory = (cat: SettingCategory) =>
    settings.filter((s) => s.category === cat)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <div className="text-gray-500 dark:text-gray-400">Loading settings…</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Confirm dialog */}
      {confirmKey && pendingSave && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm Changes</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              You are about to update <strong>{Object.keys(pendingSave).length}</strong> setting(s), including sensitive secret keys. Are you sure?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setConfirmKey(null); setPendingSave(null) }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => doSave(pendingSave)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage application configuration from the database.</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
              Saving…
            </>
          ) : (
            <>💾 Save All Changes</>
          )}
        </button>
      </div>

      <div className="space-y-8">
        {CATEGORIES_META.map((cat) => {
          const catSettings = settingsByCategory(cat.key)
          if (catSettings.length === 0) return null
          return (
            <div key={cat.key} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">{cat.label}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{cat.description}</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {catSettings.map((s) => {
                  const isVisible = visibleSecrets[s.key]
                  const isDirty = editValues[s.key] !== s.value
                  return (
                    <div key={s.key} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="sm:w-48 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300">{s.key}</span>
                          {s.isSecret && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded font-medium">SECRET</span>
                          )}
                          {isDirty && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded font-medium">EDITED</span>
                          )}
                        </div>
                        {s.description && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.description}</p>
                        )}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type={s.isSecret && !isVisible ? 'password' : 'text'}
                            value={editValues[s.key] ?? ''}
                            onChange={(e) => handleChange(s.key, e.target.value)}
                            placeholder={s.isSecret ? '••••••••' : `Enter ${s.key}`}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                          />
                        </div>
                        {s.isSecret && (
                          <button
                            onClick={() => toggleVisible(s.key)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            title={isVisible ? 'Hide' : 'Show'}
                          >
                            {isVisible ? '🙈' : '👁'}
                          </button>
                        )}
                        <button
                          onClick={() => copyToClipboard(editValues[s.key] ?? '')}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          title="Copy current value"
                          disabled={!editValues[s.key]}
                        >
                          📋
                        </button>
                        {isDirty && (
                          <button
                            onClick={() => handleSaveSingle(s.key)}
                            className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                          >
                            Save
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {settings.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No settings found. They will be seeded automatically on first load.
          </div>
        )}
      </div>
    </div>
  )
}
