import { defineConfig } from "vitest/config";
import { testDatabaseUrl } from "./src/tests/database-url.ts";

export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      DATABASE_URL: testDatabaseUrl,
      JWT_SECRET: "test-only-secret-que-nao-vale-fora-dos-testes",
    },
    globalSetup: ["./src/tests/global-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/tests/**", "src/@types/**"],
    },
  },
});
