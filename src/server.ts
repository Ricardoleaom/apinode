import { server } from "./app.ts";
import { env } from "./env.ts";

try {
  await server.listen({ port: env.PORT, host: "0.0.0.0" });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}

// Encerra as conexões abertas antes de sair (docker stop envia SIGTERM).
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await server.close();
    process.exit(0);
  });
}
