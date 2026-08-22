import 'dotenv/config';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set. Add it to your .env.local file.');
    process.exit(1);
  }

  // Dynamic imports to avoid circular deps and keep startup fast
  const postgres = (await import('postgres')).default;
  const { drizzle } = await import('drizzle-orm/postgres-js');
  const schema = await import('./schema');

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log('Seeding database...');

  // ── Organization ──
  const [org] = await db
    .insert(schema.organizations)
    .values({
      name: 'DevNest Labs',
      slug: 'devnest-labs',
      plan: 'pro',
      settings: { theme: 'dark', notifications: true },
    })
    .returning();
  console.log(`  ✓ Organization: ${org.name}`);

  // ── User ──
  const [user] = await db
    .insert(schema.users)
    .values({
      email: 'dev@devnest.app',
      name: 'Dev Nest',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    })
    .returning();
  console.log(`  ✓ User: ${user.email}`);

  // ── Membership ──
  await db.insert(schema.members).values({
    orgId: org.id,
    userId: user.id,
    role: 'owner',
  });
  console.log('  ✓ Membership created');

  // ── Projects ──
  const projectData = [
    {
      name: 'TaskFlow',
      slug: 'taskflow',
      description: 'Lightweight project tracker for solo developers and small teams.',
      color: '#8b5cf6',
      icon: 'check-circle',
      repoUrl: 'https://github.com/devnest-labs/taskflow',
      stage: 'development',
      status: 'active',
      health: 'green',
      priority: 1,
      progress: 62,
      memoryPurpose: 'Ship a minimal but polished task management app.',
      memoryProblem: 'Existing tools are bloated for small-team workflows.',
      memoryDecisions: 'Use SQLite for now, migrate to Postgres later.',
      memoryKnownIssues: 'No offline support yet.',
      memoryFuturePlans: 'Add offline mode and mobile companion.',
      startedAt: new Date('2026-01-15'),
      targetLaunchAt: new Date('2026-04-01'),
    },
    {
      name: 'DevNest',
      slug: 'devnest',
      description: 'Internal dashboard for managing all DevNest projects and team health.',
      color: '#6366f1',
      icon: 'layout-dashboard',
      repoUrl: 'https://github.com/devnest-labs/devnest',
      stage: 'development',
      status: 'active',
      health: 'yellow',
      priority: 2,
      progress: 45,
      memoryPurpose: 'Central hub for project visibility across the org.',
      memoryProblem: 'No single place to see project status, blockers, and milestones.',
      memoryDecisions: 'Next.js + Drizzle + Postgres stack.',
      memoryKnownIssues: 'Auth not wired up yet.',
      memoryFuturePlans: 'Add Slack and GitHub integrations.',
      startedAt: new Date('2026-02-01'),
      targetLaunchAt: new Date('2026-06-01'),
    },
    {
      name: 'SiteGen',
      slug: 'sitegen',
      description: 'AI-powered landing page builder for marketing teams.',
      color: '#f59e0b',
      icon: 'globe',
      repoUrl: 'https://github.com/devnest-labs/sitegen',
      stage: 'planning',
      status: 'active',
      health: 'green',
      priority: 3,
      progress: 15,
      memoryPurpose: 'Let marketers self-serve landing pages without engineering.',
      memoryProblem: 'Every landing page change requires a dev cycle.',
      memoryDecisions: 'Use a visual editor approach instead of raw HTML.',
      memoryKnownIssues: 'Still evaluating editor frameworks.',
      memoryFuturePlans: 'A/B testing support, analytics dashboard.',
      startedAt: new Date('2026-03-10'),
    },
    {
      name: 'APIProxy',
      slug: 'apiproxy',
      description: 'Lightweight API gateway for rate limiting, caching, and auth.',
      color: '#ef4444',
      icon: 'shield',
      repoUrl: 'https://github.com/devnest-labs/apiproxy',
      stage: 'testing',
      status: 'paused',
      health: 'red',
      priority: 4,
      progress: 80,
      memoryPurpose: 'Unify API access with a thin proxy layer.',
      memoryProblem: 'Need rate limiting and caching without heavy infra.',
      memoryDecisions: 'Go-based proxy for performance.',
      memoryKnownIssues: 'Memory leak under high concurrency, under investigation.',
      memoryFuturePlans: 'Add OpenAPI spec generation.',
      startedAt: new Date('2025-11-01'),
      targetLaunchAt: new Date('2026-02-15'),
    },
  ];

  const projects = [];
  for (const data of projectData) {
    const [project] = await db
      .insert(schema.projects)
      .values({ ...data, orgId: org.id, createdBy: user.id })
      .returning();
    projects.push(project);
    console.log(`  ✓ Project: ${project.name}`);
  }

  // ── Tasks ──
  const taskData = [
    // TaskFlow
    { projectId: projects[0].id, title: 'Design database schema', status: 'done', priority: 1, order: 1, tags: ['backend'] },
    { projectId: projects[0].id, title: 'Build task CRUD API', status: 'done', priority: 1, order: 2, tags: ['backend'] },
    { projectId: projects[0].id, title: 'Create task list UI', status: 'in_progress', priority: 1, order: 3, tags: ['frontend'] },
    { projectId: projects[0].id, title: 'Add drag-and-drop reordering', status: 'todo', priority: 2, order: 4, tags: ['frontend'] },
    { projectId: projects[0].id, title: 'Write integration tests', status: 'backlog', priority: 3, order: 5, tags: ['testing'] },

    // DevNest
    { projectId: projects[1].id, title: 'Set up Drizzle + Postgres', status: 'done', priority: 1, order: 1, tags: ['backend', 'infra'] },
    { projectId: projects[1].id, title: 'Build org/project dashboard', status: 'in_progress', priority: 1, order: 2, tags: ['frontend'] },
    { projectId: projects[1].id, title: 'Implement auth flow', status: 'todo', priority: 1, order: 3, tags: ['auth'] },
    { projectId: projects[1].id, title: 'Create blocker/notes modules', status: 'todo', priority: 2, order: 4, tags: ['frontend'] },

    // SiteGen
    { projectId: projects[2].id, title: 'Research visual editor options', status: 'done', priority: 1, order: 1, tags: ['research'] },
    { projectId: projects[2].id, title: 'Prototype page builder UI', status: 'in_progress', priority: 1, order: 2, tags: ['frontend'] },
    { projectId: projects[2].id, title: 'Define template schema', status: 'todo', priority: 2, order: 3, tags: ['design'] },

    // APIProxy
    { projectId: projects[3].id, title: 'Implement rate limiter', status: 'done', priority: 1, order: 1, tags: ['backend'] },
    { projectId: projects[3].id, title: 'Add response caching', status: 'done', priority: 1, order: 2, tags: ['backend'] },
    { projectId: projects[3].id, title: 'Fix memory leak under load', status: 'todo', priority: 1, order: 3, tags: ['bug', 'critical'] },
    { projectId: projects[3].id, title: 'Load testing with k6', status: 'in_progress', priority: 2, order: 4, tags: ['testing'] },
  ];

  for (const data of taskData) {
    await db.insert(schema.tasks).values(data);
  }
  console.log(`  ✓ Tasks: ${taskData.length} created`);

  // ── Blockers ──
  const blockerData = [
    { projectId: projects[1].id, title: 'Auth provider SDK has breaking changes', severity: 'high', status: 'open', description: 'Waiting on vendor to release patch.' },
    { projectId: projects[3].id, title: 'Memory leak in Go proxy goroutines', severity: 'critical', status: 'open', description: 'Heap profile shows uncleared request contexts.' },
    { projectId: projects[0].id, title: 'Drag-and-drop library lacks touch support', severity: 'medium', status: 'open', description: 'Need mobile-friendly alternative.' },
  ];
  for (const data of blockerData) {
    await db.insert(schema.blockers).values(data);
  }
  console.log(`  ✓ Blockers: ${blockerData.length} created`);

  // ── Notes ──
  const noteData = [
    { projectId: projects[1].id, title: 'Architecture Decision Record', content: 'Using Next.js 16 App Router with server components for the dashboard.', tags: ['architecture'], pinned: true },
    { projectId: projects[0].id, title: 'Competitive Research', content: 'Compared Linear, Plane, and Todoist. Our edge: minimal setup, keyboard-first.', tags: ['research'] },
    { projectId: projects[3].id, title: 'Go Proxy Profiling Notes', content: 'pprof shows goroutine leak in HTTP handler. Context not cancelled on client disconnect.', tags: ['debugging'] },
  ];
  for (const data of noteData) {
    await db.insert(schema.notes).values(data);
  }
  console.log(`  ✓ Notes: ${noteData.length} created`);

  // ── Decisions ──
  const decisionData = [
    {
      projectId: projects[1].id,
      title: 'Use Drizzle ORM over Prisma',
      context: 'Need type-safe queries with minimal overhead and good migration support.',
      options: ['Drizzle ORM', 'Prisma', 'TypeORM', 'Kysely'],
      chosen: 'Drizzle ORM',
      rationale: 'Lightweight, SQL-like API, excellent Postgres support, no code generation step.',
    },
    {
      projectId: projects[0].id,
      title: 'SQLite for v1, Postgres later',
      context: 'Want zero-config local dev experience for solo/small-team use case.',
      options: ['SQLite', 'Postgres', 'MySQL'],
      chosen: 'SQLite',
      rationale: 'Zero setup, perfect for local-first tool. Drizzle abstracts the switch later.',
    },
  ];
  for (const data of decisionData) {
    await db.insert(schema.decisions).values(data);
  }
  console.log(`  ✓ Decisions: ${decisionData.length} created`);

  // ── Milestones ──
  const milestoneData = [
    { projectId: projects[0].id, name: 'v0.1 Alpha', targetDate: '2026-03-01', status: 'completed', order: 1 },
    { projectId: projects[0].id, name: 'v0.5 Beta', targetDate: '2026-03-20', status: 'active', order: 2 },
    { projectId: projects[1].id, name: 'MVP Launch', targetDate: '2026-05-01', status: 'active', order: 1 },
    { projectId: projects[2].id, name: 'Prototype Ready', targetDate: '2026-04-15', status: 'pending', order: 1 },
  ];
  for (const data of milestoneData) {
    await db.insert(schema.milestones).values(data);
  }
  console.log(`  ✓ Milestones: ${milestoneData.length} created`);

  console.log('\nSeeding complete! 🌱');
  await client.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
