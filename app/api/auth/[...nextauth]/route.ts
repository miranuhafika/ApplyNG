import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { bootstrapAdmin } from '@/lib/bootstrap'

const handler = NextAuth(authOptions)

async function withBootstrap(
  req: Parameters<typeof handler>[0],
  context: Parameters<typeof handler>[1]
) {
  if (!process.env.DATABASE_URL || !process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL) {
    return NextResponse.json(
      { error: 'Server configuration error: required environment variables are missing (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL).' },
      { status: 503 }
    )
  }
  await bootstrapAdmin()
  return handler(req, context)
}

export { withBootstrap as GET, withBootstrap as POST }
