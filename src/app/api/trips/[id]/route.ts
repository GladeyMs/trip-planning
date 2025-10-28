import { NextRequest, NextResponse } from 'next/server'
import { getTripById, updateTripWithData, deleteTrip } from '@/lib/data/trips'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const trip = await getTripById(id)
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }
    return NextResponse.json(trip)
  } catch (error) {
    console.error('GET /api/trips/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const trip = await updateTripWithData(id, body)
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }
    return NextResponse.json(trip)
  } catch (error) {
    console.error('PATCH /api/trips/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await deleteTrip(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/trips/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 })
  }
}
