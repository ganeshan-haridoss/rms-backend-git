import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import postgres from 'postgres';
import 'dotenv/config';

export const connection = postgres(process.env.DATABASE_URL as string, {
  max: 1,
});
export const db = drizzle(connection, { schema, logger: true });

export type db = typeof db;
export default db;
