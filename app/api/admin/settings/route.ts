import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware/adminAuth'
import { getAllSettings, upsertSetting, DEFAULT_SETTINGS } from '@/lib/db/settings'
import { z } from 'zod'

const createSettingSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[A-Z0-9_]+$/, 'Key must be uppercase letters, digits, or underscores'),
  value: z.string().max(5000),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  isSecret: z.boolean().optional(),
})

export async function GET() {
  const { session, error } = await requireAdmin()
  if (error) return error
  void session

  try {
    const settings = await getAllSettings()

    // Seed defaults if no settings exist yet
    if (settings.length === 0) {
      for (const s of DEFAULT_SETTINGS) {
        await upsertSetting(s.key, s.value, {
          description: s.description,
          category: s.category,
          isSecret: s.isSecret,
        })
      }
      const seeded = await getAllSettings()
      return NextResponse.json({ settings: seeded })
    }

    return NextResponse.json({ settings })
  } catch (err) {
    console.error('GET /api/admin/settings error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin()
  if (error) return error
  void session

  try {
    const body = await request.json()
    const data = createSettingSchema.parse(body)

    const setting = await upsertSetting(data.key, data.value, {
      description: data.description,
      category: data.category,
      isSecret: data.isSecret,
    })

    return NextResponse.json({ setting }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 })
    }
    console.error('POST /api/admin/settings error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
