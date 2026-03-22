import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'PENDING'

  try {
    const submissions = await prisma.submission.findMany({
      where: { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(submissions)
  } catch (error) {
    console.error('GET /api/admin/submissions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
