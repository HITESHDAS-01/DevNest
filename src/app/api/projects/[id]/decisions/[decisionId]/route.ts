import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { decisions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; decisionId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, decisionId } = await params;
  const body = await request.json();

  const [updated] = await db
    .update(decisions)
    .set(body)
    .where(and(eq(decisions.id, decisionId), eq(decisions.projectId, id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
  }

  return NextResponse.json({ decision: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; decisionId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, decisionId } = await params;

  const [deleted] = await db
    .delete(decisions)
    .where(and(eq(decisions.id, decisionId), eq(decisions.projectId, id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
