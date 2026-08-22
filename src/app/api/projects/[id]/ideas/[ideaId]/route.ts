import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { ideas } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; ideaId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, ideaId } = await params;
  const body = await request.json();

  const [updated] = await db
    .update(ideas)
    .set(body)
    .where(and(eq(ideas.id, ideaId), eq(ideas.projectId, id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  return NextResponse.json({ idea: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; ideaId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, ideaId } = await params;

  const [deleted] = await db
    .delete(ideas)
    .where(and(eq(ideas.id, ideaId), eq(ideas.projectId, id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
