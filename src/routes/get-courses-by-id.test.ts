import { expect, test } from "vitest";
import request from "supertest";
import { server } from "../app.ts";
import { faker } from "@faker-js/faker";
import { makeCourse } from "../tests/factories/make-course.ts";
import { makeAuthenticatedUser } from "../tests/factories/make-user.ts";

test("get course by id", async () => {
  await server.ready();

  const { token } = await makeAuthenticatedUser("student");
  const course = await makeCourse();

  const response = await request(server.server)
    .get(`/courses/${course.id}`)
    .set("Authorization", token);

  expect(response.status).toEqual(200);
  expect(response.body).toEqual({
    course: {
      id: expect.any(String),
      title: expect.any(String),
      description: null,
    },
  });
});

test("return 404 for non existing courses", async () => {
  await server.ready();

  const { token } = await makeAuthenticatedUser("student");

  const response = await request(server.server)
    .get(`/courses/aebf5370-814b-11f0-b748-bb0670a41308`)
    .set("Authorization", token);

  expect(response.status).toEqual(404);
  expect(response.body).toEqual({
    error: "Course not found",
  });
});
