import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { courses } from "../database/schema.ts";
import { z } from "zod";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";
import { checkUserRole } from "./hooks/check-user-role.ts";

export const createCoursesRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/courses",
    {
      preHandler: [checkRequestJWT, checkUserRole("instructor")],
      schema: {
        tags: ["Courses"],
        summary: "Create a course",
        description:
          "Essa rota recebe um titulo e cria um curso no banco de dados.",

        body: z.object({
          title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
        }),
        response: {
          201: z.object({
            courseId: z.string().uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const courseTitle = request.body.title;

      const result = await db
        .insert(courses)
        .values({ title: courseTitle })
        .returning();

      return reply.status(201).send({ courseId: result[0].id });
    }
  );
};

export default createCoursesRoute;
