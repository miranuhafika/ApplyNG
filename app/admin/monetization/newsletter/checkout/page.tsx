'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PAYSTACK_PRICES_NGN } from '@/lib/constants'

// Generate the next 8 Mondays
function getUpcomingMondays(): Date[] {
  const mondays: Date[] = []
  const today = new Date()
  // Find next Monday
  const day = today.getDay()
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7
  const nextMonday = new Date(today)
  nextMonday.setDate(today.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0)

  for (let i = 0; i < 8; i++) {
    const d = new Date(nextMonday)
    d.setDate(nextMonday.getDate() + i * 7)
    mondays.push(d)
  }
  return mondays
}

export default function NewsletterCheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedWeek, setSelectedWeek] = useState<string>('')
  const [email, setEmail] = useState('')
  const [sponsorName, setSponsorName] = useState('')
  const [sponsorMessage, setSponsorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const weeks = getUpcomingMondays()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
    if (session?.user?.email) setEmail(session.user.email)
  }, [session, status, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedWeek || !email || !sponsorName) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/monetization/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NEWSLETTER',
          email,
          metadata: { sponsorName, sponsorMessage, weekOf: selectedWeek },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to initialize payment')

      window.location.href = data.authorization_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
      </div>
    )
  }

  const price = PAYSTACK_PRICES_NGN.NEWSLETTER

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/admin/monetization" className="text-sm text-green-700 hover:underline">
          ← Back to Monetization
        </Link>
        <h1 className="text-3xl font-bold mt-2">Newsletter Sponsorship</h1>
        <p className="text-gray-600 mt-1">
          Reach thousands of Nigerian students and professionals with your message in our weekly
          digest.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Week selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Sponsorship Week
          </label>
          <div className="grid grid-cols-2 gap-2">
            {weeks.map((d) => {
              const key = d.toISOString().split('T')[0]
              const label = d.toLocaleDateString('en-NG', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })
              const endDate = new Date(d)
              endDate.setDate(d.getDate() + 6)
              const endLabel = endDate.toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'short',
              })
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedWeek(key)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    selectedWeek === key
                      ? 'border-green-600 bg-green-50 text-green-800'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {label} – {endLabel}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Weekly digest</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sponsor details */}
        <div>
          <label htmlFor="sponsorName" className="block text-sm font-medium text-gray-700 mb-1">
            Sponsor / Company Name
          </label>
          <input
            id="sponsorName"
            type="text"
            value={sponsorName}
            onChange={(e) => setSponsorName(e.target.value)}
            required
            placeholder="e.g. Acme Corp"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="sponsorMsg" className="block text-sm font-medium text-gray-700 mb-1">
            Sponsor Message{' '}
            <span className="text-gray-400 font-normal">(max 160 characters)</span>
          </label>
          <textarea
            id="sponsorMsg"
            value={sponsorMessage}
            onChange={(e) => setSponsorMessage(e.target.value.slice(0, 160))}
            rows={3}
            placeholder="This week's digest is brought to you by…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{sponsorMessage.length}/160</p>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Receipt Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>

        {/* Order summary */}
        <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
          <h2 className="font-semibold text-gray-800 mb-3">Order Summary</h2>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Newsletter Sponsorship (1 week)</span>
            <span>₦{price.toLocaleString()}</span>
          </div>
          {selectedWeek && (
            <div className="text-sm text-gray-500 mb-3">
              Week:{' '}
              <span className="font-medium text-gray-700">
                {new Date(selectedWeek).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="text-green-700">₦{price.toLocaleString()}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedWeek || !sponsorName}
          className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {loading ? 'Redirecting to Paystack…' : `Pay ₦${price.toLocaleString()} with Paystack`}
        </button>

        <p className="text-center text-xs text-gray-500">
          Secure payment powered by Paystack. No card details stored on our servers.
        </p>
      </form>
    </div>
  )
}
