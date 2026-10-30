import { beforeAll, describe, expect, test } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { server } from "../app.ts";
import { makeAuthenticatedUser } from "../tests/factories/make-user.ts";
import { makeCourse } from "../tests/factories/make-course.ts";

beforeAll(async () => {
  await server.ready();
});

describe("POST /courses", () => {
  test("instrutor cria um curso", async () => {
    const { authorization } = await makeAuthenticatedUser("instructor");

    const response = await request(server.server)
      .post("/courses")
      .set("Authorization", authorization)
      .send({ title: `Curso ${randomUUID()}`, description: "Descrição" });

    expect(response.status).toEqual(201);
    expect(response.body).toEqual({ courseId: expect.any(String) });
  });

  test("recusa título já usado com 409", async () => {
    const { authorization } = await makeAuthenticatedUser("instructor");
    const course = await makeCourse();

    const response = await request(server.server)
      .post("/courses")
      .set("Authorization", authorization)
      .send({ title: course.title });

    expect(response.status).toEqual(409);
    expect(response.body).toEqual({
      message: "Já existe um curso com esse título.",
    });
  });

  test("aluno recebe 403", async () => {
    const { authorization } = await makeAuthenticatedUser("student");

    const response = await request(server.server)
      .post("/courses")
      .set("Authorization", authorization)
      .send({ title: `Curso ${randomUUID()}` });

    expect(response.status).toEqual(403);
  });

  test("sem token recebe 401", async () => {
    const response = await request(server.server)
      .post("/courses")
      .send({ title: `Curso ${randomUUID()}` });

    expect(response.status).toEqual(401);
  });

  test("autentica antes de validar o corpo: sem token e corpo inválido recebe 401", async () => {
    const response = await request(server.server)
      .post("/courses")
      .send({ title: "abc" });

    expect(response.status).toEqual(401);
  });

  test("token sem o prefixo Bearer recebe 401", async () => {
    const { authorization } = await makeAuthenticatedUser("instructor");

    const response = await request(server.server)
      .post("/courses")
      .set("Authorization", authorization.replace("Bearer ", ""))
      .send({ title: `Curso ${randomUUID()}` });

    expect(response.status).toEqual(401);
  });

  test("token assinado com outro segredo recebe 401", async () => {
    const forged =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      "eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDAiLCJyb2xlIjoiaW5zdHJ1Y3RvciJ9." +
      "c2lnbmF0dXJlLWZhbHNh";

    const response = await request(server.server)
      .post("/courses")
      .set("Authorization", `Bearer ${forged}`)
      .send({ title: `Curso ${randomUUID()}` });

    expect(response.status).toEqual(401);
  });

  test("valida o título com 400", async () => {
    const { authorization } = await makeAuthenticatedUser("instructor");

    const response = await request(server.server)
      .post("/courses")
      .set("Authorization", authorization)
      .send({ title: "abc" });

    expect(response.status).toEqual(400);
  });
});
