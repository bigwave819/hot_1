import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema"

// Global type declaration for TypeScript stability
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool = globalForDb.pool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
    max: 10,
    connectionTimeoutMillis: 5000,
});
pool.on('error', (err) => {
  console.error('Unexpected error on idle PG client', err);
});
// Save pool reference globally in development mode
if (process.env.NODE_ENV !== 'production') {
    globalForDb.pool = pool;
}export const db = drizzle(pool, { schema })

export async function getClient() {
    const client = await pool.connect()
    return client;
}
