import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../database/client.ts";
import { courses } from "../database/schema.ts";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";
import { checkUserRole } from "./hooks/check-user-role.ts";

export const createCoursesRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/courses",
    {
      onRequest: [checkRequestJWT, checkUserRole("instructor")],
      schema: {
        tags: ["courses"],
        summary: "Create a course",
        description: "Cria um curso. Exclusivo para o perfil instructor.",
        security: [{ bearerAuth: [] }],
        body: z.object({
          title: z
            .string()
            .trim()
            .min(5, "O título deve ter pelo menos 5 caracteres")
            .max(120),
          description: z.string().trim().max(1000).optional(),
        }),
        response: {
          201: z.object({ courseId: z.uuid() }),
          409: z
            .object({ message: z.string() })
            .describe("Já existe um curso com esse título"),
        },
      },
    },
    async (request, reply) => {
      const { title, description } = request.body;

      // O título é único no banco; o conflito é resolvido no próprio INSERT,
      // sem consulta prévia e sem condição de corrida.
      const [course] = await db
        .insert(courses)
        .values({ title, description })
        .onConflictDoNothing({ target: courses.title })
        .returning({ id: courses.id });

      if (!course) {
        return reply
          .status(409)
          .send({ message: "Já existe um curso com esse título." });
      }

      return reply.status(201).send({ courseId: course.id });
    },
  );
};
