'use client'

import { useState } from 'react'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage('🎉 You\'re subscribed! Check your inbox for updates.')
        setEmail('')
        setName('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-white text-center">
      <h2 className="text-3xl font-bold mb-3">Never Miss an Opportunity</h2>
      <p className="text-green-100 mb-8 text-lg">
        Get the latest scholarships, jobs, and grants delivered to your inbox weekly.
      </p>
      {status === 'success' ? (
        <p className="text-xl font-medium">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-shrink-0 sm:w-40 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-accent hover:bg-accent-600 text-gray-900 font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-70"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="mt-3 text-red-200 text-sm">{message}</p>
      )}
    </div>
  )
}
