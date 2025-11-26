import { Pool, PoolConfig } from 'pg';
import 'dotenv/config.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

/**
 * Use a single Pool instance across HMR/serverless invocations.
 * Keep connections warm and limit new connections with sensible defaults.
 * Toggle SSL via env if needed:
 *  - DATABASE_SSL=false -> disable SSL (useful for local Postgres)
 *  - otherwise defaults to SSL with rejectUnauthorized: false (common on managed providers)
 */
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },

  // Pool tuning
  max: Number(process.env.PGPOOL_MAX ?? 10), // max concurrent connections in the pool
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT ?? 30_000), // how long a client can remain idle before being closed
  connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT ?? 5_000), // time to wait before timing out when connecting a new client

  // Keep TCP connections alive to reduce churn
  keepAlive: true,
  keepAliveInitialDelayMillis: Number(process.env.PG_KEEPALIVE_DELAY ?? 10_000),

  // Keep pool alive (don’t exit when idle)
  allowExitOnIdle: false
};

// Persist the Pool across module reloads (dev HMR) and warm serverless invocations.
const globalForPg = globalThis as unknown as {
  pgPool?: Pool;
};

export const pool: Pool = globalForPg.pgPool ?? new Pool(poolConfig);

if (!globalForPg.pgPool) {
  globalForPg.pgPool = pool;

  // Log errors coming from idle clients in the pool
  pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err);
  });

  // Optional: one-time connectivity probe to fail fast at startup (won’t create extra pools)
  if (process.env.NODE_ENV !== 'test') {
    pool
      .query('SELECT 1')
      .catch((err) => {
        console.error('PostgreSQL initial connectivity check failed:', err);
      });
  }
}

// Database functions
export async function createUser(email: string, password: string, firstName?: string, lastName?: string) {
  const query = `
    INSERT INTO users (email, username, password, first_name, last_name, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING id, email, username, first_name, last_name, created_at, updated_at
  `;
  const result = await pool.query(query, [email, email, password, firstName, lastName]);
  return result.rows[0];
}

export async function getUserByEmail(email: string) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
}

export async function getUserById(id: number) {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

export async function createWaitlistEntry(name: string, email: string, college?: string, confusion?: string) {
  const query = `
    INSERT INTO waitlist_entries (name, email, college, confusion, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *
  `;
  const result = await pool.query(query, [name, email, college, confusion]);
  return result.rows[0];
}

export async function getWaitlistEntries() {
  const query = 'SELECT * FROM waitlist_entries ORDER BY created_at DESC';
  const result = await pool.query(query);
  return result.rows;
}

export async function createResetToken(email: string, token: string, expiry: Date) {
  await pool.query(
    'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
    [token, expiry, email]
  );
}

export async function getUserByResetToken(token: string) {
  const result = await pool.query(
    'SELECT id, email, username, first_name, last_name FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
    [token]
  );
  return result.rows[0];
}

export async function updatePassword(userId: number, hashedPassword: string) {
  await pool.query(
    'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
    [hashedPassword, userId]
  );
}
