import { NextResponse } from 'next/server';
import { setSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, organizations, members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
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

    // Create default organization with unique slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const orgSlug = `${baseSlug}-${Date.now().toString(36)}`;

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
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
