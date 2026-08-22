import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { maintenanceItems } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, itemId } = await params;
  const body = await request.json();

  if (body.status === 'resolved' && !body.resolvedAt) {
    body.resolvedAt = new Date();
  }

  const [updated] = await db
    .update(maintenanceItems)
    .set(body)
    .where(
      and(
        eq(maintenanceItems.id, itemId),
        eq(maintenanceItems.projectId, id)
      )
    )
    .returning();

  if (!updated) {
    return NextResponse.json(
      { error: 'Maintenance item not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ maintenanceItem: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, itemId } = await params;

  const [deleted] = await db
    .delete(maintenanceItems)
    .where(
      and(
        eq(maintenanceItems.id, itemId),
        eq(maintenanceItems.projectId, id)
      )
    )
    .returning();

  if (!deleted) {
    return NextResponse.json(
      { error: 'Maintenance item not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
