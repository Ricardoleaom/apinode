import { beforeAll, describe, expect, test } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { server } from "../app.ts";
import { db } from "../database/client.ts";
import { enrollments } from "../database/schema.ts";
import { makeCourse } from "../tests/factories/make-course.ts";
import {
  makeAuthenticatedUser,
  makeUser,
} from "../tests/factories/make-user.ts";
import { COURSES_PAGE_SIZE } from "./get-courses.ts";

beforeAll(async () => {
  await server.ready();
});

describe("GET /courses", () => {
  test("busca pelo título e conta as matrículas", async () => {
    const { authorization } = await makeAuthenticatedUser("instructor");
    const course = await makeCourse();
    const { user: student } = await makeUser("student");
    await db
      .insert(enrollments)
      .values({ userId: student.id, courseId: course.id });

    const response = await request(server.server)
      .get("/courses")
      .query({ search: course.title })
      .set("Authorization", authorization);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      total: 1,
      courses: [{ id: course.id, title: course.title, enrollments: 1 }],
    });
  });

  test("pagina sem repetir nem pular cursos", async () => {
    const { authorization } = await makeAuthenticatedUser("instructor");
    const prefix = randomUUID();
    const totalCourses = COURSES_PAGE_SIZE + 3;

    for (let index = 0; index < totalCourses; index++) {
      await makeCourse(`${prefix} ${String(index).padStart(2, "0")}`);
    }

    const fetchPage = (page: number) =>
      request(server.server)
        .get("/courses")
        .query({ search: prefix, orderBy: "title", page })
        .set("Authorization", authorization);

    const [firstPage, secondPage] = await Promise.all([
      fetchPage(1),
      fetchPage(2),
    ]);

    expect(firstPage.body.total).toEqual(totalCourses);
    expect(firstPage.body.courses).toHaveLength(COURSES_PAGE_SIZE);
    expect(secondPage.body.courses).toHaveLength(3);

    const titles = [...firstPage.body.courses, ...secondPage.body.courses].map(
      (course: { title: string }) => course.title,
    );
    expect(new Set(titles).size).toEqual(totalCourses);
    expect(titles).toEqual([...titles].sort());
  });

  test("recusa página menor que 1 com 400", async () => {
    const { authorization } = await makeAuthenticatedUser("instructor");

    const response = await request(server.server)
      .get("/courses")
      .query({ page: 0 })
      .set("Authorization", authorization);

    expect(response.status).toEqual(400);
  });

  test("aluno recebe 403", async () => {
    const { authorization } = await makeAuthenticatedUser("student");

    const response = await request(server.server)
      .get("/courses")
      .set("Authorization", authorization);

    expect(response.status).toEqual(403);
  });
});
