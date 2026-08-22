import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { githubIntegrations, projects, tasks, blockers, activityLog } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { parseRepoUrl, fetchRepoIssues, fetchRepoPRs } from '@/lib/github';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Get project and integration
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const integration = await db.query.githubIntegrations.findFirst({
    where: eq(githubIntegrations.projectId, id),
  });

  const repoUrl = project.repoUrl || (integration ? `https://github.com/${integration.repoOwner}/${integration.repoName}` : null);
  if (!repoUrl) {
    return NextResponse.json({ error: 'No GitHub repo linked' }, { status: 400 });
  }

  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid repo URL' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const githubToken = cookieStore.get('github-token')?.value;

  try {
    // Fetch issues and PRs
    const [issues, prs] = await Promise.all([
      fetchRepoIssues(parsed.owner, parsed.repo, githubToken),
      fetchRepoPRs(parsed.owner, parsed.repo, githubToken),
    ]);

    let tasksCreated = 0;
    let blockersCreated = 0;

    // Sync open issues as tasks
    const openIssues = issues.filter((i) => i.state === 'open');
    for (const issue of openIssues.slice(0, 50)) {
      const existingTasks = await db.query.tasks.findMany({
        where: eq(tasks.projectId, id),
      });
      const exists = existingTasks.some(
        (t) => t.title === `#${issue.number}: ${issue.title}`
      );
      if (!exists) {
        const isBug = issue.labels.some(
          (l) => l.name.toLowerCase() === 'bug' || l.name.toLowerCase() === 'error'
        );
        await db.insert(tasks).values({
          projectId: id,
          title: `#${issue.number}: ${issue.title}`,
          description: issue.body || `GitHub issue from ${parsed.owner}/${parsed.repo}`,
          priority: isBug ? 2 : 3,
          order: tasksCreated,
          status: 'todo',
        });
        tasksCreated++;
      }
    }

    // Sync open issues labeled as "blocker" or "blocked" as blockers
    const blockerIssues = issues.filter(
      (i) =>
        i.state === 'open' &&
        i.labels.some(
          (l) =>
            l.name.toLowerCase() === 'blocker' ||
            l.name.toLowerCase() === 'blocked' ||
            l.name.toLowerCase() === 'critical'
        )
    );

    for (const issue of blockerIssues.slice(0, 20)) {
      const existingBlockers = await db.query.blockers.findMany({
        where: eq(blockers.projectId, id),
      });
      const exists = existingBlockers.some(
        (b) => b.title === `#${issue.number}: ${issue.title}`
      );
      if (!exists) {
        const isHigh = issue.labels.some(
          (l) => l.name.toLowerCase() === 'critical'
        );
        await db.insert(blockers).values({
          projectId: id,
          title: `#${issue.number}: ${issue.title}`,
          description: issue.body || `GitHub issue from ${parsed.owner}/${parsed.repo}`,
          severity: isHigh ? 'high' : 'medium',
          status: 'open',
        });
        blockersCreated++;
      }
    }

    // Sync open PRs as blockers (PRs in review = blocked on review)
    const openPrs = prs.filter((p) => p.state === 'open');
    for (const pr of openPrs.slice(0, 20)) {
      const existingBlockers = await db.query.blockers.findMany({
        where: eq(blockers.projectId, id),
      });
      const exists = existingBlockers.some(
        (b) => b.title === `PR #${pr.number}: ${pr.title}`
      );
      if (!exists) {
        await db.insert(blockers).values({
          projectId: id,
          title: `PR #${pr.number}: ${pr.title}`,
          description: pr.body || `Pull request from ${parsed.owner}/${parsed.repo}`,
          severity: 'low',
          status: 'open',
        });
        blockersCreated++;
      }
    }

    // Update last synced time
    if (integration) {
      await db
        .update(githubIntegrations)
        .set({ lastSyncedAt: new Date() })
        .where(eq(githubIntegrations.projectId, id));
    }

    // Log activity
    await db.insert(activityLog).values({
      projectId: id,
      entityType: 'github_sync',
      action: 'sync',
      details: { tasksCreated, blockersCreated, issuesTotal: openIssues.length, prsTotal: openPrs.length },
    });

    return NextResponse.json({
      success: true,
      synced: {
        tasksCreated,
        blockersCreated,
        issuesTotal: openIssues.length,
        prsTotal: openPrs.length,
      },
    });
  } catch (err) {
    console.error('GitHub sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
