import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
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

  const projectTasks = await db.query.tasks.findMany({
    where: eq(tasks.projectId, projectId),
    orderBy: (tasks, { asc }) => [asc(tasks.order)],
  });

  return NextResponse.json({ tasks: projectTasks });
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
  const { title, description, priority, estimateMinutes, milestoneId, dueDate } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const existingTasks = await db.query.tasks.findMany({
    where: eq(tasks.projectId, projectId),
    orderBy: (tasks, { desc }) => [desc(tasks.order)],
  });

  const maxOrder = existingTasks[0]?.order ?? -1;

  const newTask = await db
    .insert(tasks)
    .values({
      projectId,
      title,
      description,
      priority: priority || 3,
      estimateMinutes,
      milestoneId,
      dueDate: dueDate ? new Date(dueDate) : null,
      order: maxOrder + 1,
    })
    .returning();

  return NextResponse.json({ task: newTask[0] }, { status: 201 });
}
