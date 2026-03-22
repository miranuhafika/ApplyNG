import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  adminNotes: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { status, adminNotes } = updateSchema.parse(body)

    const submission = await prisma.submission.update({
      where: { id },
      data: { status, adminNotes },
    })

    // If approved, create a post
    if (status === 'APPROVED') {
      const slug = slugify(submission.title) + '-' + Date.now().toString(36)
      await prisma.post.create({
        data: {
          title: submission.title,
          slug,
          category: submission.category,
          organization: submission.organization,
          location: submission.location,
          isRemote: submission.isRemote,
          fundingType: submission.fundingType,
          description: submission.description,
          eligibility: submission.eligibility,
          applyUrl: submission.applyUrl,
          deadline: submission.deadline,
          status: 'PUBLISHED',
        },
      })
    }

    return NextResponse.json(submission)
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error' }, { status: 400 })
    }
    console.error('PUT /api/admin/submissions/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
