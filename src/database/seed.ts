import { fakerPT_BR as faker } from "@faker-js/faker";
import { db } from "./client.ts";
import { hash } from "argon2";
import { courses, enrollments, users } from "./schema.ts";

async function seed() {
  const passwordHash = await hash("123456");

  const userInsert = await db
    .insert(users)
    .values([
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHash,
        role: "student",
      },
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHash,
        role: "student",
      },
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHash,
        role: "student",
      },
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHash,
        role: "student",
      },
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHash,
        role: "student",
      },
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHash,
        role: "student",
      },
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHash,
        role: "student",
      },
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHash,
        role: "student",
      },
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHash,
        role: "student",
      },
    ])
    .returning();

  const coursesInsert = await db
    .insert(courses)
    .values([
      { title: faker.lorem.words(4), description: faker.internet.email() },
      { title: faker.lorem.words(4), description: faker.internet.email() },
      { title: faker.lorem.words(4), description: faker.internet.email() },
    ])
    .returning();

  await db.insert(enrollments).values([
    { userId: userInsert[0].id, courseId: coursesInsert[0].id },
    { userId: userInsert[1].id, courseId: coursesInsert[1].id },
    { userId: userInsert[2].id, courseId: coursesInsert[2].id },
  ]);
}

seed();
