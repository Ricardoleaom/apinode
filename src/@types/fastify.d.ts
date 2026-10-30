import "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    user?: {
      sub: string;
      role: "student" | "instructor";
    };
  }
}
