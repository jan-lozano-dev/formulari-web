import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS registres (
      id SERIAL PRIMARY KEY,
      nom VARCHAR(255) NOT NULL,
      cognoms VARCHAR(255) NOT NULL,
      telefon INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}
