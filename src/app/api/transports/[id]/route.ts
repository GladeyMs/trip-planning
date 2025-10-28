import { NextRequest, NextResponse } from 'next/server'
import { updateTransportation, deleteTransportation } from '@/lib/data/trips'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const transport = await updateTransportation(id, body)
    if (!transport) {
      return NextResponse.json({ error: 'Transport not found' }, { status: 404 })
    }
    return NextResponse.json(transport)
  } catch (error) {
    console.error('PATCH /api/transports/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update transport' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await deleteTransportation(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Transport not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/transports/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete transport' }, { status: 500 })
  }
}
