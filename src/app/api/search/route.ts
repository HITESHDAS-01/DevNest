import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, tasks, notes, decisions, members } from '@/lib/db/schema';
import { eq, or, ilike, and } from 'drizzle-orm';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  const member = await db.query.members.findFirst({
    where: eq(members.userId, session.user.id),
  });

  if (!member) {
    return NextResponse.json({ results: [] });
  }

  const pattern = `%${q}%`;

  const orgProjects = await db.query.projects.findMany({
    where: eq(projects.orgId, member.orgId),
  });

  const projectIds = orgProjects.map((p) => p.id);

  const matchedProjects = orgProjects.filter(
    (p) =>
      (p.name && p.name.toLowerCase().includes(q.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(q.toLowerCase()))
  );

  const matchedTasks: any[] = [];
  const matchedNotes: any[] = [];
  const matchedDecisions: any[] = [];

  for (const pid of projectIds) {
    const projectTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.projectId, pid),
        or(
          ilike(tasks.title, pattern)
        )
      ),
    });
    matchedTasks.push(...projectTasks);

    const projectNotes = await db.query.notes.findMany({
      where: and(
        eq(notes.projectId, pid),
        or(
          ilike(notes.title, pattern),
          ilike(notes.content, pattern)
        )
      ),
    });
    matchedNotes.push(...projectNotes);

    const projectDecisions = await db.query.decisions.findMany({
      where: and(
        eq(decisions.projectId, pid),
        or(
          ilike(decisions.title, pattern)
        )
      ),
    });
    matchedDecisions.push(...projectDecisions);
  }

  const results = [
    ...matchedProjects.map((p) => ({
      type: 'project',
      id: p.id,
      title: p.name,
      description: p.description,
      projectId: p.id,
    })),
    ...matchedTasks.map((t) => ({
      type: 'task',
      id: t.id,
      title: t.title,
      description: t.description,
      projectId: t.projectId,
    })),
    ...matchedNotes.map((n) => ({
      type: 'note',
      id: n.id,
      title: n.title,
      description: n.content,
      projectId: n.projectId,
    })),
    ...matchedDecisions.map((d) => ({
      type: 'decision',
      id: d.id,
      title: d.title,
      description: d.context,
      projectId: d.projectId,
    })),
  ];

  return NextResponse.json({ results });
}
