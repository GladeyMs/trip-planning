import { NextRequest, NextResponse } from 'next/server'
import { reorderDays } from '@/lib/data/trips'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tripId } = await params
    const { dayIds } = await request.json()
    const success = await reorderDays(tripId, dayIds)
    if (!success) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/trips/[id]/days/reorder error:', error)
    return NextResponse.json({ error: 'Failed to reorder days' }, { status: 500 })
  }
}
