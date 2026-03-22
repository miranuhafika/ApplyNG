import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { PostCard } from '@/components/listings/PostCard'
import Link from 'next/link'

interface TagPageProps {
  params: Promise<{ name: string }>
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { name } = await params
  return {
    title: `#${name} Opportunities`,
    description: `Browse opportunities tagged with #${name}`,
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { name } = await params
  const tag = await prisma.tag.findUnique({
    where: { name },
    include: {
      posts: {
        where: { status: 'PUBLISHED' },
        include: { tags: true },
        orderBy: { createdAt: 'desc' },
        take: 40,
      },
    },
  })

  if (!tag) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white font-medium">#{name}</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        #{name}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {tag.posts.length} {tag.posts.length === 1 ? 'opportunity' : 'opportunities'}
      </p>

      {tag.posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No opportunities with this tag</h3>
          <Link href="/jobs" className="inline-block mt-4 text-primary hover:underline">Browse all opportunities</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tag.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
