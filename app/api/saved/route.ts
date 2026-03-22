import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const savedSchema = z.object({ postId: z.string() })

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const saved = await prisma.savedPost.findMany({
      where: { userId: session.user.id },
      include: { post: { include: { tags: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(saved)
  } catch (error) {
    console.error('GET /api/saved error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { postId } = savedSchema.parse(body)

    const saved = await prisma.savedPost.upsert({
      where: { userId_postId: { userId: session.user.id, postId } },
      update: {},
      create: { userId: session.user.id, postId },
    })
    return NextResponse.json(saved, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error' }, { status: 400 })
    }
    console.error('POST /api/saved error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { postId } = savedSchema.parse(body)

    await prisma.savedPost.delete({
      where: { userId_postId: { userId: session.user.id, postId } },
    })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error' }, { status: 400 })
    }
    console.error('DELETE /api/saved error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
