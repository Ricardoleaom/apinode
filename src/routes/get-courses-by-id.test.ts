import { beforeAll, describe, expect, test } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { server } from "../app.ts";
import { makeCourse } from "../tests/factories/make-course.ts";
import { makeAuthenticatedUser } from "../tests/factories/make-user.ts";

beforeAll(async () => {
  await server.ready();
});

describe("GET /courses/:id", () => {
  test("qualquer usuário autenticado vê o curso", async () => {
    const { authorization } = await makeAuthenticatedUser("student");
    const course = await makeCourse();

    const response = await request(server.server)
      .get(`/courses/${course.id}`)
      .set("Authorization", authorization);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      course: { id: course.id, title: course.title, description: null },
    });
  });

  test("curso inexistente responde 404", async () => {
    const { authorization } = await makeAuthenticatedUser("student");

    const response = await request(server.server)
      .get(`/courses/${randomUUID()}`)
      .set("Authorization", authorization);

    expect(response.status).toEqual(404);
    expect(response.body).toEqual({ message: "Curso não encontrado." });
  });

  test("id fora do formato UUID responde 400", async () => {
    const { authorization } = await makeAuthenticatedUser("student");

    const response = await request(server.server)
      .get("/courses/123")
      .set("Authorization", authorization);

    expect(response.status).toEqual(400);
  });

  test("sem token recebe 401", async () => {
    const course = await makeCourse();

    const response = await request(server.server).get(`/courses/${course.id}`);

    expect(response.status).toEqual(401);
  });
});
