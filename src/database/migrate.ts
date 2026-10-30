import { runMigrations } from "./run-migrations.ts";

// Só precisa do banco: roda sem JWT_SECRET, como etapa separada do deploy.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL não definida.");
  process.exit(1);
}

await runMigrations(databaseUrl);

console.log("Migrações aplicadas.");
