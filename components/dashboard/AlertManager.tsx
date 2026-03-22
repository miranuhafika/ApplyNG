'use client'

import { useState } from 'react'
import type { Alert } from '@prisma/client'
import { CATEGORIES, ALERT_FREQUENCIES } from '@/lib/constants'

interface AlertManagerProps {
  alerts: Alert[]
}

export function AlertManager({ alerts: initialAlerts }: AlertManagerProps) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    location: '',
    keyword: '',
    frequency: 'DAILY',
  })
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category || undefined,
          location: formData.location || undefined,
          keyword: formData.keyword || undefined,
          frequency: formData.frequency,
        }),
      })
      if (res.ok) {
        const alert = await res.json()
        setAlerts([alert, ...alerts])
        setShowForm(false)
        setFormData({ category: '', location: '', keyword: '', frequency: 'DAILY' })
      }
    } catch (error) {
      console.error('Failed to create alert:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this alert?')) return
    try {
      const res = await fetch(`/api/alerts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAlerts(alerts.filter((a) => a.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete alert:', error)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Alerts ({alerts.length})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-600"
        >
          + New Alert
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-3">
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Location (optional)"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Keyword (optional)"
            value={formData.keyword}
            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {ALERT_FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-2 rounded-lg text-sm disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Create Alert'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {alerts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No alerts yet. Create one to get notified about new opportunities.
        </p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  {alert.category ? `${alert.category}` : 'All categories'}
                </p>
                {alert.keyword && <p className="text-gray-500 dark:text-gray-400">Keyword: {alert.keyword}</p>}
                {alert.location && <p className="text-gray-500 dark:text-gray-400">Location: {alert.location}</p>}
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{alert.frequency} updates</p>
              </div>
              <button
                onClick={() => handleDelete(alert.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
