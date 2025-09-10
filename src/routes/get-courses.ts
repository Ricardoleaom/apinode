import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { courses, enrollments } from "../database/schema.ts";
import { ilike, asc, and, type SQL, eq, count } from "drizzle-orm";
import { z } from "zod";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";
import { checkUserRole } from "./hooks/check-user-role.ts";

export const getCoursesRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/courses",
    {
      preHandler: [checkRequestJWT, checkUserRole("instructor")],
      schema: {
        tags: ["Courses"],
        summary: "Get all courses",
        querystring: z.object({
          search: z.string().min(2).max(100).optional(),
          orderBy: z.enum(["id", "title"]).optional().default("id"),
          page: z.coerce.number().optional().default(1),
        }),
        description:
          "Essa rota retorna todos os cursos cadastrados no banco de dados.",
        response: {
          200: z.object({
            courses: z.array(
              z.object({
                id: z.uuid(),
                title: z.string(),
                enrollments: z
                  .number()
                  .default(0)
                  .describe("Número de matrículas"),
              })
            ),
            total: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { search, orderBy, page } = request.query;

      const conditions: SQL[] = [];

      if (search) {
        conditions.push(ilike(courses.title, `%${search}%`));
      }

      // Definir o campo de ordenação de forma type-safe
      const orderByField = orderBy === "title" ? courses.title : courses.id;

      const [result, total] = await Promise.all([
        db
          .select({
            id: courses.id,
            title: courses.title,
            enrollments: count(enrollments.id),
          })
          .from(courses)
          .leftJoin(enrollments, eq(enrollments.courseId, courses.id))
          .orderBy(asc(orderByField))
          .offset((page - 1) * 2)
          .limit(10)
          .where(and(...conditions))
          .groupBy(courses.id),
        db.$count(courses, and(...conditions)),
      ]);

      return reply.send({ courses: result, total });
    }
  );
};

export default getCoursesRoute;
