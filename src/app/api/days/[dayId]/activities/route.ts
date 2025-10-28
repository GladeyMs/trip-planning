import { NextRequest, NextResponse } from 'next/server';
import { addActivity } from '@/lib/data/trips';
import { CreateActivitySchema } from '@/lib/schemas';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dayId: string }> }
) {
  try {
    const { dayId } = await params;
    const body = await request.json();
    const validated = CreateActivitySchema.omit({ dayId: true }).parse(body);
    const activity = await addActivity(dayId, validated);
    if (!activity) {
      return NextResponse.json({ error: 'Day not found' }, { status: 404 });
    }
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('POST /api/days/[dayId]/activities error:', error);
    return NextResponse.json({ error: 'Failed to add activity' }, { status: 500 });
  }
}
