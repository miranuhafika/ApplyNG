import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

let bootstrapped = false

export async function bootstrapAdmin(): Promise<void> {
  if (bootstrapped) return
  bootstrapped = true

  const email = process.env.DEFAULT_ADMIN_EMAIL
  const password = process.env.DEFAULT_ADMIN_PASSWORD

  if (!email || !password) {
    return
  }

  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    if (existingAdmin) {
      return
    }

    const hashedPassword = await hashPassword(password)
    await prisma.user.create({
      data: {
        email,
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    if (process.env.NODE_ENV !== 'production') {
      console.log('Default admin account created.')
    }
  } catch (error) {
    console.error('Admin bootstrap error:', error)
  }
}
