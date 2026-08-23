import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { milestones } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { resolveProjectId } from '@/lib/db/helpers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const projectId = await resolveProjectId(id);
  if (!projectId) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const projectMilestones = await db.query.milestones.findMany({
    where: eq(milestones.projectId, projectId),
    orderBy: (m, { asc: a }) => [a(m.order)],
  });

  return NextResponse.json({ milestones: projectMilestones });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const projectId = await resolveProjectId(id);
  if (!projectId) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  const body = await request.json();
  const { name, description, targetDate } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const existing = await db.query.milestones.findMany({
    where: eq(milestones.projectId, projectId),
    orderBy: (m, { desc: d }) => [d(m.order)],
  });

  const maxOrder = existing[0]?.order ?? -1;

  const newMilestone = await db
    .insert(milestones)
    .values({
      projectId: projectId,
      name,
      description,
      targetDate: targetDate ?? null,
      order: maxOrder + 1,
    })
    .returning();

  return NextResponse.json({ milestone: newMilestone[0] }, { status: 201 });
}
