import { NextResponse } from 'next/server';

export async function GET() {
  const debug: Record<string, unknown> = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    const result = await pool.query('SELECT NOW() as time');
    debug.dbConnected = true;
    debug.dbTime = result.rows[0].time;

    // Check all tables
    const tables = ['users', 'organizations', 'members', 'projects', 'tasks', 'blockers', 'milestones', 'notes', 'decisions', 'ideas', 'maintenance_items', 'resources', 'activity_log', 'phases', 'github_integrations'];
    for (const table of tables) {
      const res = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)",
        [table]
      );
      debug[`${table}_exists`] = res.rows[0].exists;
    }

    // Count users
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    debug.userCount = parseInt(userCount.rows[0].count);

    // Count members
    const memberCount = await pool.query('SELECT COUNT(*) as count FROM members');
    debug.memberCount = parseInt(memberCount.rows[0].count);

    // Count orgs
    const orgCount = await pool.query('SELECT COUNT(*) as count FROM organizations');
    debug.orgCount = parseInt(orgCount.rows[0].count);

    await pool.end();

    return NextResponse.json(debug);
  } catch (error: any) {
    debug.dbConnected = false;
    debug.error = error.message;
    debug.errorCode = error.code;
    return NextResponse.json(debug, { status: 500 });
  }
}
