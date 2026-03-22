import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { initializeTransaction } from '@/lib/paystack'
import { PAYSTACK_PRICES } from '@/lib/constants'
import { z } from 'zod'

const schema = z.object({
  type: z.enum(['SPONSORSHIP', 'FEATURED', 'NEWSLETTER']),
  email: z.string().email(),
  postId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { type, email, postId } = parsed.data

    // Idempotency key: combine email + type + postId + date
    const idempotencyKey = [email, type, postId ?? '', new Date().toDateString()].join(':')

    const paystackData = await initializeTransaction({
      email,
      type,
      postId,
      idempotencyKey,
      metadata: { initiatedBy: session.user?.email ?? '' },
    })

    // Persist a PENDING payment record
    await prisma.payment.create({
      data: {
        reference: paystackData.reference,
        amount: PAYSTACK_PRICES[type],
        type,
        email,
        postId: postId ?? null,
        status: 'PENDING',
        metadata: { idempotencyKey, accessCode: paystackData.access_code },
      },
    })

    return NextResponse.json({
      authorization_url: paystackData.authorization_url,
      reference: paystackData.reference,
    })
  } catch (error) {
    console.error('[paystack/initialize]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initialize payment' },
      { status: 500 },
    )
  }
}
