import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    });

    if (!member) {
      return NextResponse.json({ projects: [] });
    }

    const userProjects = await db.query.projects.findMany({
      where: eq(projects.orgId, member.orgId),
      orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
    });

    return NextResponse.json({ projects: userProjects });
  } catch (error: any) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color, repoUrl, priority } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    });

    if (!member) {
      return NextResponse.json({ error: 'No organization found for user' }, { status: 400 });
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newProject = await db
      .insert(projects)
      .values({
        orgId: member.orgId,
        name,
        slug,
        description,
        color: color || '#6366f1',
        repoUrl,
        priority: priority || 3,
        createdBy: session.user.id,
      })
      .returning();

    return NextResponse.json({ project: newProject[0] }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
