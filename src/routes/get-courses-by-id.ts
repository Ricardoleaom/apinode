import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../database/client.ts";
import { courses } from "../database/schema.ts";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";

export const getCoursesByIdRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/courses/:id",
    {
      onRequest: [checkRequestJWT],
      schema: {
        tags: ["courses"],
        summary: "Get course by ID",
        description:
          "Busca um curso pelo ID. Aberto a qualquer usuário autenticado.",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: z.object({
            course: z.object({
              id: z.uuid(),
              title: z.string(),
              description: z.string().nullable(),
            }),
          }),
          404: z
            .object({ message: z.string() })
            .describe("Curso não encontrado"),
        },
      },
    },
    async (request, reply) => {
      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, request.params.id));

      if (!course) {
        return reply.status(404).send({ message: "Curso não encontrado." });
      }

      return reply.send({ course });
    },
  );
};
