import { defineConfig } from 'drizzle-kit';
import { env } from '$env/dynamic/private';

export default defineConfig({
  schema:    './src/lib/db/schema.ts',
  out:       './drizzle',
  dialect:   'turso',
  dbCredentials: {
    url:       process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
