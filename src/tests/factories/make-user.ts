import { faker } from "@faker-js/faker";
import { hash } from "argon2";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { db } from "../../database/client.ts";
import { users } from "../../database/schema.ts";
import { env } from "../../env.ts";

type Role = "student" | "instructor";

export async function makeUser(role: Role = "student") {
  const passwordBeforeHash = randomUUID();

  const [user] = await db
    .insert(users)
    .values({
      name: faker.person.fullName(),
      email: `${randomUUID()}@example.com`,
      password: await hash(passwordBeforeHash),
      role,
    })
    .returning();

  return { user, passwordBeforeHash };
}

export async function makeAuthenticatedUser(role: Role) {
  const { user } = await makeUser(role);

  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    algorithm: "HS256",
  });

  return { user, authorization: `Bearer ${token}` };
}
