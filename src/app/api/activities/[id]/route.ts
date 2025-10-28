import { NextRequest, NextResponse } from 'next/server'
import { updateActivity, deleteActivity } from '@/lib/data/trips'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const activity = await updateActivity(id, body)
    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }
    return NextResponse.json(activity)
  } catch (error) {
    console.error('PATCH /api/activities/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await deleteActivity(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/activities/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 })
  }
}
