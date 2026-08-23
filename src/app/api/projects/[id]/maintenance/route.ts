import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { maintenanceItems } from '@/lib/db/schema';
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

  const projectMaintenance = await db.query.maintenanceItems.findMany({
    where: eq(maintenanceItems.projectId, projectId),
    orderBy: (m, { desc: d }) => [d(m.createdAt)],
  });

  return NextResponse.json({ maintenanceItems: projectMaintenance });
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
  const { type, title, description, priority, severity } = body;

  if (!type || !title) {
    return NextResponse.json(
      { error: 'Type and title are required' },
      { status: 400 }
    );
  }

  const newItem = await db
    .insert(maintenanceItems)
    .values({
      projectId: projectId,
      type,
      title,
      description,
      priority: priority || 3,
      severity: severity || 'medium',
    })
    .returning();

  return NextResponse.json({ maintenanceItem: newItem[0] }, { status: 201 });
}
