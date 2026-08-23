import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Cache the pool across hot reloads in dev
const globalForPool = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool =
  globalForPool.pool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== 'production') globalForPool.pool = pool;

export const db = drizzle(pool, { schema });
