import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { activityLog } from '@/lib/db/schema';
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

  const activities = await db.query.activityLog.findMany({
    where: eq(activityLog.projectId, projectId),
    orderBy: (a, { desc: d }) => [d(a.createdAt)],
    limit: 100,
  });

  return NextResponse.json({ activities });
}
