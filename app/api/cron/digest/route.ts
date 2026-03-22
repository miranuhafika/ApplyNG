import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewsletterDigest } from '@/lib/mail'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [subscribers, recentPosts] = await Promise.all([
      prisma.subscriber.findMany({ where: { isActive: true } }),
      prisma.post.findMany({
        where: { status: 'PUBLISHED', createdAt: { gte: oneWeekAgo } },
        orderBy: { views: 'desc' },
        take: 10,
      }),
    ])

    if (recentPosts.length === 0) {
      return NextResponse.json({ message: 'No new posts to send', sent: 0 })
    }

    const postsForEmail = recentPosts.map((p) => ({
      title: p.title,
      organization: p.organization,
      category: p.category,
      slug: p.slug,
      category_slug: p.category.toLowerCase(),
    }))

    await sendNewsletterDigest(subscribers, postsForEmail)

    return NextResponse.json({ sent: subscribers.length, postsIncluded: recentPosts.length })
  } catch (error) {
    console.error('POST /api/cron/digest error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
