import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Transient error codes/messages that warrant a retry
const TRANSIENT_PATTERNS = [
  'prepared statement',         // PgBouncer transaction-mode prepared-statement mismatch
  'connection pool timeout',
  "can't reach database server",
  'connection timed out',
  'P1001',                      // Cannot reach database server
  'P1017',                      // Server closed the connection
  'P2024',                      // Connection pool timeout
]

function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const msg = error.message.toLowerCase()
  return TRANSIENT_PATTERNS.some((pattern) => msg.includes(pattern.toLowerCase()))
}

/**
 * Executes a Prisma query with automatic retries on transient failures.
 * Uses exponential back-off: 500 ms, 1 s, 2 s, …
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelayMs = 500,
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (!isTransientError(error) || attempt === retries - 1) throw error
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt)))
    }
  }
  throw new Error('withRetry: retries must be greater than 0')
}
