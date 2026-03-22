import { MetadataRoute } from 'next'
import { SITE_URL, CATEGORIES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let postUrls: MetadataRoute.Sitemap = []
  
  try {
    const { prisma } = await import('@/lib/prisma')
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, category: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    })

    postUrls = posts.map((post) => ({
      url: `${SITE_URL}/${post.category.toLowerCase()}/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // Database not available during build
  }

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${SITE_URL}/${cat.value.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/submit`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  return [...staticUrls, ...categoryUrls, ...postUrls]
}
