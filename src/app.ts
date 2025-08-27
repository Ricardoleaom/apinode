import fastify from "fastify";
import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { createCoursesRoute } from "./routes/create-courses.ts";
import { getCoursesRoute } from "./routes/get-courses.ts";
import { getCoursesByIdRoute } from "./routes/get-courses-by-id.ts";
import scalarAPIReference from "@scalar/fastify-api-reference";
import { loginRoute } from "./routes/login.ts";

const server = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
}).withTypeProvider<ZodTypeProvider>();

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Desafio Node.js",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

server.register(scalarAPIReference, {
  routePrefix: "/docs",
  configuration: {
    theme: "kepler",
  },
});

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Rota raiz que redireciona para a documentação
server.get("/", async (request, reply) => {
  return reply.redirect("/docs");
});

server.register(createCoursesRoute);
server.register(getCoursesRoute);
server.register(getCoursesByIdRoute);
server.register(loginRoute);

export { server };
