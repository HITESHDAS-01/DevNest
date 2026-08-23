import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { decisions } from '@/lib/db/schema';
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

  const projectDecisions = await db.query.decisions.findMany({
    where: eq(decisions.projectId, projectId),
    orderBy: (d, { desc: dd }) => [dd(d.decidedAt)],
  });

  return NextResponse.json({ decisions: projectDecisions });
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
  const { title, context, options, chosen, rationale } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const newDecision = await db
    .insert(decisions)
    .values({
      projectId: projectId,
      title,
      context,
      options: options || [],
      chosen,
      rationale,
    })
    .returning();

  return NextResponse.json({ decision: newDecision[0] }, { status: 201 });
}
