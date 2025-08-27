// MariaCecilia98@bol.com.br

import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { courses, users } from "../database/schema.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { verify } from "argon2"

export const loginRoute: FastifyPluginAsyncZod = async (server) => {
server.post("/sessions", {
  schema: {
    tags: ["auth"],
    summary: "Login",
    description: "Essa rota recebe um email e uma senha e cria uma sessão no banco de dados.",
    body: z.object({
      email: z.email(),
      password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    }),
    // response: {
    //   201: z.object({
    //     sessionId: z.string().uuid(),
    //   }),
    // },
  },
}, async (request, reply) => {
  const { email, password } = request.body;

  // Aqui você deve implementar a lógica de autenticação, como verificar o email e a senha no banco de dados.

  const result = await db.select()
  .from(users)
  .where(eq(users.email, email))

  if (result.length === 0) {
    return reply.status(400).send({ message: "Credencias Invalidas." });
  }

  const user = result[0]; // Substitua por uma lógica real de geração de ID de sessão.

  const doesPasswordMatch = await verify(user.password, password)

  if (!doesPasswordMatch) {
    return reply.status(400).send({ message: "Credenciais Inválidas." });
  }

  return reply.status(200).send({ message: "OK" });
});
}
