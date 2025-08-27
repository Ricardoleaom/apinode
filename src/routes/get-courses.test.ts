import { expect, test } from "vitest";
import request from "supertest";
import { server } from "../app.ts";
import { faker } from "@faker-js/faker";
import { makeCourse } from "../tests/factories/make-course.ts";
import { randomUUID } from "node:crypto";

test("get course", async () => {
  await server.ready();

  const titleId = randomUUID();

  const course = await makeCourse(titleId);

  const response = await request(server.server).get(
    `/courses?search=${titleId}`
  );

  expect(response.status).toEqual(200);
  expect(response.body).toEqual({
    total: 1,
    courses: [
      {
        id: expect.any(String),
        title: expect.any(String),
        enrollments: 0,
      },
    ],
  });
});

test("return 404 for non existing courses", async () => {
  await server.ready();

  const response = await request(server.server).get(
    `/courses/ecc165b9-7a0b-4a40-a2d0-a38670395034`
  );

  expect(response.status).toEqual(404);
});
