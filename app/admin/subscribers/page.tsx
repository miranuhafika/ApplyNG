import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AdminSubscribersPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const activeCount = subscribers.filter((s) => s.isActive).length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscribers</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {activeCount} active / {subscribers.length} total
          </p>
        </div>
        <a
          href="/api/admin/subscribers/export"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 text-sm"
        >
          Export CSV
        </a>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="p-4 text-gray-500 font-medium">Email</th>
                <th className="p-4 text-gray-500 font-medium">Name</th>
                <th className="p-4 text-gray-500 font-medium">Status</th>
                <th className="p-4 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="p-4 text-gray-900 dark:text-white">{sub.email}</td>
                  <td className="p-4 text-gray-500 dark:text-gray-400">{sub.name || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      sub.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {sub.isActive ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">
                    {sub.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {subscribers.length === 0 && (
            <div className="p-8 text-center text-gray-500">No subscribers yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
