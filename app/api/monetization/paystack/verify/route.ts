import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyTransaction } from '@/lib/paystack'
import { sendPaymentConfirmationEmail } from '@/lib/mail'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reference } = await req.json()
    if (!reference || typeof reference !== 'string') {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    const txn = await verifyTransaction(reference)

    const payment = await prisma.payment.findUnique({ where: { reference } })
    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    if (payment.status === 'SUCCESS') {
      return NextResponse.json({ message: 'Already verified', payment })
    }

    const newStatus = txn.status === 'success' ? 'SUCCESS' : 'FAILED'

    const updated = await prisma.payment.update({
      where: { reference },
      data: {
        status: newStatus,
        paystackId: String(txn.id),
      },
    })

    if (newStatus === 'SUCCESS') {
      await activatePayment(updated)
      await sendPaymentConfirmationEmail({
        to: payment.email,
        reference: payment.reference,
        amountKobo: payment.amount,
        type: payment.type as 'SPONSORSHIP' | 'FEATURED' | 'NEWSLETTER',
      })
    }

    return NextResponse.json({ status: newStatus, payment: updated })
  } catch (error) {
    console.error('[paystack/verify]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 },
    )
  }
}

async function activatePayment(payment: {
  id: string
  type: string
  postId: string | null
}) {
  if (payment.type === 'SPONSORSHIP' && payment.postId) {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    await prisma.$transaction([
      prisma.post.update({
        where: { id: payment.postId },
        data: { sponsored: true },
      }),
      prisma.sponsorship.create({
        data: {
          postId: payment.postId,
          paymentId: payment.id,
          endDate,
        },
      }),
    ])
  } else if (payment.type === 'FEATURED' && payment.postId) {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    await prisma.$transaction([
      prisma.post.update({
        where: { id: payment.postId },
        data: { featured: true },
      }),
      prisma.sponsorship.create({
        data: {
          postId: payment.postId,
          paymentId: payment.id,
          endDate,
        },
      }),
    ])
  }
  // NEWSLETTER type doesn't require a post activation; handled manually
}
