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
  console.log("Dropping all existing tables and indexes in Neon PostgreSQL (Fresh Reset)...");

  await sql`DROP TABLE IF EXISTS action_logs CASCADE;`;
  await sql`DROP TABLE IF EXISTS wishlist_items CASCADE;`;
  await sql`DROP TABLE IF EXISTS daily_expenditures CASCADE;`;
  await sql`DROP TABLE IF EXISTS recurring_expenditures CASCADE;`;
  await sql`DROP TABLE IF EXISTS income_sources CASCADE;`;
  await sql`DROP TABLE IF EXISTS password_reset_tokens CASCADE;`;
  await sql`DROP TABLE IF EXISTS verification_tokens CASCADE;`;
  await sql`DROP TABLE IF EXISTS sessions CASCADE;`;
  await sql`DROP TABLE IF EXISTS accounts CASCADE;`;
  await sql`DROP TABLE IF EXISTS users CASCADE;`;

  console.log("Creating fresh database tables and indexes...");

  await sql`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      email_verified TIMESTAMP,
      password_hash TEXT,
      image TEXT,
      currency TEXT NOT NULL DEFAULT 'IDR',
      balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX users_email_idx ON users(email);`;

  await sql`
    CREATE TABLE accounts (
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
  await sql`CREATE INDEX accounts_user_id_idx ON accounts(user_id);`;

  await sql`
    CREATE TABLE sessions (
      session_token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires TIMESTAMP NOT NULL
    );
  `;
  await sql`CREATE INDEX sessions_user_id_idx ON sessions(user_id);`;

  await sql`
    CREATE TABLE verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires TIMESTAMP NOT NULL,
      PRIMARY KEY (identifier, token)
    );
  `;

  await sql`
    CREATE TABLE password_reset_tokens (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE income_sources (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL,
      source_type TEXT NOT NULL,
      frequency TEXT NOT NULL,
      date TIMESTAMP NOT NULL DEFAULT NOW(),
      last_processed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX income_sources_user_id_idx ON income_sources(user_id);`;
  await sql`CREATE INDEX income_sources_created_at_idx ON income_sources(created_at);`;

  await sql`
    CREATE TABLE recurring_expenditures (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL,
      category TEXT NOT NULL,
      billing_cycle TEXT NOT NULL,
      due_day_of_month INTEGER DEFAULT 1,
      last_processed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX recurring_expenditures_user_id_idx ON recurring_expenditures(user_id);`;
  await sql`CREATE INDEX recurring_expenditures_created_at_idx ON recurring_expenditures(created_at);`;

  await sql`
    CREATE TABLE daily_expenditures (
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
  await sql`CREATE INDEX daily_expenditures_user_id_idx ON daily_expenditures(user_id);`;
  await sql`CREATE INDEX daily_expenditures_created_at_idx ON daily_expenditures(created_at);`;
  await sql`CREATE INDEX daily_expenditures_date_idx ON daily_expenditures(date);`;

  await sql`
    CREATE TABLE wishlist_items (
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
  await sql`CREATE INDEX wishlist_items_user_id_idx ON wishlist_items(user_id);`;
  await sql`CREATE INDEX wishlist_items_created_at_idx ON wishlist_items(created_at);`;

  await sql`
    CREATE TABLE action_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action_type TEXT NOT NULL,
      description TEXT NOT NULL,
      metadata TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX action_logs_user_id_idx ON action_logs(user_id);`;
  await sql`CREATE INDEX action_logs_created_at_idx ON action_logs(created_at);`;
  await sql`CREATE INDEX action_logs_action_type_idx ON action_logs(action_type);`;

  console.log("Successfully reset and initialized fresh database in Neon PostgreSQL!");
}

main().catch((err) => {
  console.error("Fresh reset error:", err);
  process.exit(1);
});
