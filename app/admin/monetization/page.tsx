import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PAYSTACK_PRICES_NGN } from '@/lib/constants'
import Link from 'next/link'

async function getMonetizationStats() {
  const [payments, revenueByType] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.payment.groupBy({
      by: ['type'],
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ])

  const totalRevenueKobo = revenueByType.reduce(
    (sum, r) => sum + (r._sum.amount ?? 0),
    0,
  )

  return { payments, revenueByType, totalRevenueKobo }
}

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
  REFUNDED: 'bg-blue-100 text-blue-800',
}

const TYPE_LABELS: Record<string, string> = {
  SPONSORSHIP: 'Sponsored Listing',
  FEATURED: 'Featured Listing',
  NEWSLETTER: 'Newsletter',
}

export default async function MonetizationPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  const { payments, revenueByType, totalRevenueKobo } = await getMonetizationStats()
  const totalRevenueNGN = totalRevenueKobo / 100

  const failedCount = payments.filter((p) => p.status === 'FAILED').length

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Monetization Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your Paystack revenue and manage listings</p>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue (NGN)</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            ₦{totalRevenueNGN.toLocaleString()}
          </p>
        </div>

        {(['SPONSORSHIP', 'FEATURED', 'NEWSLETTER'] as const).map((type) => {
          const row = revenueByType.find((r) => r.type === type)
          const ngn = ((row?._sum.amount ?? 0) / 100).toLocaleString()
          return (
            <div key={type} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">{TYPE_LABELS[type]}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">₦{ngn}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {row?._count.id ?? 0} transactions
              </p>
            </div>
          )
        })}
      </div>

      {/* Alert for failed payments */}
      {failedCount > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <span className="text-red-500 text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-800">
              {failedCount} failed payment{failedCount > 1 ? 's' : ''} in recent history
            </p>
            <p className="text-sm text-red-600">Review the transaction table below.</p>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/monetization/sponsorships/checkout"
          className="flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-green-400 hover:shadow-sm transition-all"
        >
          <span className="text-3xl">⭐</span>
          <div>
            <p className="font-semibold">Sponsor a Post</p>
            <p className="text-sm text-gray-500">
              ₦{PAYSTACK_PRICES_NGN.SPONSORSHIP.toLocaleString()} / 30 days
            </p>
          </div>
        </Link>

        <Link
          href="/admin/monetization/featured/checkout"
          className="flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <span className="text-3xl">✨</span>
          <div>
            <p className="font-semibold">Feature a Listing</p>
            <p className="text-sm text-gray-500">
              ₦{PAYSTACK_PRICES_NGN.FEATURED.toLocaleString()} / 30 days
            </p>
          </div>
        </Link>

        <Link
          href="/admin/monetization/newsletter/checkout"
          className="flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-sm transition-all"
        >
          <span className="text-3xl">📧</span>
          <div>
            <p className="font-semibold">Newsletter Sponsorship</p>
            <p className="text-sm text-gray-500">
              ₦{PAYSTACK_PRICES_NGN.NEWSLETTER.toLocaleString()} / week
            </p>
          </div>
        </Link>
      </div>

      {/* Recent transactions */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Recent Transactions</h2>
          <Link
            href="/api/monetization/paystack/transactions"
            className="text-sm text-green-700 hover:underline"
          >
            View all →
          </Link>
        </div>

        {payments.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            No transactions yet. Create your first listing above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Reference</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Type</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Amount</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{p.reference}</td>
                    <td className="px-6 py-4">{TYPE_LABELS[p.type] ?? p.type}</td>
                    <td className="px-6 py-4 font-medium">
                      ₦{(p.amount / 100).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString('en-NG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
