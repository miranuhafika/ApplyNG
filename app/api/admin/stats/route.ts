import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const [totalPosts, totalViews, totalUsers, pendingSubmissions, totalSubscribers] = await Promise.all([
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.user.count(),
      prisma.submission.count({ where: { status: 'PENDING' } }),
      prisma.subscriber.count({ where: { isActive: true } }),
    ])

    const recentPosts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { tags: true },
    })

    return NextResponse.json({
      totalPosts,
      totalViews: totalViews._sum.views || 0,
      totalUsers,
      pendingSubmissions,
      totalSubscribers,
      estimatedRevenue: (totalViews._sum.views || 0) * 0.001, // $1 per 1000 views estimate
      recentPosts,
    })
  } catch (error) {
    console.error('GET /api/admin/stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
