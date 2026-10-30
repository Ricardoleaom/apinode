import { runMigrations } from "../database/run-migrations.ts";
import { testDatabaseUrl } from "./database-url.ts";

export default async function setup() {
  await runMigrations(testDatabaseUrl);
}
