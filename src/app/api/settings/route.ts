import { NextResponse } from 'next/server'
import { getSettings, updateSettings } from '@/lib/data/settings'

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const settings = await updateSettings(body)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('PATCH /api/settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
