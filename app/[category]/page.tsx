import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { prisma, withRetry } from '@/lib/prisma'
import { PostCard } from '@/components/listings/PostCard'
import { PostFilter } from '@/components/listings/PostFilter'
import { AdBanner } from '@/components/ads/AdBanner'
import { CATEGORY_SLUGS, POSTS_PER_PAGE } from '@/lib/constants'
import type { Prisma } from '@prisma/client'

interface CategoryPageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{
    search?: string
    location?: string
    funding?: string
    remote?: string
    sort?: string
    page?: string
    tag?: string
  }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categoryParam } = await params
  const category = CATEGORY_SLUGS[categoryParam]
  if (!category) return {}
  const label = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)
  return {
    title: `${label} in Nigeria`,
    description: `Browse the latest ${label.toLowerCase()} opportunities in Nigeria and beyond.`,
  }
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_SLUGS).map((cat) => ({ category: cat }))
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: categoryParam } = await params
  const sp = await searchParams
  const category = CATEGORY_SLUGS[categoryParam]
  if (!category) notFound()

  const page = parseInt(sp.page || '1', 10)
  const skip = (page - 1) * POSTS_PER_PAGE

  const where: Prisma.PostWhereInput = {
    category,
    status: 'PUBLISHED',
    ...(sp.search && {
      OR: [
        { title: { contains: sp.search, mode: 'insensitive' } },
        { organization: { contains: sp.search, mode: 'insensitive' } },
        { description: { contains: sp.search, mode: 'insensitive' } },
      ],
    }),
    ...(sp.location && { location: { contains: sp.location, mode: 'insensitive' } }),
    ...(sp.funding && { fundingType: sp.funding as Prisma.EnumFundingTypeFilter }),
    ...(sp.remote === 'true' && { isRemote: true }),
  }

  const orderBy: Prisma.PostOrderByWithRelationInput =
    sp.sort === 'deadline'
      ? { deadline: 'asc' }
      : sp.sort === 'trending'
      ? { views: 'desc' }
      : { createdAt: 'desc' }

  const [posts, total] = await withRetry(() =>
    Promise.all([
      prisma.post.findMany({
        where,
        include: { tags: true },
        orderBy: [{ sponsored: 'desc' }, { featured: 'desc' }, orderBy],
        skip,
        take: POSTS_PER_PAGE,
      }),
      prisma.post.count({ where }),
    ])
  )

  const totalPages = Math.ceil(total / POSTS_PER_PAGE)
  const label = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
        <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 dark:text-white font-medium">{label}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filter */}
        <aside className="lg:w-60 flex-shrink-0">
          <PostFilter category={categoryParam} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="section-heading">{label}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {total.toLocaleString()} {total === 1 ? 'opportunity' : 'opportunities'} found
              </p>
            </div>

            {/* Search bar */}
            <form action={`/${categoryParam}`} method="get" className="flex gap-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  name="search"
                  placeholder="Search..."
                  defaultValue={sp.search}
                  className="pl-9 pr-4 py-2 text-sm bg-surface-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all w-48"
                />
              </div>
              <button type="submit" className="btn-primary text-sm">
                Search
              </button>
            </form>
          </div>

          {posts.length === 0 ? (
            <div className="card text-center py-20 px-6">
              <div className="text-5xl mb-5">🔍</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">No results found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Try different filters or search terms</p>
              <Link href={`/${categoryParam}`} className="btn-secondary inline-flex mx-auto">
                Clear filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map((post, index) => (
                  <React.Fragment key={post.id}>
                    <PostCard post={post} />
                    {/* Ad every 5 cards */}
                    {(index + 1) % 5 === 0 && index < posts.length - 1 && (
                      <div className="md:col-span-2">
                        <AdBanner slot="listing-inline" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-1.5 mt-10 flex-wrap">
                  {page > 1 && (
                    <Link
                      href={`?page=${page - 1}`}
                      className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-surface-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all"
                    >
                      ← Prev
                    </Link>
                  )}
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`?page=${p}`}
                      className={`px-4 py-2 text-sm border rounded-xl transition-all ${
                        p === page
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                  {page < totalPages && (
                    <Link
                      href={`?page=${page + 1}`}
                      className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-surface-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
