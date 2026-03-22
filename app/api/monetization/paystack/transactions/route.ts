import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const status = searchParams.get('status') ?? undefined
    const type = searchParams.get('type') ?? undefined

    const where = {
      ...(status ? { status: status as 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED' } : {}),
      ...(type ? { type: type as 'SPONSORSHIP' | 'FEATURED' | 'NEWSLETTER' } : {}),
    }

    const [transactions, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ])

    // Aggregate revenue totals
    const revenue = await prisma.payment.groupBy({
      by: ['type'],
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    })

    return NextResponse.json({
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      revenue,
    })
  } catch (error) {
    console.error('[paystack/transactions]', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
