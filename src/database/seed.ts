import { fakerPT_BR as faker } from "@faker-js/faker";
import { hash } from "argon2";
import { db } from "./client.ts";
import { courses, enrollments, users } from "./schema.ts";

// Contas de demonstração com credenciais conhecidas, para testar pela /docs.
const DEMO_PASSWORD = "123456";

async function seed() {
  const passwordHash = await hash(DEMO_PASSWORD);

  await db
    .insert(users)
    .values([
      {
        name: "Instrutor Demo",
        email: "instrutor@exemplo.com",
        password: passwordHash,
        role: "instructor",
      },
      {
        name: "Aluno Demo",
        email: "aluno@exemplo.com",
        password: passwordHash,
        role: "student",
      },
    ])
    .onConflictDoNothing({ target: users.email });

  const students = await db
    .insert(users)
    .values(
      Array.from({ length: 8 }, () => ({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: passwordHash,
      })),
    )
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  const createdCourses = await db
    .insert(courses)
    .values(
      Array.from({ length: 12 }, () => ({
        title: faker.lorem.words(4),
        description: faker.lorem.sentence(),
      })),
    )
    .onConflictDoNothing({ target: courses.title })
    .returning({ id: courses.id });

  if (students.length > 0 && createdCourses.length > 0) {
    await db.insert(enrollments).values(
      students.map((student, index) => ({
        userId: student.id,
        courseId: createdCourses[index % createdCourses.length].id,
      })),
    );
  }

  console.log(
    `Seed concluído: ${students.length} alunos, ${createdCourses.length} cursos.`,
  );
  console.log(
    `Login de demonstração: instrutor@exemplo.com / ${DEMO_PASSWORD} (instructor), aluno@exemplo.com / ${DEMO_PASSWORD} (student)`,
  );
}

try {
  await seed();
} finally {
  await db.$client.end();
}
