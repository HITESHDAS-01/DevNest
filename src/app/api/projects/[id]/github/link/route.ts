import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { githubIntegrations, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { parseRepoUrl, fetchRepoInfo, verifyPAT } from '@/lib/github';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { repoUrl, pat } = body;

  if (!repoUrl) {
    return NextResponse.json({ error: 'repoUrl is required' }, { status: 400 });
  }

  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
  }

  // Check project exists
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // If PAT provided, verify it works
  let patUser: { login: string; avatar_url: string } | undefined;
  if (pat) {
    const verification = await verifyPAT(pat);
    if (!verification.valid) {
      return NextResponse.json({ error: 'Invalid Personal Access Token' }, { status: 400 });
    }
    patUser = verification.user;
  }

  // Try to fetch repo info (public repos work without auth, private need PAT)
  let repoInfo;
  try {
    repoInfo = await fetchRepoInfo(parsed.owner, parsed.repo, pat || undefined);
  } catch {
    return NextResponse.json(
      { error: 'Repository not found. If private, make sure your PAT has access.' },
      { status: 404 }
    );
  }

  // Update project
  await db
    .update(projects)
    .set({
      repoUrl: repoInfo.htmlUrl,
      githubPAT: pat || null,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));

  // Create or update github integration record
  const existing = await db.query.githubIntegrations.findFirst({
    where: eq(githubIntegrations.projectId, id),
  });

  if (existing) {
    await db
      .update(githubIntegrations)
      .set({
        repoOwner: parsed.owner,
        repoName: parsed.repo,
        lastSyncedAt: new Date(),
      })
      .where(eq(githubIntegrations.projectId, id));
  } else {
    await db.insert(githubIntegrations).values({
      projectId: id,
      repoOwner: parsed.owner,
      repoName: parsed.repo,
    });
  }

  return NextResponse.json({
    success: true,
    repo: {
      owner: parsed.owner,
      repo: parsed.repo,
      fullName: repoInfo.fullName,
      description: repoInfo.description,
      url: repoInfo.htmlUrl,
      language: repoInfo.language,
      stars: repoInfo.stargazersCount,
      openIssues: repoInfo.openIssuesCount,
      isPrivate: repoInfo.isPrivate,
    },
    user: patUser ? { login: patUser.login, avatarUrl: patUser.avatar_url } : null,
  });
}
