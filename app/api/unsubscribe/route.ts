import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Invalid unsubscribe link' }, { status: 400 })
  }

  try {
    const subscriber = await prisma.subscriber.findUnique({ where: { unsubToken: token } })
    if (!subscriber) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    await prisma.subscriber.update({ where: { unsubToken: token }, data: { isActive: false } })
    return NextResponse.redirect(new URL('/?unsubscribed=true', request.url))
  } catch (error) {
    console.error('GET /api/unsubscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    await prisma.subscriber.updateMany({ where: { email }, data: { isActive: false } })
    return NextResponse.json({ message: 'Successfully unsubscribed' })
  } catch (error) {
    console.error('POST /api/unsubscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
