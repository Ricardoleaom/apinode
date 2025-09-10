import type {
  FastifyRequest,
  FastifyReply,
  DoneFuncWithErrOrRes,
} from "fastify";
import jwt from "jsonwebtoken";

type JWTPayload = {
  sub: string;
  role: "student" | "instructor";
};

export async function checkRequestJWT(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.headers.authorization;

  if (!token) {
    return reply.status(401).send();
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    request.user = payload;
  } catch (error) {
    return reply.status(401).send();
  }
}
