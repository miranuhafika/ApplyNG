import { Category } from '@prisma/client'

export const CATEGORIES = [
  { value: 'JOBS', label: 'Jobs', color: 'bg-blue-100 text-blue-800', emoji: '💼' },
  { value: 'SCHOLARSHIPS', label: 'Scholarships', color: 'bg-purple-100 text-purple-800', emoji: '🎓' },
  { value: 'FELLOWSHIPS', label: 'Fellowships', color: 'bg-green-100 text-green-800', emoji: '🌟' },
  { value: 'INTERNSHIPS', label: 'Internships', color: 'bg-orange-100 text-orange-800', emoji: '🏢' },
  { value: 'GRANTS', label: 'Grants', color: 'bg-red-100 text-red-800', emoji: '💰' },
] as const

export const CATEGORY_SLUGS: Record<string, Category> = {
  jobs: 'JOBS',
  scholarships: 'SCHOLARSHIPS',
  fellowships: 'FELLOWSHIPS',
  internships: 'INTERNSHIPS',
  grants: 'GRANTS',
}

export const FUNDING_TYPES = [
  { value: 'FULLY_FUNDED', label: 'Fully Funded' },
  { value: 'PARTIAL', label: 'Partial Funding' },
  { value: 'SELF_FUNDED', label: 'Self Funded' },
  { value: 'NOT_APPLICABLE', label: 'Not Applicable' },
] as const

export const ALERT_FREQUENCIES = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'NEVER', label: 'Never' },
] as const

export const POSTS_PER_PAGE = 20

export const SITE_NAME = 'ApplyNG'
export const SITE_DESCRIPTION = 'Nigeria\'s #1 platform for scholarships, jobs, fellowships, internships, and grants'
export const SITE_URL = process.env.NEXTAUTH_URL || 'https://applyng.com'

export const COLORS = {
  primaryGreen: '#006400',
  secondaryGreen: '#228B22',
  accentAmber: '#FFB84D',
  neutral: '#F5F5F5',
  dark: '#333333',
  darkBg: '#1A1A1A',
}

// Paystack pricing in kobo (NGN × 100)
export const PAYSTACK_PRICES = {
  SPONSORSHIP: 2500000,   // ₦25,000
  FEATURED: 1250000,      // ₦12,500
  NEWSLETTER: 10000000,   // ₦100,000
} as const

export const PAYSTACK_PRICES_NGN = {
  SPONSORSHIP: 25000,
  FEATURED: 12500,
  NEWSLETTER: 100000,
} as const

export const PAYSTACK_LABELS = {
  SPONSORSHIP: 'Sponsored Listing',
  FEATURED: 'Featured Listing',
  NEWSLETTER: 'Newsletter Sponsorship',
} as const
