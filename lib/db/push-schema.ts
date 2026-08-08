import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("DATABASE_URL is not defined in .env");
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  console.log("Pushing Drizzle tables to Neon PostgreSQL...");

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      email_verified TIMESTAMP,
      password_hash TEXT,
      image TEXT,
      currency TEXT NOT NULL DEFAULT 'USD',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      PRIMARY KEY (provider, provider_account_id)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      session_token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires TIMESTAMP NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires TIMESTAMP NOT NULL,
      PRIMARY KEY (identifier, token)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS income_sources (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL,
      source_type TEXT NOT NULL,
      frequency TEXT NOT NULL,
      date TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS recurring_expenditures (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL,
      category TEXT NOT NULL,
      billing_cycle TEXT NOT NULL,
      due_day_of_month INTEGER DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS daily_expenditures (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL,
      category TEXT NOT NULL,
      date TIMESTAMP NOT NULL DEFAULT NOW(),
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      target_price NUMERIC(12, 2) NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'saving',
      target_date TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS action_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action_type TEXT NOT NULL,
      description TEXT NOT NULL,
      metadata TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  console.log("Successfully created/verified all database tables in Neon PostgreSQL!");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
