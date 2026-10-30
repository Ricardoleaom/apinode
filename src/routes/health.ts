import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../database/client.ts";

export const healthRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/health",
    {
      schema: {
        tags: ["health"],
        summary: "Health check",
        description: "Confirma que a API está no ar e alcança o banco.",
        response: {
          200: z.object({ status: z.literal("ok") }),
          503: z.object({ status: z.literal("unavailable") }),
        },
      },
    },
    async (request, reply) => {
      try {
        await db.execute(sql`select 1`);
        return reply.status(200).send({ status: "ok" });
      } catch (error) {
        request.log.error(error, "banco indisponível no health check");
        return reply.status(503).send({ status: "unavailable" });
      }
    },
  );
};
