import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PostCard } from '@/components/listings/PostCard'
import { AdBanner } from '@/components/ads/AdBanner'
import { CATEGORY_SLUGS } from '@/lib/constants'
import { formatDate, buildShareUrl, generateMetaDescription } from '@/lib/utils'
import isomorphicDomPurify from 'isomorphic-dompurify'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface DetailPageProps {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { category: categoryParam, slug } = await params
  const category = CATEGORY_SLUGS[categoryParam]
  if (!category) return {}

  const post = await prisma.post.findUnique({
    where: { slug },
  })
  if (!post) return {}

  return {
    title: post.title,
    description: generateMetaDescription(post.description),
    openGraph: {
      title: post.title,
      description: generateMetaDescription(post.description),
      type: 'article',
    },
  }
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { category: categoryParam, slug } = await params
  const category = CATEGORY_SLUGS[categoryParam]
  if (!category) notFound()

  const session = await getServerSession(authOptions)

  const post = await prisma.post.findUnique({
    where: { slug, status: 'PUBLISHED' },
    include: { tags: true },
  })

  if (!post) notFound()

  // Increment views
  await prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  })

  // Get related posts
  const related = await prisma.post.findMany({
    where: {
      category: post.category,
      status: 'PUBLISHED',
      id: { not: post.id },
    },
    include: { tags: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })

  // Get user's saved post IDs if logged in
  let savedPostIds: string[] = []
  if (session?.user?.id) {
    const saved = await prisma.savedPost.findMany({
      where: { userId: session.user.id },
      select: { postId: true },
    })
    savedPostIds = saved.map((s: { postId: string }) => s.postId)
  }

  const sanitizedDescription = isomorphicDomPurify.sanitize(post.description)
  const sanitizedEligibility = post.eligibility ? isomorphicDomPurify.sanitize(post.eligibility) : null

  const postUrl = `${process.env.NEXTAUTH_URL || 'https://applyng.com'}/${categoryParam}/${slug}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${categoryParam}`} className="hover:text-primary capitalize">{categoryParam}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white truncate">{post.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                {categoryParam}
              </span>
              {post.fundingType === 'FULLY_FUNDED' && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  💰 Fully Funded
                </span>
              )}
              {post.isRemote && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  🌐 Remote
                </span>
              )}
              {post.sponsored && (
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  ⭐ Featured
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <span className="font-medium text-gray-700 dark:text-gray-300 text-base">{post.organization}</span>
              {post.location && (
                <span className="flex items-center gap-1">📍 {post.location}</span>
              )}
              <span className="flex items-center gap-1">
                📅 Deadline: <strong className="text-gray-700 dark:text-gray-300">{formatDate(post.deadline)}</strong>
              </span>
              <span className="flex items-center gap-1">
                👁 {post.views.toLocaleString()} views
              </span>
            </div>

            {/* Description */}
            <div
              className="prose-content text-gray-700 dark:text-gray-300 mb-8"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />

            {/* Eligibility */}
            {sanitizedEligibility && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Eligibility</h2>
                <div
                  className="prose-content text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: sanitizedEligibility }}
                />
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.name}`}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Apply Button */}
            <a
              href={post.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Apply Now →
            </a>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Related Opportunities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {related.map((relPost) => (
                  <PostCard key={relPost.id} post={relPost} savedPostIds={savedPostIds} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Share */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Share This Opportunity</h3>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={buildShareUrl('whatsapp', postUrl, post.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
              >
                WhatsApp
              </a>
              <a
                href={buildShareUrl('twitter', postUrl, post.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 text-sm font-medium"
              >
                Twitter/X
              </a>
              <a
                href={buildShareUrl('facebook', postUrl, post.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Facebook
              </a>
              <a
                href={buildShareUrl('linkedin', postUrl, post.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 text-sm font-medium"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Ad */}
          <AdBanner slot="detail-sidebar" />

          {/* Quick Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Info</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Organization</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{post.organization}</dd>
              </div>
              {post.location && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Location</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{post.location}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Deadline</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{formatDate(post.deadline)}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                <dd className="text-gray-900 dark:text-white font-medium capitalize">{post.category.toLowerCase()}</dd>
              </div>
              {post.fundingType !== 'NOT_APPLICABLE' && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Funding</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">
                    {post.fundingType.replace('_', ' ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
