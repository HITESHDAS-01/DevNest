import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { blockers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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

  const projectBlockers = await db.query.blockers.findMany({
    where: eq(blockers.projectId, projectId),
    orderBy: (b, { desc: d }) => [d(b.createdAt)],
  });

  return NextResponse.json({ blockers: projectBlockers });
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
  const { title, description, severity, taskId } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const newBlocker = await db
    .insert(blockers)
    .values({
      projectId,
      title,
      description,
      severity: severity || 'medium',
      taskId: taskId || null,
    })
    .returning();

  return NextResponse.json({ blocker: newBlocker[0] }, { status: 201 });
}
