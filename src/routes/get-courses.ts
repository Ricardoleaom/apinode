import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ilike, asc, and, type SQL, eq, count } from "drizzle-orm";
import { z } from "zod";
import { db } from "../database/client.ts";
import { courses, enrollments } from "../database/schema.ts";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";
import { checkUserRole } from "./hooks/check-user-role.ts";

export const COURSES_PAGE_SIZE = 10;

export const getCoursesRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/courses",
    {
      onRequest: [checkRequestJWT, checkUserRole("instructor")],
      schema: {
        tags: ["courses"],
        summary: "List courses",
        description: `Lista os cursos com busca por título e paginação de ${COURSES_PAGE_SIZE} itens. Exclusivo para o perfil instructor.`,
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          search: z.string().min(2).max(100).optional(),
          orderBy: z.enum(["id", "title"]).optional().default("id"),
          page: z.coerce.number().int().min(1).optional().default(1),
        }),
        response: {
          200: z.object({
            courses: z.array(
              z.object({
                id: z.uuid(),
                title: z.string(),
                enrollments: z.number().describe("Número de matrículas"),
              }),
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
          .where(and(...conditions))
          .groupBy(courses.id)
          .orderBy(asc(orderByField))
          .limit(COURSES_PAGE_SIZE)
          .offset((page - 1) * COURSES_PAGE_SIZE),
        db.$count(courses, and(...conditions)),
      ]);

      return reply.send({ courses: result, total });
    },
  );
};
