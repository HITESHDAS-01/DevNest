import { NextResponse } from 'next/server';
import { setSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, organizations, members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find or create user in DB
    let existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!existingUser) {
      const name = email.split('@')[0];
      const [newUser] = await db
        .insert(users)
        .values({ email, name })
        .returning();
      existingUser = newUser;
    }

    // Find or create organization for user
    let member = await db.query.members.findFirst({
      where: eq(members.userId, existingUser.id),
    });

    if (!member) {
      const baseSlug = (existingUser.name || existingUser.email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      const orgSlug = `${baseSlug}-${Date.now().toString(36)}`;

      const [org] = await db
        .insert(organizations)
        .values({
          name: `${existingUser.name || existingUser.email.split('@')[0]}'s Workspace`,
          slug: orgSlug,
        })
        .returning();

      const [newMember] = await db
        .insert(members)
        .values({
          orgId: org.id,
          userId: existingUser.id,
          role: 'owner',
        })
        .returning();

      member = newMember;
    }

    // Set session with real DB user ID
    await setSession({
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name || existingUser.email.split('@')[0],
      image: existingUser.avatarUrl,
    });

    return NextResponse.json({ user: existingUser });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to sign in' }, { status: 500 });
  }
}
