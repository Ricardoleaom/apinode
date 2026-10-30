import fastify from "fastify";
import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
  hasZodFastifySchemaValidationErrors,
} from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import scalarAPIReference from "@scalar/fastify-api-reference";
import { env } from "./env.ts";
import { db } from "./database/client.ts";
import { healthRoute } from "./routes/health.ts";
import { loginRoute } from "./routes/login.ts";
import { createCoursesRoute } from "./routes/create-courses.ts";
import { getCoursesRoute } from "./routes/get-courses.ts";
import { getCoursesByIdRoute } from "./routes/get-courses-by-id.ts";

const loggerByEnvironment = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

const server = fastify({
  logger: loggerByEnvironment[env.NODE_ENV],
}).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: "API de Cursos",
      description:
        "Gerenciamento de cursos com autenticação JWT e controle de acesso por perfil.",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
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

server.get("/", { schema: { hide: true } }, async (_request, reply) => {
  return reply.redirect("/docs");
});

server.register(healthRoute);
server.register(loginRoute);
server.register(createCoursesRoute);
server.register(getCoursesRoute);
server.register(getCoursesByIdRoute);

server.setNotFoundHandler((_request, reply) => {
  return reply.status(404).send({ message: "Rota não encontrada." });
});

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: "Dados inválidos.",
      issues: error.validation.map(({ instancePath, message }) => ({
        path: instancePath,
        message,
      })),
    });
  }

  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({ message: error.message });
  }

  // Erros inesperados vão para o log; o cliente não recebe detalhes internos.
  request.log.error(error);
  return reply.status(500).send({ message: "Erro interno do servidor." });
});

server.addHook("onClose", async () => {
  await db.$client.end();
});

export { server };
