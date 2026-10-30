// Banco de testes: o docker-compose.yml cria o desafio_test junto com o desafio.
// No CI (ou em outra máquina) basta definir TEST_DATABASE_URL.
export const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/desafio_test";
