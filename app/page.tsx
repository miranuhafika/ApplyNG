import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma, withRetry } from '@/lib/prisma'
import { PostCard } from '@/components/listings/PostCard'
import { SITE_NAME, SITE_DESCRIPTION, CATEGORIES } from '@/lib/constants'
import { AdBanner } from '@/components/ads/AdBanner'
import { NewsletterSignup } from '@/components/NewsletterSignup'

export const metadata: Metadata = {
  title: `${SITE_NAME} - Nigeria's #1 Opportunity Platform`,
  description: SITE_DESCRIPTION,
}

async function getFeaturedPosts() {
  try {
    return await withRetry(() =>
      prisma.post.findMany({
        where: { status: 'PUBLISHED', OR: [{ featured: true }, { sponsored: true }] },
        include: { tags: true },
        orderBy: [{ sponsored: 'desc' }, { featured: 'desc' }, { createdAt: 'desc' }],
        take: 6,
      })
    )
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts()

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-950 pt-16 pb-20 px-4">
        {/* Subtle background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-50 dark:bg-primary-900/10 blur-3xl opacity-60" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-50 dark:bg-blue-900/10 blur-3xl opacity-40" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 border border-primary-100 dark:border-primary-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
            </span>
            Updated daily with new opportunities
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white tracking-tight mb-6 text-balance">
            Your next big
            <br />
            <span className="text-primary-600">opportunity</span> awaits
          </h1>

          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Nigeria&apos;s leading platform for scholarships, jobs, fellowships, internships, and grants — curated for students and professionals.
          </p>

          {/* Search Bar */}
          <form action="/jobs" method="get" className="flex gap-2 max-w-xl mx-auto mb-10">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="search"
                placeholder="Search scholarships, jobs, grants..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-[0.9375rem] shadow-sm transition-all"
              />
            </div>
            <button
              type="submit"
              className="btn-primary px-6 py-3.5 text-[0.9375rem] rounded-2xl"
            >
              Search
            </button>
          </form>

          {/* Stats */}
          <div className="flex justify-center gap-10 text-sm">
            {[
              { value: '5,000+', label: 'Opportunities' },
              { value: '50,000+', label: 'Users' },
              { value: 'Daily', label: 'Updates' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ad Banner ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdBanner slot="homepage-top" />
      </div>

      {/* ── Categories ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h2 className="section-heading">Browse by Category</h2>
          <p className="section-subheading">Explore opportunities across all fields</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/${cat.value.toLowerCase()}`}
              className="group card card-hover flex flex-col items-center gap-3 p-6 text-center"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.emoji}</span>
              <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Opportunities ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-heading">Featured Opportunities</h2>
            <p className="section-subheading">Handpicked listings for you</p>
          </div>
          <Link
            href="/jobs"
            className="btn-ghost text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {featuredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-20 px-6">
            <div className="text-5xl mb-5">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              No opportunities yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to share something amazing!</p>
            <Link href="/submit" className="btn-primary inline-flex mx-auto">
              Submit Opportunity
            </Link>
          </div>
        )}
      </section>

      {/* ── CTA Section ────────────────────────────────────── */}
      <section className="bg-surface-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            Have an opportunity to share?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg leading-relaxed">
            Help thousands of Nigerians discover great opportunities. Submit scholarships, jobs, fellowships, and more — for free.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/submit" className="btn-primary text-base px-7 py-3">
              Submit Free Listing
            </Link>
            <Link href="/submit#featured" className="btn-secondary text-base px-7 py-3">
              ⭐ Get Featured
            </Link>
          </div>
        </div>
      </section>

      {/* ── Newsletter ─────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <NewsletterSignup />
      </section>
    </div>
  )
}
