import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subscribeSchema } from '@/lib/schemas'
import { sendWelcomeEmail } from '@/lib/mail'
import { checkRateLimit, getRateLimitKey } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  if (!checkRateLimit(getRateLimitKey(ip, 'subscribe'), 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const { email, name } = subscribeSchema.parse(body)

    const existing = await prisma.subscriber.findUnique({ where: { email } })
    if (existing) {
      if (!existing.isActive) {
        await prisma.subscriber.update({ where: { email }, data: { isActive: true } })
        return NextResponse.json({ message: 'You have been resubscribed!' })
      }
      return NextResponse.json({ message: 'You are already subscribed!' })
    }

    await prisma.subscriber.create({
      data: { email, name, isActive: true },
    })

    // Send welcome email asynchronously
    if (name) {
      sendWelcomeEmail(email, name).catch(console.error)
    }

    return NextResponse.json({ message: 'Successfully subscribed!' }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    console.error('POST /api/subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
