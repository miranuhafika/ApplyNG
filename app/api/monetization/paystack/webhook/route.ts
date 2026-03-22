import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/paystack'
import { sendPaymentConfirmationEmail } from '@/lib/mail'

// Paystack sends webhook events with this header
const PAYSTACK_SIGNATURE_HEADER = 'x-paystack-signature'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get(PAYSTACK_SIGNATURE_HEADER) ?? ''

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody) as {
      event: string
      data: {
        id: number
        reference: string
        status: string
        amount: number
        customer: { email: string }
        metadata: Record<string, unknown> | null
      }
    }

    if (event.event === 'charge.success') {
      await handleChargeSuccess(event.data)
    } else if (event.event === 'charge.failed') {
      await handleChargeFailed(event.data)
    } else if (event.event === 'refund.processed') {
      await handleRefundProcessed(event.data)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[paystack/webhook]', error)
    // Return 200 to prevent Paystack from retrying on our parsing errors
    return NextResponse.json({ received: true })
  }
}

async function handleChargeSuccess(data: {
  id: number
  reference: string
  status: string
  amount: number
  customer: { email: string }
  metadata: Record<string, unknown> | null
}) {
  const payment = await prisma.payment.findUnique({ where: { reference: data.reference } })
  if (!payment || payment.status === 'SUCCESS') return

  const updated = await prisma.payment.update({
    where: { reference: data.reference },
    data: { status: 'SUCCESS', paystackId: String(data.id) },
  })

  // Activate sponsorship / featured listing
  if ((updated.type === 'SPONSORSHIP' || updated.type === 'FEATURED') && updated.postId) {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    await prisma.$transaction([
      prisma.post.update({
        where: { id: updated.postId },
        data: updated.type === 'SPONSORSHIP' ? { sponsored: true } : { featured: true },
      }),
      prisma.sponsorship.upsert({
        where: { paymentId: updated.id },
        create: { postId: updated.postId, paymentId: updated.id, endDate },
        update: { isActive: true, endDate },
      }),
    ])
  }

  await sendPaymentConfirmationEmail({
    to: updated.email,
    reference: updated.reference,
    amountKobo: updated.amount,
    type: updated.type as 'SPONSORSHIP' | 'FEATURED' | 'NEWSLETTER',
  })
}

async function handleChargeFailed(data: { reference: string }) {
  await prisma.payment.updateMany({
    where: { reference: data.reference, status: 'PENDING' },
    data: { status: 'FAILED' },
  })
}

async function handleRefundProcessed(data: { reference: string }) {
  await prisma.payment.updateMany({
    where: { reference: data.reference },
    data: { status: 'REFUNDED' },
  })
}
