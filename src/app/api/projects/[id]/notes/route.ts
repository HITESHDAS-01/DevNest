import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notes } from '@/lib/db/schema';
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

  const projectNotes = await db.query.notes.findMany({
    where: eq(notes.projectId, id),
    orderBy: (n, { desc: d }) => [d(n.pinned), d(n.updatedAt)],
  });

  return NextResponse.json({ notes: projectNotes });
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
  const { title, content, tags, pinned } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const newNote = await db
    .insert(notes)
    .values({
      projectId: id,
      title,
      content,
      tags: tags || [],
      pinned: pinned || false,
    })
    .returning();

  return NextResponse.json({ note: newNote[0] }, { status: 201 });
}
