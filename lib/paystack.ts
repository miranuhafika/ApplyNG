import { createHmac } from 'crypto'
import { PAYSTACK_PRICES, PAYSTACK_LABELS } from './constants'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('PAYSTACK_SECRET_KEY environment variable is not set')
  return key
}

async function paystackFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = (await res.json()) as { status: boolean; message: string; data: T }

  if (!res.ok || !data.status) {
    throw new Error(data.message || `Paystack request failed: ${res.status}`)
  }

  return data.data
}

// ── Types ────────────────────────────────────────────────────────────────────

export type PaymentTypeKey = keyof typeof PAYSTACK_PRICES

export interface InitializeTransactionInput {
  email: string
  type: PaymentTypeKey
  /** Post ID for SPONSORSHIP / FEATURED types */
  postId?: string
  /** Extra metadata stored on the transaction */
  metadata?: Record<string, unknown>
  /** Idempotency key for duplicate prevention */
  idempotencyKey?: string
}

export interface PaystackTransaction {
  id: number
  reference: string
  amount: number
  currency: string
  status: string
  paid_at: string | null
  created_at: string
  channel: string
  customer: { email: string }
  metadata: Record<string, unknown> | null
}

export interface PaystackInitResponse {
  authorization_url: string
  access_code: string
  reference: string
}

export interface PaystackBalance {
  currency: string
  balance: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a unique reference with a readable prefix */
export function generateReference(type: PaymentTypeKey): string {
  const prefix = type.slice(0, 3).toUpperCase()
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `APG-${prefix}-${ts}-${rand}`
}

/** Verify a Paystack webhook signature */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || getSecretKey()
  const hash = createHmac('sha512', secret).update(payload).digest('hex')
  return hash === signature
}

// ── API Wrappers ─────────────────────────────────────────────────────────────

/** Initialize a new Paystack transaction */
export async function initializeTransaction(
  input: InitializeTransactionInput,
): Promise<PaystackInitResponse> {
  const { email, type, postId, metadata = {}, idempotencyKey } = input
  const amount = PAYSTACK_PRICES[type]
  const reference = generateReference(type)

  const headers: Record<string, string> = {}
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

  return paystackFetch<PaystackInitResponse>('/transaction/initialize', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      amount,
      reference,
      currency: 'NGN',
      callback_url: `${process.env.NEXTAUTH_URL}/api/monetization/paystack/verify`,
      metadata: {
        ...metadata,
        type,
        postId,
        label: PAYSTACK_LABELS[type],
      },
    }),
  })
}

/** Verify a Paystack transaction by reference */
export async function verifyTransaction(reference: string): Promise<PaystackTransaction> {
  return paystackFetch<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`)
}

/** Get a single transaction by ID */
export async function getTransaction(id: number): Promise<PaystackTransaction> {
  return paystackFetch<PaystackTransaction>(`/transaction/${id}`)
}

/** List transactions with optional pagination */
export async function listTransactions(params?: {
  perPage?: number
  page?: number
  status?: string
}): Promise<PaystackTransaction[]> {
  const query = new URLSearchParams()
  if (params?.perPage) query.set('perPage', String(params.perPage))
  if (params?.page) query.set('page', String(params.page))
  if (params?.status) query.set('status', params.status)

  const qs = query.toString()
  return paystackFetch<PaystackTransaction[]>(`/transaction${qs ? `?${qs}` : ''}`)
}

/** Initiate a full refund for a transaction */
export async function refundTransaction(
  transaction: string | number,
  amountKobo?: number,
): Promise<unknown> {
  return paystackFetch('/refund', {
    method: 'POST',
    body: JSON.stringify({
      transaction: String(transaction),
      ...(amountKobo ? { amount: amountKobo } : {}),
    }),
  })
}

/** Fetch the Paystack balance for the integration */
export async function getBalance(): Promise<PaystackBalance[]> {
  return paystackFetch<PaystackBalance[]>('/balance')
}
