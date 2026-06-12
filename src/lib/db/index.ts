import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  console.error('❌ [Database] DATABASE_URL is missing. Connection will fail.');
}

// Create Neon SQL client
const sql = neon(process.env.DATABASE_URL || '');

// Create Drizzle database client
export const db = drizzle(sql, { schema });

// Export types
export type Database = typeof db;
