import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const projectResources = await db.query.resources.findMany({
    where: eq(resources.projectId, id),
    orderBy: (r, { desc: d }) => [d(r.createdAt)],
  });

  return NextResponse.json({ resources: projectResources });
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
  const body = await request.json();
  const { title, url, type, notes } = body;

  if (!title || !url) {
    return NextResponse.json(
      { error: 'Title and URL are required' },
      { status: 400 }
    );
  }

  const newResource = await db
    .insert(resources)
    .values({
      projectId: id,
      title,
      url,
      type: type || 'link',
      notes,
    })
    .returning();

  return NextResponse.json({ resource: newResource[0] }, { status: 201 });
}
