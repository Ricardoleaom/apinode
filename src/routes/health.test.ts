import { beforeAll, expect, test } from "vitest";
import request from "supertest";
import { server } from "../app.ts";

beforeAll(async () => {
  await server.ready();
});

test("responde ok quando o banco está acessível", async () => {
  const response = await request(server.server).get("/health");

  expect(response.status).toEqual(200);
  expect(response.body).toEqual({ status: "ok" });
});

test("responde 404 em JSON para rotas inexistentes", async () => {
  const response = await request(server.server).get("/nao-existe");

  expect(response.status).toEqual(404);
  expect(response.body).toEqual({ message: "Rota não encontrada." });
});
