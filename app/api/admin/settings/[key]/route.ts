import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware/adminAuth'
import { getSettingByKey, updateSetting, deleteSetting, getAuditLogsForSetting } from '@/lib/db/settings'
import { z } from 'zod'

const updateSettingSchema = z.object({
  value: z.string().max(5000),
  description: z.string().max(500).optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { session, error } = await requireAdmin()
  if (error) return error
  void session

  const { key } = await params

  try {
    const setting = await getSettingByKey(key)
    if (!setting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }
    const auditLogs = await getAuditLogsForSetting(key)
    return NextResponse.json({ setting, auditLogs })
  } catch (err) {
    console.error(`GET /api/admin/settings/${key} error:`, err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { session, error } = await requireAdmin()
  if (error) return error

  const { key } = await params

  try {
    const body = await request.json()
    const data = updateSettingSchema.parse(body)

    const changedBy = session!.user?.email ?? session!.user?.name ?? 'admin'
    const updated = await updateSetting(key, data.value, changedBy, data.description)

    if (!updated) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    return NextResponse.json({ setting: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 })
    }
    console.error(`PUT /api/admin/settings/${key} error:`, err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { session, error } = await requireAdmin()
  if (error) return error
  void session

  const { key } = await params

  try {
    await deleteSetting(key)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(`DELETE /api/admin/settings/${key} error:`, err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
