import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { eq } from "drizzle-orm";
import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../database/client.ts";
import { users } from "../database/schema.ts";
import { env } from "../env.ts";

// Hash usado quando o e-mail não existe: a verificação roda do mesmo jeito,
// então o tempo de resposta não revela quais e-mails estão cadastrados.
const dummyPasswordHash = hash("senha-de-referencia-para-timing");

export const loginRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/sessions",
    {
      schema: {
        tags: ["auth"],
        summary: "Login",
        description:
          "Recebe e-mail e senha e devolve um token JWT válido por 1 hora.",
        body: z.object({
          email: z.email(),
          password: z
            .string()
            .min(6, "A senha deve ter pelo menos 6 caracteres"),
        }),
        response: {
          200: z.object({ token: z.string() }),
          401: z
            .object({ message: z.string() })
            .describe("Credenciais inválidas"),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      const passwordHash = user?.password ?? (await dummyPasswordHash);
      const doesPasswordMatch = await verify(passwordHash, password);

      if (!user || !doesPasswordMatch) {
        return reply.status(401).send({ message: "Credenciais inválidas." });
      }

      const token = jwt.sign(
        { sub: user.id, role: user.role },
        env.JWT_SECRET,
        {
          algorithm: "HS256",
          expiresIn: "1h",
        },
      );

      return reply.status(200).send({ token });
    },
  );
};
