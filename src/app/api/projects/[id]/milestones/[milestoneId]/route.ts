import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { milestones } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, milestoneId } = await params;
  const body = await request.json();

  const [updated] = await db
    .update(milestones)
    .set(body)
    .where(and(eq(milestones.id, milestoneId), eq(milestones.projectId, id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
  }

  return NextResponse.json({ milestone: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, milestoneId } = await params;

  const [deleted] = await db
    .delete(milestones)
    .where(and(eq(milestones.id, milestoneId), eq(milestones.projectId, id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
