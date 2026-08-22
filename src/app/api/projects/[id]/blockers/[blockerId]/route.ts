import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { blockers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; blockerId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, blockerId } = await params;
  const body = await request.json();

  if (body.status === 'resolved' && !body.resolvedAt) {
    body.resolvedAt = new Date();
  }

  const [updated] = await db
    .update(blockers)
    .set(body)
    .where(and(eq(blockers.id, blockerId), eq(blockers.projectId, id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Blocker not found' }, { status: 404 });
  }

  return NextResponse.json({ blocker: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; blockerId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, blockerId } = await params;

  const [deleted] = await db
    .delete(blockers)
    .where(and(eq(blockers.id, blockerId), eq(blockers.projectId, id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: 'Blocker not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
