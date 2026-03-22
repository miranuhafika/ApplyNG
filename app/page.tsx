import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
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
    return await prisma.post.findMany({
      where: { status: 'PUBLISHED', OR: [{ featured: true }, { sponsored: true }] },
      include: { tags: true },
      orderBy: [{ sponsored: 'desc' }, { featured: 'desc' }, { createdAt: 'desc' }],
      take: 6,
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts()

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Next{' '}
            <span className="text-accent">Big Opportunity</span>
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-2xl mx-auto">
            Nigeria&apos;s leading platform for scholarships, jobs, fellowships, internships, and grants.
          </p>

          {/* Search Bar */}
          <form action="/jobs" method="get" className="flex gap-2 max-w-2xl mx-auto">
            <input
              type="text"
              name="search"
              placeholder="Search scholarships, jobs, fellowships..."
              className="flex-1 px-5 py-3 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="bg-accent hover:bg-accent-600 text-gray-900 font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Search
            </button>
          </form>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-10 text-green-100 text-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">5,000+</div>
              <div>Opportunities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50,000+</div>
              <div>Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">Daily</div>
              <div>Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AdBanner slot="homepage-top" />
      </div>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/${cat.value.toLowerCase()}`}
              className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all group"
            >
              <span className="text-4xl">{cat.emoji}</span>
              <span className="font-semibold text-gray-900 dark:text-white group-hover:text-primary">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Featured Opportunities
          </h2>
          <Link href="/jobs" className="text-primary hover:underline font-medium">
            View all →
          </Link>
        </div>

        {featuredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              No opportunities yet
            </h3>
            <p className="text-gray-500 mt-2">Check back soon or submit one!</p>
            <Link href="/submit" className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600">
              Submit Opportunity
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Have an opportunity to share?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Help thousands of Nigerians discover great opportunities. Submit scholarships, jobs, fellowships, and more.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/submit"
              className="bg-primary hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Submit Free Listing
            </Link>
            <Link
              href="/submit#featured"
              className="bg-accent hover:bg-accent-600 text-gray-900 font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              ⭐ Get Featured
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <NewsletterSignup />
      </section>
    </div>
  )
}
