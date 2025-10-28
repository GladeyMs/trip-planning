import { NextRequest, NextResponse } from 'next/server';
import { addTransportation } from '@/lib/data/trips';
import { CreateTransportationSchema } from '@/lib/schemas';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dayId: string }> }
) {
  try {
    const { dayId } = await params;
    const body = await request.json();
    const validated = CreateTransportationSchema.omit({ dayId: true }).parse(body);
    const transport = await addTransportation(dayId, validated);
    if (!transport) {
      return NextResponse.json({ error: 'Day not found' }, { status: 404 });
    }
    return NextResponse.json(transport, { status: 201 });
  } catch (error) {
    console.error('POST /api/days/[dayId]/transports error:', error);
    return NextResponse.json({ error: 'Failed to add transport' }, { status: 500 });
  }
}
