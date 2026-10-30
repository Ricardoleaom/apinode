import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../env.ts";

const tokenPayloadSchema = z.object({
  sub: z.uuid(),
  role: z.enum(["student", "instructor"]),
});

export async function checkRequestJWT(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const [scheme, token] = request.headers.authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return reply.status(401).send({ message: "Token ausente ou inválido." });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    request.user = tokenPayloadSchema.parse(payload);
  } catch {
    return reply.status(401).send({ message: "Token ausente ou inválido." });
  }
}
