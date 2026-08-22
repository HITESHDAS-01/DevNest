import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { phases } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { phases: phaseUpdates } = body;

  if (!Array.isArray(phaseUpdates)) {
    return NextResponse.json(
      { error: 'phases array is required' },
      { status: 400 }
    );
  }

  const updated = await db.transaction(async (tx) => {
    const results = [];
    for (const phase of phaseUpdates) {
      const { id: phaseId, ...updates } = phase;
      if (!phaseId) continue;
      const [updated] = await tx
        .update(phases)
        .set(updates)
        .where(and(eq(phases.id, phaseId), eq(phases.projectId, id)))
        .returning();
      if (updated) results.push(updated);
    }
    return results;
  });

  return NextResponse.json({ phases: updated });
}
