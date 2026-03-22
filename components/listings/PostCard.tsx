'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { getCategoryInfo, getDeadlineStatus, formatDate } from '@/lib/utils'
import type { Post, Tag } from '@prisma/client'

interface PostCardProps {
  post: Post & { tags: Tag[]; _count?: { savedBy: number } }
  savedPostIds?: string[]
  onSaveToggle?: (postId: string, saved: boolean) => void
}

export function PostCard({ post, savedPostIds = [], onSaveToggle }: PostCardProps) {
  const { data: session } = useSession()
  const [isSaved, setIsSaved] = useState(savedPostIds.includes(post.id))
  const [saving, setSaving] = useState(false)

  const categoryInfo = getCategoryInfo(post.category)
  const deadline = getDeadlineStatus(post.deadline)
  const categorySlug = post.category.toLowerCase()

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!session) {
      window.location.href = '/auth/signin'
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/saved', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      })
      if (res.ok) {
        setIsSaved(!isSaved)
        onSaveToggle?.(post.id, !isSaved)
      }
    } catch (error) {
      console.error('Failed to save post:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Link href={`/${categorySlug}/${post.slug}`} className="block group">
      <div className="card card-hover p-5 h-full flex flex-col">
        {/* Top badges row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <span className={`badge ${categoryInfo.color} text-xs`}>
              {categoryInfo.emoji} {categoryInfo.label}
            </span>
            {post.fundingType === 'FULLY_FUNDED' && (
              <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Fully Funded
              </span>
            )}
            {post.isRemote && (
              <span className="badge bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                Remote
              </span>
            )}
            {post.sponsored && (
              <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                ⭐ Featured
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
              isSaved
                ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-300 dark:text-gray-600 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            }`}
            title={isSaved ? 'Unsave' : 'Save'}
          >
            <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2 leading-snug text-[0.9375rem] mb-2 transition-colors">
          {post.title}
        </h3>

        {/* Organization & Location */}
        <div className="flex items-center gap-2 text-sm mb-3">
          <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{post.organization}</span>
          {post.location && (
            <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500 flex-shrink-0">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {post.location}
            </span>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.name}`}
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-0.5 text-xs bg-surface-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Footer — pushed to bottom */}
        <div className="mt-auto pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span className={`flex items-center gap-1 font-medium ${deadline.color}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {post.deadline ? formatDate(post.deadline) : 'Ongoing'}
            {deadline.daysLeft !== null && deadline.daysLeft >= 0 && (
              <span className="ml-0.5 opacity-75">({deadline.label})</span>
            )}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.views.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
