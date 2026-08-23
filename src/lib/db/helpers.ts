import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { or, eq } from 'drizzle-orm';

export async function resolveProjectId(slugOrId: string): Promise<string | null> {
  const project = await db.query.projects.findFirst({
    where: or(eq(projects.slug, slugOrId), eq(projects.id, slugOrId)),
    columns: { id: true },
  });
  return project?.id || null;
}
