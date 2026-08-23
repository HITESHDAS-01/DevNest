import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { ideas } from '@/lib/db/schema';
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

  const projectIdeas = await db.query.ideas.findMany({
    where: eq(ideas.projectId, projectId),
    orderBy: (i, { desc: d }) => [d(i.createdAt)],
  });

  return NextResponse.json({ ideas: projectIdeas });
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
  const { title, description, priority, effort } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const newIdea = await db
    .insert(ideas)
    .values({
      projectId: projectId,
      title,
      description,
      priority: priority || 3,
      effort,
    })
    .returning();

  return NextResponse.json({ idea: newIdea[0] }, { status: 201 });
}
