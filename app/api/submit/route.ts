import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { submissionSchema } from '@/lib/schemas'
import { sendSubmissionConfirmation, sendAdminNotification } from '@/lib/mail'
import { checkRateLimit, getRateLimitKey } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  if (!checkRateLimit(getRateLimitKey(ip, 'submit'), 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const data = submissionSchema.parse(body)

    const submission = await prisma.submission.create({
      data: {
        title: data.title,
        organization: data.organization,
        category: data.category,
        location: data.location,
        isRemote: data.isRemote,
        fundingType: data.fundingType,
        description: data.description,
        eligibility: data.eligibility,
        applyUrl: data.applyUrl,
        deadline: data.deadline ? new Date(data.deadline) : null,
        contactEmail: data.contactEmail,
      },
    })

    // Send emails asynchronously
    sendSubmissionConfirmation(data.contactEmail, data.title).catch(console.error)
    sendAdminNotification(submission).catch(console.error)

    return NextResponse.json({ message: 'Submission received! We will review it within 24-48 hours.' }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 })
    }
    console.error('POST /api/submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
