import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const [totalPosts, totalViewsData, totalUsers, pendingSubmissions, totalSubscribers] = await Promise.all([
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.post.aggregate({ _sum: { views: true } }),
    prisma.user.count(),
    prisma.submission.count({ where: { status: 'PENDING' } }),
    prisma.subscriber.count({ where: { isActive: true } }),
  ])

  const totalViews = totalViewsData._sum.views || 0
  const estimatedRevenue = (totalViews * 0.001).toFixed(2)

  const recentPosts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { tags: true },
  })

  const stats = [
    { label: 'Published Posts', value: totalPosts.toLocaleString(), icon: '📝', color: 'bg-blue-500' },
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: '👁', color: 'bg-green-500' },
    { label: 'Total Users', value: totalUsers.toLocaleString(), icon: '👥', color: 'bg-purple-500' },
    { label: 'Est. Revenue', value: `$${estimatedRevenue}`, icon: '💰', color: 'bg-amber-500' },
    { label: 'Pending Submissions', value: pendingSubmissions.toLocaleString(), icon: '📬', color: 'bg-orange-500' },
    { label: 'Newsletter Subscribers', value: totalSubscribers.toLocaleString(), icon: '📧', color: 'bg-red-500' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {session.user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here&apos;s what&apos;s happening with ApplyNG today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Posts</h2>
          <Link href="/admin/posts" className="text-primary text-sm hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-gray-500 dark:text-gray-400 font-medium">Title</th>
                <th className="pb-3 text-gray-500 dark:text-gray-400 font-medium">Category</th>
                <th className="pb-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                <th className="pb-3 text-gray-500 dark:text-gray-400 font-medium">Views</th>
                <th className="pb-3 text-gray-500 dark:text-gray-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentPosts.map((post) => (
                <tr key={post.id}>
                  <td className="py-3 text-gray-900 dark:text-white font-medium truncate max-w-xs">
                    {post.title}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400 text-xs">
                      {post.category}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                      post.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500 dark:text-gray-400">{post.views.toLocaleString()}</td>
                  <td className="py-3 text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentPosts.length === 0 && (
            <p className="text-center py-8 text-gray-500">No posts yet. <Link href="/admin/posts" className="text-primary hover:underline">Create one →</Link></p>
          )}
        </div>
      </div>
    </div>
  )
}
