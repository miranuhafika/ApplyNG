'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PAYSTACK_PRICES_NGN } from '@/lib/constants'

interface Post {
  id: string
  title: string
  organization: string
  category: string
  sponsored: boolean
}

export default function SponsorshipCheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string>('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
    if (session?.user?.email) setEmail(session.user.email)
  }, [session, status, router])

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts?status=PUBLISHED&limit=100')
        const data = await res.json()
        setPosts(data.posts ?? [])
      } catch {
        setError('Failed to load posts')
      } finally {
        setFetching(false)
      }
    }
    fetchPosts()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPostId || !email) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/monetization/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SPONSORSHIP', email, postId: selectedPostId }),
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

  if (status === 'loading' || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
      </div>
    )
  }

  const selectedPost = posts.find((p) => p.id === selectedPostId)
  const price = PAYSTACK_PRICES_NGN.SPONSORSHIP

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <Link href="/admin/monetization" className="text-sm text-green-700 hover:underline">
          ← Back to Monetization
        </Link>
        <h1 className="text-3xl font-bold mt-2">Sponsor a Post</h1>
        <p className="text-gray-600 mt-1">
          Give your listing premium placement and a{' '}
          <span className="font-semibold text-yellow-700">⭐ Sponsored</span> badge.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post selector */}
        <div>
          <label htmlFor="post" className="block text-sm font-medium text-gray-700 mb-1">
            Select Post to Sponsor
          </label>
          <select
            id="post"
            value={selectedPostId}
            onChange={(e) => setSelectedPostId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
          >
            <option value="">— Choose a post —</option>
            {posts.map((p) => (
              <option key={p.id} value={p.id} disabled={p.sponsored}>
                {p.title} — {p.organization}
                {p.sponsored ? ' (already sponsored)' : ''}
              </option>
            ))}
          </select>
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
            <span>Sponsored Listing (30 days)</span>
            <span>₦{price.toLocaleString()}</span>
          </div>
          {selectedPost && (
            <div className="text-sm text-gray-500 mb-3">
              Post:{' '}
              <span className="font-medium text-gray-700">
                {selectedPost.title}
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
          disabled={loading || !selectedPostId}
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
