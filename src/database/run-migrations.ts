import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

export async function runMigrations(databaseUrl: string) {
  const db = drizzle(databaseUrl);

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
  } finally {
    await db.$client.end();
  }
}
