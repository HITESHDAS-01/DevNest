import { NextResponse } from 'next/server';

export async function GET() {
  const debug: Record<string, unknown> = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
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

    // Test if users table exists
    const tableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
    );
    debug.usersTableExists = tableCheck.rows[0].exists;

    // Test if orgs table exists
    const orgCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations')"
    );
    debug.orgsTableExists = orgCheck.rows[0].exists;

    await pool.end();

    return NextResponse.json(debug);
  } catch (error: any) {
    debug.dbConnected = false;
    debug.error = error.message;
    debug.errorCode = error.code;
    debug.errorSeverity = error.severity;
    return NextResponse.json(debug, { status: 500 });
  }
}
