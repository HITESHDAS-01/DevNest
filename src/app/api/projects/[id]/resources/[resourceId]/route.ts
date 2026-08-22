import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; resourceId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, resourceId } = await params;
  const body = await request.json();

  const [updated] = await db
    .update(resources)
    .set(body)
    .where(and(eq(resources.id, resourceId), eq(resources.projectId, id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  return NextResponse.json({ resource: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; resourceId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, resourceId } = await params;

  const [deleted] = await db
    .delete(resources)
    .where(and(eq(resources.id, resourceId), eq(resources.projectId, id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
