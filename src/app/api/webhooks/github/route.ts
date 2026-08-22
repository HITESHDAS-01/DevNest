import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { githubIntegrations, tasks, blockers, activityLog } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyWebhookSignature } from '@/lib/github';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');
  const event = request.headers.get('x-github-event');
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  // Verify signature if secret is configured
  if (secret && !verifyWebhookSignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (!event) {
    return NextResponse.json({ error: 'Missing event header' }, { status: 400 });
  }

  try {
    const payload = JSON.parse(body);
    const repoFullName = payload.repository?.full_name;

    if (!repoFullName) {
      return NextResponse.json({ error: 'Missing repo info' }, { status: 400 });
    }

    const [owner, repo] = repoFullName.split('/');

    // Find all integrations for this repo
    const integrations = await db.query.githubIntegrations.findMany({
      where: eq(githubIntegrations.repoOwner, owner),
    });

    const repoIntegrations = integrations.filter((i) => i.repoName === repo);

    for (const integration of repoIntegrations) {
      await handleWebhookEvent(event, payload, integration.projectId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleWebhookEvent(
  event: string,
  payload: Record<string, unknown>,
  projectId: string
) {
  const issue = payload.issue as Record<string, unknown> | undefined;
  const pullRequest = payload.pull_request as Record<string, unknown> | undefined;
  const action = payload.action as string | undefined;

  switch (event) {
    case 'issues': {
      if (!issue) break;
      const issueNumber = issue.number as number;
      const issueTitle = issue.title as string;
      const issueBody = issue.body as string | null;
      const labels = ((issue.labels as { name: string }[]) || []).map((l) => l.name);

      if (action === 'opened' || action === 'reopened') {
        const isBug = labels.some((l) => l.toLowerCase() === 'bug');
        const isBlocker = labels.some(
          (l) => l.toLowerCase() === 'blocker' || l.toLowerCase() === 'critical'
        );

        if (isBlocker) {
          await db.insert(blockers).values({
            projectId,
            title: `#${issueNumber}: ${issueTitle}`,
            description: issueBody || '',
            severity: labels.includes('critical') ? 'high' : 'medium',
            status: 'open',
          });
        } else {
          await db.insert(tasks).values({
            projectId,
            title: `#${issueNumber}: ${issueTitle}`,
            description: issueBody || '',
            priority: isBug ? 2 : 3,
            order: 0,
            status: 'todo',
          });
        }
      } else if (action === 'closed') {
        const existingTasks = await db.query.tasks.findMany({
          where: eq(tasks.projectId, projectId),
        });
        const task = existingTasks.find((t) => t.title.startsWith(`#${issueNumber}:`));
        if (task) {
          await db.update(tasks).set({ status: 'done' }).where(eq(tasks.id, task.id));
        }
      }
      break;
    }

    case 'pull_request': {
      if (!pullRequest) break;
      const prNumber = pullRequest.number as number;
      const prTitle = pullRequest.title as string;

      if (action === 'opened' || action === 'reopened') {
        await db.insert(blockers).values({
          projectId,
          title: `PR #${prNumber}: ${prTitle}`,
          description: `Pull request needs review/merge`,
          severity: 'low',
          status: 'open',
        });
      } else if (action === 'closed' || action === 'merged') {
        const existingBlockers = await db.query.blockers.findMany({
          where: eq(blockers.projectId, projectId),
        });
        const blocker = existingBlockers.find((b) =>
          b.title.startsWith(`PR #${prNumber}:`)
        );
        if (blocker) {
          await db.update(blockers).set({ status: 'resolved' }).where(eq(blockers.id, blocker.id));
        }
      }
      break;
    }

    case 'push': {
      const commits = (payload.commits as { message: string }[]) || [];
      if (commits.length > 0) {
        await db.insert(activityLog).values({
          projectId,
          entityType: 'github_push',
          action: 'push',
          details: { commitCount: commits.length, message: commits[0].message.slice(0, 80) },
        });
      }
      break;
    }
  }
}
