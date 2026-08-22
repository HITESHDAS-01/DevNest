import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, taskId } = await params;
  const body = await request.json();
  body.updatedAt = new Date();

  const [updated] = await db
    .update(tasks)
    .set(body)
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json({ task: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, taskId } = await params;

  const [deleted] = await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
