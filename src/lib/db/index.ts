// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { DATABASE_URL, DATABASE_AUTH_TOKEN } from '$env/static/private';
import * as schema from './schema';

// Singleton zodat de verbinding hergebruikt wordt
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    const client = createClient({
      url:       DATABASE_URL,
      authToken: DATABASE_AUTH_TOKEN,
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}
