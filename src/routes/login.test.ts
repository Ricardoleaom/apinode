import { beforeAll, describe, expect, test } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { server } from "../app.ts";
import { makeUser } from "../tests/factories/make-user.ts";

beforeAll(async () => {
  await server.ready();
});

describe("POST /sessions", () => {
  test("devolve um token com o id e o perfil do usuário", async () => {
    const { user, passwordBeforeHash } = await makeUser("instructor");

    const response = await request(server.server)
      .post("/sessions")
      .send({ email: user.email, password: passwordBeforeHash });

    expect(response.status).toEqual(200);
    expect(jwt.decode(response.body.token)).toMatchObject({
      sub: user.id,
      role: "instructor",
    });
  });

  test("recusa senha errada com 401", async () => {
    const { user } = await makeUser();

    const response = await request(server.server)
      .post("/sessions")
      .send({ email: user.email, password: "senha-errada" });

    expect(response.status).toEqual(401);
    expect(response.body).toEqual({ message: "Credenciais inválidas." });
  });

  test("responde igual para e-mail inexistente, sem revelar quem tem conta", async () => {
    const response = await request(server.server)
      .post("/sessions")
      .send({ email: "ninguem@example.com", password: "qualquer-senha" });

    expect(response.status).toEqual(401);
    expect(response.body).toEqual({ message: "Credenciais inválidas." });
  });

  test("valida o corpo da requisição com 400", async () => {
    const response = await request(server.server)
      .post("/sessions")
      .send({ email: "nao-e-email", password: "123" });

    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual("Dados inválidos.");
    expect(response.body.issues).toHaveLength(2);
  });
});
