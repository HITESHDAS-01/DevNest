import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { activityLog } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const activities = await db.query.activityLog.findMany({
    where: eq(activityLog.projectId, id),
    orderBy: (a, { desc: d }) => [d(a.createdAt)],
    limit: 100,
  });

  return NextResponse.json({ activities });
}
