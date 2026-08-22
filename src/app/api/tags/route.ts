import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { tags, members } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const member = await db.query.members.findFirst({
    where: eq(members.userId, session.user.id),
  });

  if (!member) {
    return NextResponse.json({ tags: [] });
  }

  const orgTags = await db.query.tags.findMany({
    where: eq(tags.orgId, member.orgId),
    orderBy: (t, { asc: a }) => [a(t.name)],
  });

  return NextResponse.json({ tags: orgTags });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const member = await db.query.members.findFirst({
    where: eq(members.userId, session.user.id),
  });

  if (!member) {
    return NextResponse.json({ error: 'No organization found' }, { status: 400 });
  }

  const body = await request.json();
  const { name, color } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const existing = await db.query.tags.findFirst({
    where: and(eq(tags.orgId, member.orgId), eq(tags.name, name)),
  });

  if (existing) {
    return NextResponse.json({ error: 'Tag already exists' }, { status: 409 });
  }

  const newTag = await db
    .insert(tags)
    .values({
      orgId: member.orgId,
      name,
      color: color || '#6b7280',
    })
    .returning();

  return NextResponse.json({ tag: newTag[0] }, { status: 201 });
}
