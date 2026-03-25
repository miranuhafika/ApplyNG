import { prisma } from '@/lib/prisma'

export async function getSettingByKey(key: string) {
  return prisma.setting.findUnique({ where: { key } })
}

export async function getAllSettings() {
  return prisma.setting.findMany({ orderBy: [{ category: 'asc' }, { key: 'asc' }] })
}

export async function upsertSetting(
  key: string,
  value: string,
  options?: { description?: string; category?: string; isSecret?: boolean }
) {
  return prisma.setting.upsert({
    where: { key },
    update: { value, ...(options?.description !== undefined && { description: options.description }) },
    create: {
      key,
      value,
      description: options?.description,
      category: options?.category ?? 'general',
      isSecret: options?.isSecret ?? false,
    },
  })
}

export async function updateSetting(
  key: string,
  value: string,
  changedBy: string,
  description?: string
) {
  const existing = await prisma.setting.findUnique({ where: { key } })
  if (!existing) return null

  const [updated] = await prisma.$transaction([
    prisma.setting.update({
      where: { key },
      data: {
        value,
        ...(description !== undefined && { description }),
      },
    }),
    prisma.settingAuditLog.create({
      data: {
        settingId: existing.id,
        key,
        oldValue: existing.value,
        newValue: value,
        changedBy,
      },
    }),
  ])

  return updated
}

export async function deleteSetting(key: string) {
  return prisma.setting.delete({ where: { key } })
}

export async function bulkUpdateSettings(
  updates: { key: string; value: string }[],
  changedBy: string
) {
  const results: { key: string; success: boolean }[] = []

  for (const { key, value } of updates) {
    try {
      const result = await updateSetting(key, value, changedBy)
      results.push({ key, success: result !== null })
    } catch {
      results.push({ key, success: false })
    }
  }

  return results
}

export async function getAuditLogsForSetting(key: string) {
  return prisma.settingAuditLog.findMany({
    where: { key },
    orderBy: { changedAt: 'desc' },
    take: 20,
  })
}

export const DEFAULT_SETTINGS: {
  key: string
  value: string
  description: string
  category: string
  isSecret: boolean
}[] = [
  { key: 'GOOGLE_CLIENT_ID', value: '', description: 'Google OAuth Client ID', category: 'oauth', isSecret: false },
  { key: 'GOOGLE_CLIENT_SECRET', value: '', description: 'Google OAuth Client Secret', category: 'oauth', isSecret: true },
  { key: 'PAYSTACK_PUBLIC_KEY', value: '', description: 'Paystack Public Key', category: 'payment', isSecret: false },
  { key: 'PAYSTACK_SECRET_KEY', value: '', description: 'Paystack Secret Key', category: 'payment', isSecret: true },
  { key: 'PAYSTACK_WEBHOOK_SECRET', value: '', description: 'Paystack Webhook Secret', category: 'payment', isSecret: true },
  { key: 'RESEND_API_KEY', value: '', description: 'Resend Email API Key', category: 'email', isSecret: true },
  { key: 'NEXTAUTH_SECRET', value: '', description: 'NextAuth JWT Secret', category: 'oauth', isSecret: true },
  { key: 'SITE_NAME', value: 'ApplyNG', description: 'Site name', category: 'site', isSecret: false },
  { key: 'SITE_DESCRIPTION', value: 'Your gateway to opportunities in Nigeria', description: 'Site description', category: 'site', isSecret: false },
  { key: 'SITE_URL', value: 'https://applyng.vercel.app', description: 'Site URL', category: 'site', isSecret: false },
  { key: 'CONTACT_EMAIL', value: '', description: 'Contact email address', category: 'contact', isSecret: false },
  { key: 'WHATSAPP_NUMBER', value: '', description: 'WhatsApp contact number', category: 'contact', isSecret: false },
  { key: 'NEWSLETTER_ENABLED', value: 'true', description: 'Enable newsletter feature', category: 'features', isSecret: false },
  { key: 'SPONSORSHIP_ENABLED', value: 'true', description: 'Enable sponsorship feature', category: 'features', isSecret: false },
  { key: 'FEATURED_POST_PRICE', value: '5000', description: 'Featured post price in kobo (NGN × 100)', category: 'pricing', isSecret: false },
  { key: 'SPONSORED_POST_PRICE', value: '10000', description: 'Sponsored post price in kobo (NGN × 100)', category: 'pricing', isSecret: false },
]
