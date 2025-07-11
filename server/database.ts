import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

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
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
}

export async function getUserById(id: number) {
  const query = `SELECT * FROM users WHERE id = $1`;
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
  const query = `SELECT * FROM waitlist_entries ORDER BY created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
}