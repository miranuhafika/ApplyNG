'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/constants'

interface PostFilterProps {
  category?: string
}

export function PostFilter({ category }: PostFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const location = searchParams.get('location') || ''
  const fundingType = searchParams.get('funding') || ''
  const sort = searchParams.get('sort') || 'newest'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Filter Opportunities</h3>

      {/* Category filter (only if not on a category page) */}
      {!category && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value=""
                checked={!searchParams.get('category')}
                onChange={() => updateFilter('category', '')}
                className="text-primary"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">All Categories</span>
            </label>
            {CATEGORIES.map((cat) => (
              <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={searchParams.get('category') === cat.value}
                  onChange={() => updateFilter('category', cat.value)}
                  className="text-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {cat.emoji} {cat.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Location filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
        <input
          type="text"
          placeholder="e.g., Lagos, Abuja"
          value={location}
          onChange={(e) => updateFilter('location', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Funding Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Funding Type</label>
        <select
          value={fundingType}
          onChange={(e) => updateFilter('funding', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Types</option>
          <option value="FULLY_FUNDED">Fully Funded</option>
          <option value="PARTIAL">Partial Funding</option>
          <option value="SELF_FUNDED">Self Funded</option>
        </select>
      </div>

      {/* Sort */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
        <select
          value={sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="newest">Newest First</option>
          <option value="deadline">Deadline (Soonest)</option>
          <option value="trending">Trending (Most Viewed)</option>
        </select>
      </div>

      {/* Remote Only */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={searchParams.get('remote') === 'true'}
          onChange={(e) => updateFilter('remote', e.target.checked ? 'true' : '')}
          className="rounded text-primary"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">🌐 Remote Only</span>
      </label>

      {/* Reset */}
      <button
        onClick={() => router.push(category ? `/${category}` : '/jobs')}
        className="w-full mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  )
}
