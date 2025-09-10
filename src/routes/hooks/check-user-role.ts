import type {
  FastifyRequest,
  FastifyReply,
  DoneFuncWithErrOrRes,
} from "fastify";
import jwt from "jsonwebtoken";
import { getAuthenticatedUserFromRequest } from "../../utils/get-authenticated-user-from-request.ts";

type JWTPayload = {
  sub: string;
  role: "student" | "instructor";
};

export function checkUserRole(role: "student" | "instructor") {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthenticatedUserFromRequest(request);

    if (user.role !== role) {
      return reply.status(401).send();
    }
  };
}
