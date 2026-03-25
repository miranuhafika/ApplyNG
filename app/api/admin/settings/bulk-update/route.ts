import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware/adminAuth'
import { bulkUpdateSettings } from '@/lib/db/settings'
import { z } from 'zod'

const bulkUpdateSchema = z.object({
  settings: z
    .array(
      z.object({
        key: z.string().min(1).max(100),
        value: z.string().max(5000),
      })
    )
    .min(1)
    .max(50),
})

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const data = bulkUpdateSchema.parse(body)

    const changedBy = session!.user?.email ?? session!.user?.name ?? 'admin'
    const results = await bulkUpdateSettings(data.settings, changedBy)

    const failed = results.filter((r) => !r.success)
    if (failed.length > 0) {
      return NextResponse.json(
        { results, message: `${failed.length} setting(s) could not be updated (key not found)` },
        { status: 207 }
      )
    }

    return NextResponse.json({ results, message: 'All settings updated successfully' })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 })
    }
    console.error('POST /api/admin/settings/bulk-update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
