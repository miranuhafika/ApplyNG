import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const result = await prisma.post.updateMany({
      where: { deadline: { lt: now }, status: 'PUBLISHED' },
      data: { status: 'EXPIRED' },
    })

    return NextResponse.json({ expired: result.count, timestamp: now })
  } catch (error) {
    console.error('POST /api/cron/expire error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
