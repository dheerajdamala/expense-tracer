import {neon} from '@neondatabase/serverless';
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

console.log('Initializing database connection...');
export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  try {
    console.log('Testing database connection...');
    await sql`SELECT 1`;
    console.log('Database connection successful');

    console.log('Creating transactions table if not exists...');
    await sql`CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`;
    
    console.log('Creating index on user_id...');
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`;
    
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error; // Let the server handle the error
  }
}