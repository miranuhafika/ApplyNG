import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signUpSchema } from '@/lib/schemas'
import { hashPassword } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/mail'
import { checkRateLimit, getRateLimitKey } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  if (!checkRateLimit(getRateLimitKey(ip, 'signup'), 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many signup attempts. Try again later.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const { name, email, password } = signUpSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    })

    sendWelcomeEmail(email, name).catch(console.error)

    return NextResponse.json({ message: 'Account created successfully!' }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 })
    }
    console.error('POST /api/auth/signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
