import { randomUUID } from "node:crypto";
import { db } from "../../database/client.ts";
import { courses } from "../../database/schema.ts";

export async function makeCourse(title = `Curso ${randomUUID()}`) {
  const [course] = await db.insert(courses).values({ title }).returning();

  return course;
}
