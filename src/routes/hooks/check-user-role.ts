import type { FastifyRequest, FastifyReply } from "fastify";
import { getAuthenticatedUserFromRequest } from "../../utils/get-authenticated-user-from-request.ts";

export function checkUserRole(role: "student" | "instructor") {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthenticatedUserFromRequest(request);

    if (user.role !== role) {
      return reply.status(403).send({ message: "Acesso negado." });
    }
  };
}
