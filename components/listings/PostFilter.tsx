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
    <div className="card p-5 space-y-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Filters</h3>

      {/* Category filter (only if not on a category page) */}
      {!category && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Category</p>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value=""
                checked={!searchParams.get('category')}
                onChange={() => updateFilter('category', '')}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">All Categories</span>
            </label>
            {CATEGORIES.map((cat) => (
              <label key={cat.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={searchParams.get('category') === cat.value}
                  onChange={() => updateFilter('category', cat.value)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {cat.emoji} {cat.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Location filter */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Location</label>
        <input
          type="text"
          placeholder="e.g., Lagos, Abuja"
          value={location}
          onChange={(e) => updateFilter('location', e.target.value)}
          className="input"
        />
      </div>

      {/* Funding Type */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Funding Type</label>
        <select
          value={fundingType}
          onChange={(e) => updateFilter('funding', e.target.value)}
          className="input"
        >
          <option value="">All Types</option>
          <option value="FULLY_FUNDED">Fully Funded</option>
          <option value="PARTIAL">Partial Funding</option>
          <option value="SELF_FUNDED">Self Funded</option>
        </select>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Sort By</label>
        <select
          value={sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="input"
        >
          <option value="newest">Newest First</option>
          <option value="deadline">Deadline (Soonest)</option>
          <option value="trending">Trending (Most Viewed)</option>
        </select>
      </div>

      {/* Remote Only */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={searchParams.get('remote') === 'true'}
          onChange={(e) => updateFilter('remote', e.target.checked ? 'true' : '')}
          className="rounded text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">🌐 Remote Only</span>
      </label>

      {/* Reset */}
      <button
        onClick={() => router.push(category ? `/${category}` : '/jobs')}
        className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-xl py-2 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
      >
        Reset Filters
      </button>
    </div>
  )
}
