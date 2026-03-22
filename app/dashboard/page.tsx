import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PostCard } from '@/components/listings/PostCard'
import Link from 'next/link'
import { AlertManager } from '@/components/dashboard/AlertManager'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const [savedPosts, alerts] = await Promise.all([
    prisma.savedPost.findMany({
      where: { userId: session.user.id },
      include: { post: { include: { tags: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.alert.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const savedPostIds = savedPosts.map((s) => s.postId)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {session.user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your saved opportunities and alerts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Saved Opportunities ({savedPosts.length})
              </h2>
              <Link href="/jobs" className="text-primary text-sm hover:underline">
                Browse more →
              </Link>
            </div>

            {savedPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🔖</div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No saved opportunities yet</h3>
                <p className="text-gray-500 mt-2">Browse and save opportunities you&apos;re interested in.</p>
                <Link href="/jobs" className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600">
                  Browse Opportunities
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {savedPosts.map((saved) => (
                  <PostCard key={saved.id} post={saved.post} savedPostIds={savedPostIds} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <AlertManager alerts={alerts} />
          
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/dashboard/profile" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary py-1">
                👤 Edit Profile
              </Link>
              <Link href="/jobs" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary py-1">
                💼 Browse Jobs
              </Link>
              <Link href="/scholarships" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary py-1">
                🎓 Browse Scholarships
              </Link>
              <Link href="/submit" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary py-1">
                📝 Submit Opportunity
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
