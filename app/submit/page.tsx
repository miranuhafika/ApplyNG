'use client'

import { useState } from 'react'
import { CATEGORIES, FUNDING_TYPES } from '@/lib/constants'

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    category: 'JOBS',
    location: '',
    isRemote: false,
    fundingType: 'NOT_APPLICABLE',
    description: '',
    eligibility: '',
    applyUrl: '',
    deadline: '',
    contactEmail: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, deadline: formData.deadline || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message)
      } else {
        setStatus('error')
        setMessage(data.error || 'Submission failed. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Submission Received!</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Submit an Opportunity</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Share scholarships, jobs, fellowships, internships, or grants with thousands of Nigerians.
        </p>
      </div>

      {/* Featured CTA */}
      <div id="featured" className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">⭐ Get Featured</h2>
        <p className="text-amber-700 dark:text-amber-400 text-sm mb-3">
          Featured listings appear at the top of all category pages and get 5x more visibility. 
          Contact us at <a href="mailto:contact@applyng.com" className="underline">contact@applyng.com</a> to sponsor your listing.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opportunity Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., 2024 Chevening Scholarship"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization *</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., UK Government"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Lagos, Nigeria"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Funding Type</label>
              <select
                value={formData.fundingType}
                onChange={(e) => setFormData({ ...formData, fundingType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {FUNDING_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application URL *</label>
              <input
                type="url"
                value={formData.applyUrl}
                onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isRemote}
              onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
              className="rounded text-primary"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">🌐 This is a remote opportunity</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Provide a detailed description of the opportunity..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eligibility Requirements</label>
            <textarea
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Who is eligible to apply?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Email *</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@organization.com"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-4 px-8 rounded-xl transition-colors disabled:opacity-70 text-lg"
          >
            {status === 'loading' ? 'Submitting...' : 'Submit Opportunity (Free)'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Your submission will be reviewed by our team within 24-48 hours.
          </p>
        </form>
      </div>
    </div>
  )
}
