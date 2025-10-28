import { NextRequest, NextResponse } from 'next/server'
import { getAllTrips, createTrip } from '@/lib/data/trips'
import { CreateTripSchema } from '@/lib/schemas'

export async function GET() {
  try {
    const trips = await getAllTrips()
    return NextResponse.json(trips)
  } catch (error) {
    console.error('GET /api/trips error:', error)
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = CreateTripSchema.parse(body)
    const trip = await createTrip(validated)
    return NextResponse.json(trip, { status: 201 })
  } catch (error) {
    console.error('POST /api/trips error:', error)
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
  }
}
