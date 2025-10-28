import { NextRequest, NextResponse } from 'next/server';
import { deleteDay } from '@/lib/data/trips';

/**
 * DELETE /api/days/[dayId]
 * Delete a day
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dayId: string }> }
) {
  try {
    const { dayId } = await params;
    const success = await deleteDay(dayId);

    if (!success) {
      return NextResponse.json({ error: 'Day not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete day error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
