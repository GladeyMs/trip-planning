import { NextRequest, NextResponse } from 'next/server'
import { addDay } from '@/lib/data/trips'
import { CreateDaySchema } from '@/lib/schemas'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tripId } = await params
    const body = await request.json()
    const validated = CreateDaySchema.omit({ tripId: true }).parse(body)
    const day = await addDay(tripId, validated)
    if (!day) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }
    return NextResponse.json(day, { status: 201 })
  } catch (error) {
    console.error('POST /api/trips/[id]/days error:', error)
    return NextResponse.json({ error: 'Failed to add day' }, { status: 500 })
  }
}
