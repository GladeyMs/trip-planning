import { NextRequest, NextResponse } from 'next/server'
import { searchPlaces } from '@/lib/data/places'

// Mock places for when no OpenTripMap API key is available
const mockPlaces = [
  {
    id: 'mock-1',
    name: 'Hoan Kiem Lake',
    lat: 21.0285,
    lng: 105.8542,
    address: 'Hanoi, Vietnam',
    provider: 'custom' as const,
  },
  {
    id: 'mock-2',
    name: 'Old Quarter',
    lat: 21.0353,
    lng: 105.8495,
    address: 'Hanoi, Vietnam',
    provider: 'custom' as const,
  },
  {
    id: 'mock-3',
    name: 'Fansipan Peak',
    lat: 22.3025,
    lng: 103.7751,
    address: 'Sapa, Vietnam',
    provider: 'custom' as const,
  },
  {
    id: 'mock-4',
    name: 'Sapa Town',
    lat: 22.3363,
    lng: 103.8438,
    address: 'Sapa, Vietnam',
    provider: 'custom' as const,
  },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    // Try searching cached places first
    const cached = await searchPlaces(query)
    if (cached.length > 0) {
      return NextResponse.json(cached)
    }

    // Check if OpenTripMap API key is available
    const apiKey = process.env.OPENTRIPMAP_API_KEY

    if (!apiKey) {
      // Return mock data
      const filtered = mockPlaces.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.address.toLowerCase().includes(query.toLowerCase())
      )
      return NextResponse.json(filtered)
    }

    // TODO: Implement OpenTripMap API integration here
    // For now, return mock data
    return NextResponse.json(mockPlaces)
  } catch (error) {
    console.error('GET /api/places/search error:', error)
    return NextResponse.json({ error: 'Failed to search places' }, { status: 500 })
  }
}
