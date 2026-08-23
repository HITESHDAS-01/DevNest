import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPAT } from '@/lib/github';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pat } = await request.json();
  if (!pat) {
    return NextResponse.json({ error: 'PAT is required' }, { status: 400 });
  }

  const result = await verifyPAT(pat);
  if (!result.valid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  await db
    .update(users)
    .set({ githubPAT: pat, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({
    success: true,
    user: result.user,
  });
}

export async function DELETE() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db
    .update(users)
    .set({ githubPAT: null, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user?.githubPAT) {
    return NextResponse.json({ connected: false });
  }

  const result = await verifyPAT(user.githubPAT);
  if (!result.valid) {
    return NextResponse.json({ connected: false, reason: 'token_invalid' });
  }

  return NextResponse.json({
    connected: true,
    user: result.user,
  });
}
