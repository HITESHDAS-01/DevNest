import { NextResponse } from 'next/server';
import { setSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, organizations, members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createHmac } from 'crypto';

function hashPassword(password: string): string {
  return createHmac('sha256', process.env.NEXTAUTH_SECRET || 'devnest-super-secret-key')
    .update(password)
    .digest('hex');
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      name,
    })
    .returning();

  // Create default organization
  const orgSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const [org] = await db
    .insert(organizations)
    .values({
      name: `${name}'s Workspace`,
      slug: orgSlug,
    })
    .returning();

  // Add user as owner
  await db.insert(members).values({
    orgId: org.id,
    userId: newUser.id,
    role: 'owner',
  });

  // Set session
  await setSession({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name || name,
    image: newUser.avatarUrl,
  });

  return NextResponse.json({ user: newUser }, { status: 201 });
}
