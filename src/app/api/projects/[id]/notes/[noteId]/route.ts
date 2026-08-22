import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, noteId } = await params;
  const body = await request.json();
  body.updatedAt = new Date();

  const [updated] = await db
    .update(notes)
    .set(body)
    .where(and(eq(notes.id, noteId), eq(notes.projectId, id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  return NextResponse.json({ note: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, noteId } = await params;

  const [deleted] = await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.projectId, id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
