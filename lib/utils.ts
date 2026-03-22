import { Category } from '@prisma/client'
import { CATEGORIES, SITE_NAME } from './constants'

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'No deadline'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getDeadlineStatus(deadline: Date | string | null | undefined): {
  label: string
  color: string
  daysLeft: number | null
} {
  if (!deadline) return { label: 'Ongoing', color: 'text-gray-500', daysLeft: null }
  const now = new Date()
  const d = typeof deadline === 'string' ? new Date(deadline) : deadline
  const daysLeft = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) return { label: 'Expired', color: 'text-red-600', daysLeft }
  if (daysLeft <= 7) return { label: `${daysLeft}d left`, color: 'text-red-600', daysLeft }
  if (daysLeft <= 14) return { label: `${daysLeft}d left`, color: 'text-yellow-600', daysLeft }
  return { label: `${daysLeft}d left`, color: 'text-green-600', daysLeft }
}

export function getCategoryInfo(category: Category) {
  return CATEGORIES.find((c) => c.value === category) || CATEGORIES[0]
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function generateMetaTitle(title: string): string {
  return `${title} | ${SITE_NAME}`
}

export function generateMetaDescription(description: string): string {
  return truncate(description.replace(/<[^>]+>/g, ''), 160)
}

export function buildShareUrl(platform: 'twitter' | 'facebook' | 'whatsapp' | 'linkedin', url: string, title: string): string {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    case 'whatsapp':
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  }
}

export function sanitizeHtml(html: string): string {
  // Server-side: basic sanitization (client-side uses isomorphic-dompurify)
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
}

export function generateRandomString(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function getRateLimitKey(ip: string, action: string): string {
  return `rate_limit:${action}:${ip}`
}

// Simple in-memory rate limiter (for production use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count++
  return true
}
