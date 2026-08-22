import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

let _db: PostgresJsDatabase<typeof schema> | null = null;

function getDb(): PostgresJsDatabase<typeof schema> {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Add it to your .env.local file.\n' +
        'Example: DATABASE_URL="postgresql://user:password@localhost:5432/devnest"'
    );
  }

  // Dynamic imports so the module can be loaded without postgres installed
  // when DATABASE_URL is not set (e.g. during type-checking).
  const { default: postgres } = require('postgres');
  const { drizzle } = require('drizzle-orm/postgres-js');
  _db = drizzle(postgres(connectionString), { schema });
  return _db;
}

// Lazy proxy so `db` can be imported without immediate connection
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});

// Direct accessor for scripts that need a real connection immediately
export { getDb };
